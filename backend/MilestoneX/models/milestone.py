from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))

    name = Column(String)
    description = Column(Text)
    tasks = Column(Text) # Stored as JSON string

    project = relationship("Project", back_populates="milestones")
