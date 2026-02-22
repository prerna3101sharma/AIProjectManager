from MilestoneX.database import SessionLocal
from MilestoneX.models.project import Project
from MilestoneX.models.task import Task

db = SessionLocal()

projects = db.query(Project).all()
tasks = db.query(Task).all()

print("\nProjects:")
for p in projects:
    print("ID:", p.id, "| SRS length:", len(p.srs_text))

print("\nTasks:")
for t in tasks:
    print(
        "ID:", t.id,
        "| Project:", t.project_id,
        "| Epic:", t.epic_name,
        "| Task:", t.task_name,
        "| Days:", t.timeline_days,
        "| Assigned:", t.assigned_to
    )