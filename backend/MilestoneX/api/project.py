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
from AI_Backend.ai_allocation_generator import allocate_tasks

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

        # 3️⃣ Create Project in DB
        project = Project(
            srs_text=extracted_text
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        # 4️⃣ Store Tasks in DB
        for epic in result["epics"]:
            for task in epic["tasks"]:
                db_task = Task(
                    project_id=project.id,
                    epic_name=epic["epic_name"],
                    description=epic["description"],
                    task_name=task["task_name"],
                    timeline_days=task["timeline_days"],
                    assigned_to=None
                )
                db.add(db_task)

        db.commit()

        # 5️⃣ Return response + project_id
        return {
            "project_id": project.id,
            "epics": result["epics"],
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
    """
    Accept team details from frontend.
    Fetch project tasks.
    Send tasks + team to AI.
    Return AI response directly.
    """

    # 1️⃣ Fetch tasks from DB
    tasks = db.query(Task).filter(Task.project_id == project_id).all()

    if not tasks:
        return {
            "project_id": project_id,
            "allocation": [],
            "message": "No tasks found for this project"
        }

    # 2️⃣ Convert DB tasks to structured JSON
    tasks_payload = [
        {
            "task_name": t.task_name,
            "timeline_days": t.timeline_days,
            "epic_name": t.epic_name
        }
        for t in tasks
    ]

    team_payload = [member.dict() for member in payload.team]

    # 3️⃣ Call AI layer
    ai_response = AllocationService.allocate(
        tasks_payload,
        team_payload
    )
    print("🎉 TASK Payload: "+str(tasks_payload))

    # 4️⃣ Return AI response directly
    return {
        "project_id": project_id,
        "allocation": ai_response
    }