from pydantic import BaseModel
from typing import List, Optional
from .milestone_schema import Milestone

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
