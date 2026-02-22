import ollama
import json
import re


def safe_json_parse(raw_output: str):
    try:
        raw_output = raw_output.strip()
        raw_output = re.sub(r"```json|```", "", raw_output).strip()

        match = re.search(r"\[.*\]", raw_output, re.DOTALL)
        if not match:
            return []

        json_str = match.group()

        try:
            return json.loads(json_str)
        except:
            # Try to clean trailing garbage
            json_str = json_str.rstrip()
            json_str = json_str.split("]")[0] + "]"
            return json.loads(json_str)

    except Exception as e:
        print("FINAL PARSE FAILURE:", e)
        print("RAW:", raw_output)
        return []


def allocate_tasks(tasks, team):

    prompt = f"""
You are a project manager.

Allocate EACH task to exactly one team member.

Return ONLY valid JSON.
No explanations.
No markdown.
No extra text.
No truncation.

Output format EXACTLY:

[
  {{
    "task_name": "...",
    "assigned_to": "..."
  }}
]

Tasks:
{json.dumps(tasks)}

Team:
{json.dumps(team)}
"""

    response = ollama.chat(
        model="phi3",
        messages=[{"role": "user", "content": prompt}]
    )

    raw_output = response["message"]["content"]

    print("\n===== RAW ALLOCATION OUTPUT =====\n", raw_output)

    return safe_json_parse(raw_output)