import uvicorn
import pika
import json
import os
import redis
import time
import asyncio
import traceback
from fastapi import FastAPI, APIRouter, HTTPException, Body, Path
from typing import Dict, List, Any
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

from mcp_protocol import (
    RegisterAgentRequest, GeneralResponse, AgentCapability,
    Task, TaskResult, TaskStatus
)

# --- Configuração ---
AGENT_REGISTRY: Dict[str, RegisterAgentRequest] = {}
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
TASK_EXCHANGE = 'task_exchange'

# A API Key agora é lida do ambiente, que foi preenchido pelo load_dotenv().
# A linha `os.environ["GROQ_API_KEY"] = "..."` foi removida.

redis_client = redis.Redis(host=REDIS_HOST, port=6379, db=0, decode_responses=True)

app = FastAPI(
    title="Orion MCP - Agent Manager & Orchestrator", 
    version="0.5.1",
    description="Servidor para registrar, orquestrar e delegar planos de tarefas complexas a agentes de IA."
)

# --- Funções Internas ---
def dispatch_task_internal(task: Task) -> str:
    try:
        task_result = TaskResult(task_id=task.task_id, status=TaskStatus.PENDING)
        redis_client.set(f"task:{task.task_id}", task_result.model_dump_json())
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
        channel = connection.channel()
        channel.exchange_declare(exchange=TASK_EXCHANGE, exchange_type='direct')
        channel.basic_publish(
            exchange=TASK_EXCHANGE, routing_key=task.task_type.value,
            body=task.model_dump_json(), properties=pika.BasicProperties(delivery_mode=2)
        )
        connection.close()
        print(f"Sub-tarefa '{task.task_id}' despachada.")
        return task.task_id
    except Exception as e:
        print(f"Erro ao despachar sub-tarefa: {e}")
        raise

async def await_task_completion(task_id: str, timeout: int = 120) -> TaskResult:
    start_time = time.time()
    while time.time() - start_time < timeout:
        result_json = redis_client.get(f"task:{task_id}")
        if result_json:
            result = TaskResult.model_validate_json(result_json)
            if result.status in [TaskStatus.SUCCESS, TaskStatus.FAILURE]:
                return result
        await asyncio.sleep(2)
    raise TimeoutError(f"A tarefa {task_id} excedeu o tempo limite.")

# --- Endpoints da API ---
router_v1 = APIRouter(prefix="/api/v1", tags=["API v1"])

@app.get("/", include_in_schema=False)
def read_root():
    return {"message": "Bem-vindo ao Agent Manager! Acesse /docs."}

@router_v1.post("/register", response_model=GeneralResponse)
def register_agent(payload: RegisterAgentRequest):
    AGENT_REGISTRY[payload.agent_id] = payload
    print(f"Agente registrado: {payload.agent_id}")
    return GeneralResponse(success=True, message=f"Agent {payload.agent_id} registered.")

@router_v1.get("/agents", response_model=List[RegisterAgentRequest])
def get_registered_agents():
    return list(AGENT_REGISTRY.values())

@router_v1.post("/tasks", response_model=Task, status_code=202)
def dispatch_task_endpoint(task_type: AgentCapability = Body(...), params: Dict[str, Any] = Body(...)):
    task = Task(task_type=task_type, params=params)
    dispatch_task_internal(task)
    return task

@router_v1.get("/tasks/{task_id}", response_model=TaskResult)
def get_task_status(task_id: str = Path(..., description="O ID da tarefa.")):
    result_json = redis_client.get(f"task:{task_id}")
    if not result_json:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskResult.model_validate_json(result_json)

# --- Endpoint do Orquestrador ---
@router_v1.post("/orchestrate", response_model=List[TaskResult], tags=["Orchestrator"])
async def orchestrate_goal(
    goal: str = Body(..., description="O objetivo de alto nível.", embed=True)
):
    from litellm import completion
    
    system_prompt = f"""You are a JSON API. You only output valid, minified JSON.
Your task is to convert a user's goal into a JSON object with a single key "plan", which is a list of tasks.
Each task object must have "task_type" and "params".
Available task_type values are: {', '.join([e.value for e in AgentCapability])}.
DO NOT write any text, explanation, or markdown formatting.
"""
    
    user_prompt_example = """User Goal: "Write a python function to get a website title, then show an example for google.com"
Your Output: {"plan":[{"task_type":"code_generation","params":{"prompt":"Write a Python function named get_website_title that takes a URL and uses the requests and BeautifulSoup libraries to return the page title."}},{"task_type":"code_generation","params":{"prompt":"Now, write a Python code snippet that imports the get_website_title function and calls it with the URL 'https://www.google.com', then prints the result."}}]}"""

    print(f"Orquestrando objetivo: '{goal}'")
    try:
        print("Entrando em contato com o modelo de IA para gerar o plano...")
        response = completion(
            model="groq/llama3-8b-8192",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt_example},
                {"role": "user", "content": f"User Goal: \"{goal}\"\nYour Output:"}
            ]
        )
        plan_str = response.choices[0].message.content.strip()
        print(f"--- Resposta Bruta da IA ---\n{plan_str}\n--------------------------")
        
        plan_data = json.loads(plan_str)
        plan = plan_data.get("plan")
        
        if not plan or not isinstance(plan, list):
             raise ValueError("O plano gerado pela IA é inválido.")

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"A IA retornou um JSON inválido: {plan_str}")
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Falha ao gerar plano de IA: {e}")

    final_results: List[TaskResult] = []
    print(f"Plano de IA gerado com {len(plan)} passos.")
    
    for i, step in enumerate(plan):
        print(f"Executando Passo {i+1}/{len(plan)}: {step['task_type']}")
        task_to_dispatch = Task(task_type=step['task_type'], params=step['params'])
        try:
            task_id = dispatch_task_internal(task_to_dispatch)
            result = await await_task_completion(task_id)
            final_results.append(result)
            if result.status == TaskStatus.FAILURE:
                print("Passo falhou. Interrompendo orquestração.")
                break
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erro ao executar o passo {i+1}: {e}")
            
    return final_results

app.include_router(router_v1)