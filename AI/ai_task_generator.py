import openrouter
import re
import json
import random

def generate_kanban_tasks_openrouter(srs_text: str):
    client = openrouter.Client(api_key="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")

    prompt = f"""
You are a professional software project manager.
Convert the following SRS into a JSON array of epics with tasks.
Rules:
1. Each epic must have:
   - "epic_name"
   - "description"
   - "tasks"
2. Each task must have:
   - "task_name"
   - "timeline_days" (realistic days)
   - "status" (Backlog / Progress / Done)
   - "sequence" (integer for order in Backlog)
3. All tasks start in Backlog, sequence sorted.
4. Use exact field names.
5. Output only valid JSON.

SRS:
{srs_text}
"""

    # Use the free models router so OpenRouter picks a free model automatically
    response = client.query(
        model="openrouter/free",
        prompt=prompt
    )

    raw_output = response.strip()

    match = re.search(r'\[.*\]', raw_output, re.DOTALL)
    if match:
        try:
            epics_tasks = json.loads(match.group())
        except json.JSONDecodeError:
            epics_tasks = []
    else:
        epics_tasks = []

    if not epics_tasks:  # simple fallback
        epics_tasks = [{
            "epic_name": "General Epic",
            "description": "Auto‑generated from SRS",
            "tasks": [
                {
                    "task_name": line.strip()[:80],
                    "timeline_days": random.randint(1,5),
                    "status": "Backlog",
                    "sequence": i+1
                }
                for i, line in enumerate(srs_text.split('.')) if line.strip()
            ]
        }]

    for epic in epics_tasks:
        for i, task in enumerate(epic.get("tasks", [])):
            task.setdefault("timeline_days", random.randint(1,5))
            task.setdefault("status", "Backlog")
            task.setdefault("sequence", i+1)

    return epics_tasks


if __name__ == "__main__":
    srs = (
        "User can login and upload files. "
        "Admin manages users and generates reports. "
        "Users can reset password. "
        "System sends email notifications."
    )

    kanban_json = generate_kanban_tasks_openrouter(srs)
    print(json.dumps(kanban_json, indent=2))