import re
import json
import random
import ollama

class SimpleRAG:
    def __init__(self, srs_text):
        # Split by newlines or sentences, filtering out garbage
        self.chunks = [
            line.strip() 
            for line in re.split(r'\n|(?<=[.!?]) +', srs_text) 
            if len(line.strip()) > 5
        ]

    def get_batched_context(self, batch_size=20):
        """Yields chunks of the SRS to avoid overwhelming the model context."""
        for i in range(0, len(self.chunks), batch_size):
            yield "\n".join(self.chunks[i:i + batch_size])

def generate_clean_epics_tasks(srs_text: str):
    rag = SimpleRAG(srs_text)
    all_epics = []

    # Iterate through the SRS in batches to ensure the model "reads" everything
    for context_batch in rag.get_batched_context(batch_size=15):
        prompt = f"""
        You are a Project Manager. Convert the following SRS requirements into a JSON list of Epics.
        
        Requirements:
        {context_batch}

        Rule: Return ONLY a JSON array. 
        Each object must have: "epic_name", "description", and "tasks" (a list of objects with "task_name", "timeline_days", "status", "sequence").
        """

        try:
            response = ollama.chat(
                model="phi3:mini",
                format="json", # Forces JSON output
                messages=[{"role": "user", "content": prompt}],
                options={"num_ctx": 4096, "temperature": 0.1} # Increased context window
            )
            
            batch_data = json.loads(response["message"]["content"])
            if isinstance(batch_data, list):
                all_epics.extend(batch_data)
            else:
                all_epics.append(batch_data)

        except Exception as e:
            print(f"Error processing batch: {e}")

    # Final cleanup: Merge duplicate epics if they appeared in different batches
    return merge_epics(all_epics)

def merge_epics(epics_list):
    """Merges tasks from epics with the same name."""
    merged = {}
    for entry in epics_list:
        name = entry.get("epic_name", "General")
        if name not in merged:
            merged[name] = {
                "epic_name": name,
                "description": entry.get("description", ""),
                "tasks": []
            }
        
        # Add tasks and ensure they have metadata
        for i, task in enumerate(entry.get("tasks", [])):
            task["timeline_days"] = task.get("timeline_days", random.randint(1, 5))
            task["status"] = "Backlog"
            task["sequence"] = len(merged[name]["tasks"]) + 1
            merged[name]["tasks"].append(task)
            
    return list(merged.values())

if __name__ == "__main__":
    try:
        with open("srs.txt", "r", encoding="utf-8") as f:
            content = f.read()
        
        final_json = generate_clean_epics_tasks(content)
        print(json.dumps(final_json, indent=2))
    except FileNotFoundError:
        print("Error: srs.txt not found.")