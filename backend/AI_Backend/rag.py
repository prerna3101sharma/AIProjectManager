import re
import json
import random
import ollama

class SimpleRAG:
    def __init__(self, srs_text):
        self.chunks = [line.strip() for line in srs_text.split('.') if line.strip() and not line.strip().isdigit()]

    def retrieve_all(self):
        return self.chunks

def generate_clean_epics_tasks(srs_text: str):
    rag = SimpleRAG(srs_text)
    retrieved_text = " ".join(rag.retrieve_all())

    # --- Strong prompt for Ollama ---
    prompt = f"""
You are a professional software project manager.

Task:
Convert the following SRS into **multiple epics** with structured tasks.

Rules:
1. Each epic must have fields: "epic_name", "description", "tasks"
2. Each task must have fields: "task_name", "timeline_days", "status", "sequence"
3. Group related SRS lines into separate epics based on module/feature
4. Ignore numbers, bullets, empty lines
5. Tasks initially go into "Backlog", sequence in order
6. Keep timeline_days realistic (1-5 days)
7. Output clean, parseable JSON ONLY
8. Generate as many meaningful tasks as possible

SRS:
{retrieved_text}
"""

    # --- Ollama call ---
    epics_tasks = []
    try:
        response = ollama.chat(
            model="phi3:mini",
            messages=[{"role": "user", "content": prompt}]
        )
        raw_output = response["message"]["content"].strip()
        match = re.search(r'\[.*\]', raw_output, re.DOTALL)
        if match:
            epics_tasks = json.loads(match.group())
    except Exception as e:
        print("LLM failed, using fallback:", e)

    # --- Fallback generator if LLM fails or returns empty ---
    if not epics_tasks:
        # Heuristic: split SRS into logical epics by keywords
        epics_keywords = {
            "User Management": ["user", "registration", "login", "profile", "password"],
            "Admin Dashboard": ["admin", "report", "dashboard"],
            "Content Management": ["content", "edit", "upload"],
            "Deployment": ["deploy", "cloud", "server"]
        }
        # Assign lines to epics
        epics_tasks_dict = {k: [] for k in epics_keywords}
        other_tasks = []
        for line in rag.chunks:
            assigned = False
            for epic_name, keywords in epics_keywords.items():
                if any(kw.lower() in line.lower() for kw in keywords):
                    epics_tasks_dict[epic_name].append(line)
                    assigned = True
                    break
            if not assigned:
                other_tasks.append(line)

        epics_tasks = []
        for epic_name, tasks_list in epics_tasks_dict.items():
            if tasks_list:
                tasks = []
                for i, t in enumerate(tasks_list):
                    tasks.append({
                        "task_name": t[:120],
                        "timeline_days": random.randint(1,5),
                        "status": "Backlog",
                        "sequence": i+1
                    })
                epics_tasks.append({
                    "epic_name": epic_name,
                    "description": f"Tasks related to {epic_name}",
                    "tasks": tasks
                })
        # Any leftover tasks
        if other_tasks:
            tasks = []
            for i, t in enumerate(other_tasks):
                tasks.append({
                    "task_name": t[:120],
                    "timeline_days": random.randint(1,5),
                    "status": "Backlog",
                    "sequence": i+1
                })
            epics_tasks.append({
                "epic_name": "Other Features",
                "description": "Miscellaneous tasks",
                "tasks": tasks
            })

    # Ensure all tasks have timeline/status/sequence
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
    with open("srs.txt", "r", encoding="utf-8") as f:
        srs_content = f.read()

    epics_tasks_json = generate_clean_epics_tasks(srs_content)
    print(json.dumps(epics_tasks_json, indent=2))