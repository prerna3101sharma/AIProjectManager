import ollama
import re
import json
import random

def safe_json_parse(raw_output: str):
    try:
        raw_output = raw_output.strip()

        # Remove markdown wrapper
        if raw_output.startswith("```"):
            raw_output = re.sub(r"```json|```", "", raw_output).strip()

        data = json.loads(raw_output)

        if isinstance(data, list):
            return data

        if isinstance(data, dict):
            return data.get("epics", [])

        return []

    except Exception as e:
        print("\n❌ JSON parse failed in Task Generator:", e)
        print("RAW OUTPUT:\n", raw_output)
        return []
    
def generate_epics_tasks_json_with_timeline(srs_text: str):
    prompt = f"""
You are a professional software project manager.

Your task:
Convert the following SRS document into a JSON array of Epics with Tasks.

STRICT RULES:
1. Output only JSON.
2. Each epic should have:
   - "epic_name": short title
   - "description": short description
   - "tasks": array of tasks, where each task has:
       * "task_name": concise and actionable
       * "timeline_days": estimated time to complete the task (integer, feasible, in days)
3. Keep tasks concise and actionable.
4. Output clean, parseable JSON only.

SRS:
{srs_text}
"""

    response = ollama.chat(
        model="phi3",
        messages=[{"role": "user", "content": prompt}]
    )

    raw_output = response["message"]["content"].strip()

    # Clean output: extract JSON array from model output in case extra text is added
    match = re.search(r'\[.*\]', raw_output, re.DOTALL)
    if match:
        json_output = match.group()
        try:
            epics_tasks = json.loads(json_output)
        except json.JSONDecodeError:
            epics_tasks = []
    else:
        epics_tasks = []

    # Optional: sanity check to ensure each task has a timeline
    for epic in epics_tasks:
        for task in epic.get("tasks", []):
            if "timeline_days" not in task:
                task["timeline_days"] = random.randint(1, 5)  # fallback 1-5 days

    return epics_tasks


if __name__ == "__main__":
    srs = "User can login and upload files. Admin can manage users and generate reports."
    result = generate_epics_tasks_json_with_timeline(srs)
    print(json.dumps(result, indent=2))