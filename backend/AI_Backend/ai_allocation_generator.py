import json
import random
import ollama

class TaskAllocator:
    def __init__(self, team_data, tasks_data):
        self.team = team_data["team"]
        self.tasks = tasks_data

    def allocate_tasks(self):
        """
        Uses PhiMini to allocate tasks to team members based on skills and availability.
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
        3. Return ONLY JSON  with objects containing:
           - task_name
           - assigned_to
           - timeline_days
           - epic_name
        4. Ensure everyone has tasks within their availability.
        """

        try:
            response = ollama.chat(
                model="phi3",
                messages=[{"role": "user", "content": prompt}],
                options={"num_ctx": 4096, "temperature": 0.1},
                format = "json"
            )
            
            # Parse the model output
            try:
                allocated = json.loads(response["message"]["content"])
                return allocated
            except json.JSONDecodeError:
                print("Warning: Model output is not valid JSON. Returning raw content.")
                return response["message"]["content"]

        except Exception as e:
            print(f"Error calling Ollama: {e}")
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