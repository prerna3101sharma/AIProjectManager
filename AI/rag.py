import re
import json
import random
import ollama

# --- Simple RAG Implementation ---
class SimpleRAG:
    def __init__(self, srs_text):
        # Split SRS into chunks (sentences)
        self.chunks = [line.strip() for line in srs_text.split('.') if line.strip()]

    def retrieve_all(self):
        # Return all chunks (better than top-k)
        return self.chunks

# --- Kanban JSON Generator using RAG + LLM ---
def generate_kanban_tasks_rag_ollama(srs_text: str):
    # Initialize RAG
    rag = SimpleRAG(srs_text)

    # Retrieve **all chunks** for LLM
    retrieved_text = " ".join(rag.retrieve_all())

    # Prompt for Ollama LLM
    prompt = f"""
You are a professional software project manager.

From the following SRS, generate JSON array of epics with tasks.

Rules:
1. Each epic must have fields: "epic_name", "description", "tasks"
2. Each task must have fields: "task_name", "timeline_days", "status", "sequence"
3. Tasks initially go into "Backlog", sequence in order
4. Use **all SRS lines** to generate as many tasks as possible
5. Keep timeline_days realistic (1-5 days)
6. Output only JSON, no extra text

SRS:
{retrieved_text}
"""

    # --- Ollama call ---
    try:
        response = ollama.chat(
            model="phi3:mini",
            messages=[{"role": "user", "content": prompt}]
        )
        raw_output = response["message"]["content"].strip()

        # Extract JSON array
        match = re.search(r'\[.*\]', raw_output, re.DOTALL)
        if match:
            json_output = match.group()
            epics_tasks = json.loads(json_output)
        else:
            epics_tasks = []
    except Exception as e:
        print("LLM call failed, using fallback generator:", e)
        epics_tasks = []

    # --- Fallback generator if LLM fails ---
    if not epics_tasks:
        tasks = []
        for i, line in enumerate(rag.chunks):
            tasks.append({
                "task_name": line.strip()[:120],
                "timeline_days": random.randint(1,5),
                "status": "Backlog",
                "sequence": i+1
            })
        epics_tasks = [{
            "epic_name": "Auto Epic from SRS",
            "description": "Generated epic using RAG from SRS.txt",
            "tasks": tasks
        }]

    # Ensure all tasks have required fields
    for epic in epics_tasks:
        for i, task in enumerate(epic.get("tasks", [])):
            if "timeline_days" not in task:
                task["timeline_days"] = random.randint(1,5)
            if "status" not in task:
                task["status"] = "Backlog"
            if "sequence" not in task:
                task["sequence"] = i+1

    return epics_tasks

# --- Main ---
if __name__ == "__main__":
    # Read SRS from file
    with open("srs.txt", "r", encoding="utf-8") as f:
        srs_content = f.read()

    kanban_json = generate_kanban_tasks_rag_ollama(srs_content)
    
    # Print JSON ready for Kanban
    print(json.dumps(kanban_json, indent=2))