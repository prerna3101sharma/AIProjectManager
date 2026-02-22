from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))

    epic_name = Column(String)
    description = Column(Text)
    task_name = Column(String)
    timeline_days = Column(Integer)

    assigned_to = Column(String, nullable=True)
    status = Column(String, default="pending") 

    project = relationship("Project", back_populates="tasks")