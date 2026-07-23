from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
from ..services.pdf_services import PDFService
from ..services.project_service import ProjectService
from ..schema.project_schema import ProjectAnalysisResponse
from ..services.allocation_service import AllocationService
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.project import Project
from ..models.task import Task
from ..models.milestone import Milestone
from ..models.team_member import TeamMember
from ..schema.teams import AllocationRequest
from AI_Backend.ai_allocation_generator import TaskAllocator
import json
from .auth import get_current_user
from ..models.user import User
router = APIRouter()


@router.post(
    "/analyze-project",
    response_model=ProjectAnalysisResponse
)
async def analyze_project(
    project_name: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Tier enforcement: free tier users can only have 1 project
    if current_user.tier == "free":
        project_count = db.query(Project).filter(Project.user_id == current_user.id).count()
        if project_count >= 1:
            raise HTTPException(
                status_code=403, 
                detail="Free tier is limited to 1 project. Please upgrade to premium to create more projects."
            )

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
        project = Project(name=project_name, srs_text=extracted_text, user_id=current_user.id)
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

        # Store Milestones
        for m in result.get("milestones", []):
            db_milestone = Milestone(
                project_id=project.id,
                name=m.get("name", ""),
                description=m.get("description", ""),
                tasks=json.dumps(m.get("tasks", []))
            )
            db.add(db_milestone)
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

@router.get("/check")
async def check_project(
    project_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.name == project_name, Project.user_id == current_user.id).first()
    if not project:
        return {"exists": False}
        
    # Fetch stored tasks
    stored_tasks = db.query(Task).filter(Task.project_id == project.id).all()
    
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
            "id": t.id,
            "task_name": t.task_name,
            "timeline_days": t.timeline_days,
            "status": t.status,
            "assigned_to": t.assigned_to
        })

    epics_response = list(epic_map.values())

    # Fetch stored milestones
    stored_milestones = db.query(Milestone).filter(Milestone.project_id == project.id).all()
    milestones_response = [
        {
            "name": m.name,
            "description": m.description,
            "tasks": json.loads(m.tasks) if m.tasks else []
        }
        for m in stored_milestones
    ]

    # Fetch stored team
    stored_team = db.query(TeamMember).filter(TeamMember.project_id == project.id).all()
    team_response = [
        {
            "name": m.name,
            "role": m.role,
            "skills": json.loads(m.skills) if m.skills and m.skills.startswith("[") else [s.strip() for s in (m.skills or "").split(",") if s.strip()],
            "availability_days": m.availability_days
        }
        for m in stored_team
    ]

    return {
        "exists": True,
        "project_id": project.id,
        "epics": epics_response,
        "milestones": milestones_response,
        "team": team_response
    }

@router.get("/latest")
async def get_latest_project(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.id.desc()).first()
    if not project:
        return {"exists": False}
        
    stored_tasks = db.query(Task).filter(Task.project_id == project.id).all()
    
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
            "id": t.id,
            "task_name": t.task_name,
            "timeline_days": t.timeline_days,
            "status": t.status,
            "assigned_to": t.assigned_to
        })

    epics_response = list(epic_map.values())

    stored_milestones = db.query(Milestone).filter(Milestone.project_id == project.id).all()
    milestones_response = [
        {
            "name": m.name,
            "description": m.description,
            "tasks": json.loads(m.tasks) if m.tasks else []
        }
        for m in stored_milestones
    ]

    stored_team = db.query(TeamMember).filter(TeamMember.project_id == project.id).all()
    team_response = [
        {
            "name": m.name,
            "role": m.role,
            "skills": json.loads(m.skills) if m.skills and m.skills.startswith("[") else [s.strip() for s in (m.skills or "").split(",") if s.strip()],
            "availability_days": m.availability_days
        }
        for m in stored_team
    ]

    return {
        "exists": True,
        "project_id": project.id,
        "epics": epics_response,
        "milestones": milestones_response,
        "team": team_response
    }

@router.post("/allocate/{project_id}")
async def allocate_project_tasks(
    project_id: int,
    payload: AllocationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify ownership
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")

    # Store team members in DB
    db.query(TeamMember).filter(TeamMember.project_id == project_id).delete()
    for member in payload.team:
        db_member = TeamMember(
            project_id=project_id,
            name=member.name,
            role=member.role,
            skills=json.dumps(member.skills),
            availability_days=member.availability_days
        )
        db.add(db_member)
    db.commit()

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

@router.get("/all")
async def get_all_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    projects = db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.id.desc()).all()
    return [{"id": p.id, "name": p.name} for p in projects]

@router.get("/{project_id}")
async def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    stored_tasks = db.query(Task).filter(Task.project_id == project.id).all()
    
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
            "id": t.id,
            "task_name": t.task_name,
            "timeline_days": t.timeline_days,
            "status": t.status,
            "assigned_to": t.assigned_to
        })

    epics_response = list(epic_map.values())

    stored_milestones = db.query(Milestone).filter(Milestone.project_id == project.id).all()
    milestones_response = [
        {
            "name": m.name,
            "description": m.description,
            "tasks": json.loads(m.tasks) if m.tasks else []
        }
        for m in stored_milestones
    ]

    stored_team = db.query(TeamMember).filter(TeamMember.project_id == project.id).all()
    team_response = [
        {
            "name": m.name,
            "role": m.role,
            "skills": json.loads(m.skills) if m.skills and m.skills.startswith("[") else [s.strip() for s in (m.skills or "").split(",") if s.strip()],
            "availability_days": m.availability_days
        }
        for m in stored_team
    ]

    return {
        "exists": True,
        "project_id": project.id,
        "epics": epics_response,
        "milestones": milestones_response,
        "team": team_response
    }