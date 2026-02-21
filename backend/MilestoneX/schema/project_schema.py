from pydantic import BaseModel
from typing import List
from .milestone_schema import Milestone

class Task(BaseModel):
    task_name: str
    timeline_days: int

class TaskEpic(BaseModel):
    epic_name: str
    description: str
    tasks: List[Task]


class ProjectAnalysisResponse(BaseModel):
    epics: List[TaskEpic]
    milestones: List[Milestone]