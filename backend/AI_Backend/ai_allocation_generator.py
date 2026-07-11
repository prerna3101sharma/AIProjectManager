import json
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class TaskAllocator:
    def __init__(self, team_data, tasks_data):
        self.team = team_data["team"]
        self.tasks = tasks_data

    def allocate_tasks(self):
        """
        Uses Gemini to allocate tasks to team members based on skills and availability.
        """
        prompt = f"""
        You are a smart project manager assistant.
        
        Team Members:
        {json.dumps(self.team, indent=2)}

        Tasks to assign:
        {json.dumps(self.tasks, indent=2)}

        Strict Instructions:
        1. Assign each task to the team member whose skills best match the task.
        2. Consider availability_days so no one is overbooked.
        3. Return ONLY JSON array  with objects containing:
           - task_name
           - assigned_to
           - timeline_days
           - epic_name
        4. Ensure everyone has tasks within their availability.
        """

        try:
            print("ai_allocation (Gemini)")
            model = genai.GenerativeModel('gemini-2.5-flash', generation_config={"response_mime_type": "application/json"})
            response = model.generate_content(prompt)
            
            # Parse the model output
            try:
                import re
                raw_text = response.text.strip()
                raw_text = re.sub(r"```json|```", "", raw_text).strip()
                
                match = re.search(r"\[.*\]", raw_text, re.DOTALL)
                if match:
                    raw_text = match.group()
                    
                allocated = json.loads(raw_text)
                return allocated
            except json.JSONDecodeError as e:
                print(f"Warning: Model output is not valid JSON. Error: {e}")
                print("Raw content:", response.text)
                return []

        except Exception as e:
            print(f"Error calling Gemini: {e}")
            return []

# -----------------------------
# Example usage
# -----------------------------
if __name__ == "__main__":
    # Simulated backend input
    team_data = {
        "team": [
            {"name": "Prerna", "role": "Backend Developer", "skills": ["FastAPI", "Database", "Auth"], "availability_days": 10},
            {"name": "Rahul", "role": "Frontend Developer", "skills": ["React", "UI", "Design"], "availability_days": 8}
        ]
    }

    tasks_data = [
        {'task_name': 'The system shall allow user registration and login', 'timeline_days': 2, 'epic_name': 'User Management'},
        {'task_name': 'The system shall store user data securely in a database', 'timeline_days': 5, 'epic_name': 'User Management'},
        {'task_name': 'The system shall allow users to update their profile', 'timeline_days': 5, 'epic_name': 'User Management'},
        {'task_name': 'The system shall log user activities', 'timeline_days': 4, 'epic_name': 'User Management'},
        {'task_name': 'The system shall provide an admin dashboard', 'timeline_days': 2, 'epic_name': 'Admin Dashboard'},
        {'task_name': 'The system shall allow content creation and editing', 'timeline_days': 1, 'epic_name': 'Content Management'},
        {'task_name': 'The system shall deploy on a cloud hosting platform', 'timeline_days': 4, 'epic_name': 'Deployment'}
    ]

    allocator = TaskAllocator(team_data, tasks_data)
    allocation_result = allocator.allocate_tasks()
    print(json.dumps(allocation_result, indent=2))