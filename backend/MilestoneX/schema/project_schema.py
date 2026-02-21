from pydantic import BaseModel
from typing import List, Optional
from .milestone_schema import Milestone

class Task(BaseModel):
    task_name: str
    timeline_days: int
    status: Optional[str] = None
    sequence: Optional[int] = None

class TaskEpic(BaseModel):
    epic_name: str
    description: str
    tasks: List[Task]


class ProjectAnalysisResponse(BaseModel):
    epics: List[TaskEpic]
    milestones: List[Milestone]
    # epics_tasks_rag: List[dict]