from fastapi import APIRouter, UploadFile, File, HTTPException
from ..services.pdf_services import PDFService
from ..services.project_service import ProjectService
from ..schema.project_schema import ProjectAnalysisResponse
from ..services.allocation_service import AllocationService
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.project import Project
from ..models.task import Task
from fastapi import Depends
from ..schema.teams import AllocationRequest
from AI_Backend.ai_allocation_generator import TaskAllocator
import json

router = APIRouter()


@router.post(
    "/analyze-project",
    response_model=ProjectAnalysisResponse
)
async def analyze_project(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    try:
        # 1️⃣ Extract SRS
        extracted_text = await PDFService.extract_text(file)

        if not extracted_text:
            raise HTTPException(
                status_code=400,
                detail="Empty PDF"
            )

        # 2️⃣ Generate AI Output
        result = ProjectService.analyze_project(extracted_text)

        # 3️⃣ Create Project
        project = Project(srs_text=extracted_text)
        db.add(project)
        db.commit()
        db.refresh(project)

        # 4️⃣ Store Tasks
        for epic in result["epics"]:

            for task in epic["tasks"]:

                task_name = task.get("task_name", "").strip()
                timeline = task.get("timeline_days", 0)

                # 🔥 Filter invalid AI tasks
                if not task_name or int(timeline) <= 0:
                    continue

                db_task = Task(
                    project_id=project.id,
                    epic_name=epic["epic_name"],   # ✅ correct field
                    description=epic["description"],
                    task_name=task_name,
                    timeline_days=int(timeline),
                    assigned_to=None,
                    status="pending"
                )

                db.add(db_task)

        db.commit()

        # 5️⃣ Fetch stored tasks
        stored_tasks = db.query(Task).filter(
            Task.project_id == project.id
        ).all()

        # 6️⃣ Build response matching TaskResponse schema
        from collections import defaultdict

        epic_map = defaultdict(lambda: {
            "epic_name": "",
            "description": "",
            "tasks": []
        })

        for t in stored_tasks:
            epic_map[t.epic_name]["epic_name"] = t.epic_name
            epic_map[t.epic_name]["description"] = t.description

            epic_map[t.epic_name]["tasks"].append({
                "task_name": t.task_name,
                "timeline_days": t.timeline_days,
                "status": t.status
            })

        epics_response = list(epic_map.values())

        # 7️⃣ Return correct structure
        return {
            "project_id": project.id,
            "epics": epics_response,
            "milestones": result["milestones"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/allocate/{project_id}")
async def allocate_project_tasks(
    project_id: int,
    payload: AllocationRequest,
    db: Session = Depends(get_db)
):

    tasks = db.query(Task).filter(Task.project_id == project_id).all()

    if not tasks:
        return {
            "project_id": project_id,
            "allocation": [],
            "message": "No tasks found for this project"
        }

    tasks_payload = [
    {
        "id": t.id,
        "task_name": t.task_name,
        "timeline_days": t.timeline_days,
        "epic_name": t.epic_name
    }
        for t in tasks
    ]

    team_payload = [member.dict() for member in payload.team]

    allocation_result = AllocationService.allocate(
        team_payload,
        tasks_payload
    )

    # Extract actual list
    assignments = []

    if isinstance(allocation_result, dict):
        assignments = allocation_result.get("task_assignments", [])
    elif isinstance(allocation_result, list):
        assignments = allocation_result

    # Update DB
    for alloc in assignments:
        db_task = db.query(Task).filter(
            Task.project_id == project_id,
            Task.id == alloc.get("id")
        ).first()

        if db_task:
            db_task.assigned_to = alloc.get("assigned_to")

    db.commit()

    return {
        "project_id": project_id,
        "allocation": allocation_result
    }