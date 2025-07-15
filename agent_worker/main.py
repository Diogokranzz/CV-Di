import requests
import pika
import json
import time
import os
import redis
from bs4 import BeautifulSoup
from litellm import completion
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

from mcp_protocol import (
    RegisterAgentRequest, AgentCapability, Task, TaskResult, TaskStatus
)

# --- Configuração ---
MANAGER_API_URL = "http://localhost:8000/api/v1"
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
TASK_EXCHANGE = 'task_exchange'

# A linha `os.environ["GROQ_API_KEY"] = "..."` foi removida.
# A chave de API será lida automaticamente do ambiente pelo litellm.

redis_client = redis.Redis(host=REDIS_HOST, port=6379, db=0)

# --- Lógica de Tarefas Reais ---
def do_web_search(params: dict) -> str:
    url = params.get("url")
    if not url:
        raise ValueError("URL não fornecida para web_search")
    print(f"Buscando na web: {url}...")
    response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')
    return soup.title.string if soup.title else "Nenhum título encontrado."

def do_generic_text_processing(params: dict) -> str:
    text = params.get("text")
    if not text:
        raise ValueError("Texto não fornecido para processamento")
    print(f"Processando texto: '{text}'...")
    return text[::-1]

def do_code_generation(params: dict) -> str:
    prompt = params.get("prompt")
    if not prompt:
        raise ValueError("Prompt não fornecido para a geração de código")
    
    print(f"Gerando código para o prompt: '{prompt}'...")
    
    response = completion(
        model="groq/llama3-8b-8192", 
        messages=[{"content": prompt, "role": "user"}]
    )
    
    generated_code = response.choices[0].message.content
    return generated_code

TASK_HANDLERS = {
    AgentCapability.WEB_SEARCH: do_web_search,
    AgentCapability.GENERIC_TEXT_PROCESSING: do_generic_text_processing,
    AgentCapability.CODE_GENERATION: do_code_generation,
}

# --- Lógica do Worker ---
def process_task(body: bytes):
    task = Task.model_validate_json(body)
    print(f"\n[TASK RECEIVED] ID: {task.task_id}, Tipo: {task.task_type.value}")
    
    running_status = TaskResult(task_id=task.task_id, status=TaskStatus.RUNNING)
    redis_client.set(f"task:{task.task_id}", running_status.model_dump_json())

    try:
        handler = TASK_HANDLERS.get(task.task_type)
        if not handler:
            raise NotImplementedError(f"Nenhum handler para o tipo de tarefa {task.task_type.value}")
        
        result_data = handler(task.params)
        time.sleep(1)
        
        final_status = TaskResult(
            task_id=task.task_id,
            status=TaskStatus.SUCCESS,
            result=result_data
        )
        print(f"[TASK COMPLETED] ID: {task.task_id}. Resultado: {str(result_data)[:100]}...")

    except Exception as e:
        print(f"[TASK FAILED] ID: {task.task_id}. Erro: {e}")
        final_status = TaskResult(
            task_id=task.task_id,
            status=TaskStatus.FAILURE,
            error_message=str(e)
        )
    
    redis_client.set(f"task:{task.task_id}", final_status.model_dump_json())

def callback(ch, method, properties, body):
    process_task(body)
    ch.basic_ack(delivery_tag=method.delivery_tag)

def start_consuming(agent_capabilities: list[AgentCapability]):
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST, heartbeat=600, blocked_connection_timeout=300))
    channel = connection.channel()
    channel.exchange_declare(exchange=TASK_EXCHANGE, exchange_type='direct')
    print("Agente pronto para receber tarefas. Pressione CTRL+C para sair.")
    for capability in agent_capabilities:
        queue_name = f"{capability.value}_queue"
        channel.queue_declare(queue=queue_name, durable=True)
        channel.queue_bind(exchange=TASK_EXCHANGE, queue=queue_name, routing_key=capability.value)
        print(f" - Escutando por tarefas '{capability.value}'")
        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue=queue_name, on_message_callback=callback)
    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        print("Finalizando...")
        connection.close()

def main():
    my_capabilities = [
        AgentCapability.GENERIC_TEXT_PROCESSING,
        AgentCapability.WEB_SEARCH,
        AgentCapability.CODE_GENERATION, 
    ]
    payload = RegisterAgentRequest(capabilities=my_capabilities, endpoint="http://127.0.0.1:4000")
    print(f"Iniciando worker {payload.agent_id}...")
    try:
        requests.post(f"{MANAGER_API_URL}/register", json=payload.model_dump())
        print("Agente registrado!")
        start_consuming(my_capabilities)
    except requests.exceptions.ConnectionError:
        print(f"Manager inalcançável em {MANAGER_API_URL}.")
    except Exception as e:
        print(f"Ocorreu um erro durante a inicialização: {e}")

if __name__ == "__main__":
    main()