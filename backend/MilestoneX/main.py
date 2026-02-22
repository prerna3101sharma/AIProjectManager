from fastapi import FastAPI
from .api import upload, milestones
from .api import project as project_api
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from .models import project, task

project.Base.metadata.create_all(bind=engine)
app = FastAPI(title="AI Project Manager Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(
    milestones.router,
    prefix="/api",
    tags=["Milestones"]
)
app.include_router(project_api.router, prefix="/api", tags=["Project"])

@app.get("/")
def index():
    return {"message": "Hello, World!"}