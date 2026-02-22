from pydantic import BaseModel
from typing import Optional

class TaskCreate(BaseModel):
    epic_name: str
    description: Optional[str] = None
    task_name: str
    timeline_days: int


class TaskUpdate(BaseModel):
    epic_name: Optional[str] = None
    description: Optional[str] = None
    task_name: Optional[str] = None
    timeline_days: Optional[int] = None
    assigned_to: Optional[str] = None
    status: Optional[str] = None


class TaskResponse(BaseModel):
    id: int
    project_id: int
    epic_name: str
    description: Optional[str]
    task_name: str
    timeline_days: int
    assigned_to: Optional[str]
    status: str

    class Config:
        from_attributes = True