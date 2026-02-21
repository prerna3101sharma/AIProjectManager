import ollama
import re
import json

def generate_milestones(srs_text: str):
    prompt = f"""
You are a professional software project manager.

Your task:
From the following SRS document, create a list of **realistic and original project milestones**.
Each milestone should be meaningful and represent a major checkpoint in the project.  

STRICT RULES:
1. Output only in JSON.
2. Each milestone should have:
   - Name: short, catchy title
   - Description: 1 line explaining the milestone
   - Timeline: estimated days from project start (realistic days)
3. Keep milestones feasible and sequential.
4. Output only milestones, no extra explanations.

SRS:
{srs_text}
"""

    response = ollama.chat(
        model="phi3:mini",
        messages=[{"role": "user", "content": prompt}]
    )

    raw_output = response["message"]["content"].strip()
    return raw_output


if __name__ == "__main__":
    srs = "User can login and upload files. Admin can manage users and generate reports."
    
    # Generate Milestones separately
    milestones = generate_milestones(srs)
    print("\nMilestones:\n")
    print(milestones)