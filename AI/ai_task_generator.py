import ollama
import re
import json

def generate_epics_tasks_json(srs_text: str):
    prompt = f"""
You are a professional software project manager.

Your task:
Convert the following SRS document into a JSON array of Epics.

STRICT RULES:
1. Output only JSON.
2. Each epic should have:
   - "epic_name": short title
   - "description": short description
   - "tasks": array of task names under that epic
3. Only epics and tasks, no extra text or explanations.
4. Keep tasks concise and actionable.
5. Output clean, parseable JSON only.

SRS:
{srs_text}
"""

    response = ollama.chat(
        model="phi3:mini",
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
            # fallback: empty
            epics_tasks = []
    else:
        epics_tasks = []

    return epics_tasks


if __name__ == "__main__":
    srs = "User can login and upload files. Admin can manage users and generate reports."
    result = generate_epics_tasks_json(srs)
    print(json.dumps(result, indent=2))