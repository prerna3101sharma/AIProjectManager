from pydantic import BaseModel
from typing import List


class TeamMember(BaseModel):
    name: str
    skills: List[str]
    availability_hours: int


class Task(BaseModel):
    title: str
    required_skill: str
    estimated_hours: int