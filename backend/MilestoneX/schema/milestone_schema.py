from pydantic import BaseModel
from typing import List


class Milestone(BaseModel):
    name: str
    description: str
    timeline_days: int


class MilestoneRequest(BaseModel):
    text: str


class MilestoneResponse(BaseModel):
    milestones: List[Milestone]