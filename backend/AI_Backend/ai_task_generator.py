import ollama
import re
import json
import random

def safe_json_parse(raw_output: str):
    try:
        raw_output = raw_output.strip()

        # Remove markdown fences
        raw_output = re.sub(r"```json|```", "", raw_output).strip()

        # Extract first JSON array block
        match = re.search(r"\[.*\]", raw_output, re.DOTALL)
        if not match:
            print("❌ No JSON array found")
            return []

        json_block = match.group()

        return json.loads(json_block)

    except Exception as e:
        print("\n❌ JSON parse failed:", e)
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
STRICTLY AVOID:
- RETURN "epic_name", "description", "task_name", "timeline_days" as literal strings in the output.
- DO NOT return fields like "epic_name0", "description0", "task_name0", "timeline_days0" or any variations.
- DO NOT generate unrealistic timelines (e.g., 0 days, 1000 days)

SRS:
{srs_text}
"""
    print("😊ai_generater")
    response = ollama.chat(
        model="phi3",
        format="json",
        messages=[{"role": "user", "content": prompt}]
    )

    raw_output = response["message"]["content"]

    print("\n===== RAW TASK MODEL OUTPUT =====\n", raw_output)

    epics = safe_json_parse(raw_output)

    return epics


if __name__ == "__main__":
    srs = "User can login and upload files. Admin can manage users and generate reports."
    result = generate_epics_tasks_json_with_timeline(srs)
    print(json.dumps(result, indent=2))