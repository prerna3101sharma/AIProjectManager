import ollama
import re
import json

def safe_json_parse(raw_output: str):
    try:
        raw_output = raw_output.strip()

        # Direct JSON parse first (since format="json")
        data = json.loads(raw_output)

        # If model returned list
        if isinstance(data, list):
            return data

        # If model returned object containing milestones
        if isinstance(data, dict):
            # Try common keys
            if "milestones" in data:
                return data["milestones"]
            if "epics" in data:
                return data["epics"]

            # If it's a single milestone object, wrap it in list
            if "name" in data and "timeline_days" in data:
                return [data]

        return []

    except Exception as e:
        print("\n❌ JSON parse failed:", e)
        print("RAW OUTPUT:\n", raw_output)
        return []
    
def generate_milestones(srs_text: str):
    prompt = f"""
You are a professional software project manager.

Your task:
From the following SRS document, create a list of **realistic and original project milestones**.
Each milestone should be meaningful and represent a major checkpoint in the project.  

STRICT RULES:
1. Output only in JSON.
2. Each milestone should have:
   - "name": short, catchy title
   - "description": 1 line explaining the milestone
   - "timeline_days": estimated days from project start (realistic days)
3. Keep milestones feasible and sequential.
4. Output only milestones, no extra explanations.
STRICTLY AVOID:
- RETURN "name", "description", "timeline_days" as literal strings in the output.
- DO NOT return fields like "name0", "description0", "timeline_days0" or any variations.
- DO NOT generate unrealistic timelines (e.g., 0 days, 1000 days)
SRS:
{srs_text}
"""
    print("😊ai_milestones")

    response = ollama.chat(
        model="phi3",
        format="json",
        messages=[{"role": "user", "content": prompt}]
    )

    raw_output = response["message"]["content"]

    print("\n===== RAW MILESTONE MODEL OUTPUT =====\n", raw_output)

    milestones = safe_json_parse(raw_output)

    return milestones


if __name__ == "__main__":
    srs = "User can login and upload files. Admin can manage users and generate reports."
    
    # Generate Milestones separately
    milestones = generate_milestones(srs)
    print("\nMilestones:\n")
    print(milestones)