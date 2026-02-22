from pydantic import BaseModel
from typing import List, Optional
from .milestone_schema import Milestone

# class Task(BaseModel):
#     task_name: str
#     timeline_days: int
#     status: Optional[str] = None
#     sequence: Optional[int] = None

# class TaskEpic(BaseModel):
#     epic_name: str
#     description: str
#     tasks: List[Task]

# class TaskResponse(BaseModel):
#     id: int
#     task_name: str
#     timeline_days: int
#     epic_name: str
#     assigned_to: Optional[str] = None
#     status: str

class TaskNested(BaseModel):
    task_name: str
    timeline_days: int
    status: str


class EpicResponse(BaseModel):
    epic_name: str
    description: str
    tasks: List[TaskNested]


class ProjectAnalysisResponse(BaseModel):
    project_id: int
    epics: List[EpicResponse]
    milestones: List[Milestone]
