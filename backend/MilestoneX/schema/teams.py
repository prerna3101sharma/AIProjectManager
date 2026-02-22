from pydantic import BaseModel
from typing import List


class TeamMember(BaseModel):
    name: str
    role: str
    skills: List[str]
    availability_days: int = None


class Task(BaseModel):
    title: str
    required_skill: str
    estimated_hours: int

class AllocationRequest(BaseModel):
    team: List[TeamMember]