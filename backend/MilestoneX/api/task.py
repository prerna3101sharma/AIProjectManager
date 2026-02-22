from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schema.task_schema import TaskCreate, TaskResponse, TaskUpdate
from ..models.task import Task
from ..database import get_db


router = APIRouter()

@router.post("/projects/{project_id}/tasks", response_model=TaskResponse)
def create_task(
    project_id: int,
    payload: TaskCreate,
    db: Session = Depends(get_db)
):
    task = Task(
        project_id=project_id,
        epic_name=payload.epic_name,
        description=payload.description,
        task_name=payload.task_name,
        timeline_days=payload.timeline_days,
        status="pending"
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task

@router.get("/projects/{project_id}/tasks", response_model=list[TaskResponse])
def get_project_tasks(project_id: int, db: Session = Depends(get_db)):

    tasks = db.query(Task).filter(Task.project_id == project_id).all()

    return tasks

@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):

    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task

@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for key, value in payload.dict(exclude_unset=True).items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)

    return task

@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):

    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}