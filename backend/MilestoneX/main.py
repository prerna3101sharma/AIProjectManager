from fastapi import FastAPI
from .api import upload

app = FastAPI(title="AI Project Manager Backend")


app.include_router(upload.router, prefix="/api")

@app.get("/")
def index():
    return {"message": "Hello, World!"}