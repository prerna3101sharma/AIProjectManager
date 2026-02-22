from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from ..database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    srs_text = Column(Text)

    tasks = relationship("Task", back_populates="project")