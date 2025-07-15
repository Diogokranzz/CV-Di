from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional, Any
import uuid

class AgentCapability(str, Enum):
    GENERIC_TEXT_PROCESSING = "generic_text_processing"
    WEB_SEARCH = "web_search"
    CODE_GENERATION = "code_generation"

class RegisterAgentRequest(BaseModel):
    agent_id: str = Field(default_factory=lambda: f"agent-{uuid.uuid4().hex[:8]}")
    capabilities: List[AgentCapability]
    endpoint: str

class GeneralResponse(BaseModel):
    success: bool
    message: str

# --- NOVOS MODELOS PARA TAREFAS ---
class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILURE = "failure"

class Task(BaseModel):
    task_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    task_type: AgentCapability
    params: dict

class TaskResult(BaseModel):
    task_id: str
    status: TaskStatus
    result: Optional[Any] = None
    error_message: Optional[str] = None