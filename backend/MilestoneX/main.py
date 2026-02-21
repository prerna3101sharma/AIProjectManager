from fastapi import FastAPI
from .api import upload
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="AI Project Manager Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")

@app.get("/")
def index():
    return {"message": "Hello, World!"}