import ollama
import re
import json

class PureRAG:
    """
    Pure RAG system without any vector DB or embeddings.
    Uses SRS text chunks as retrieval context for the LLM.
    """
    def __init__(self, model_name="phi3:mini", chunk_size=200):
        self.model_name = model_name
        self.chunk_size = chunk_size

    def chunk_srs(self, srs_text: str):
        """Split SRS into small chunks to simulate retrieval."""
        return [srs_text[i:i+self.chunk_size] for i in range(0, len(srs_text), self.chunk_size)]

    def generate_json(self, srs_text: str):
        # Step 1: Split SRS into chunks
        srs_chunks = self.chunk_srs(srs_text)
        context = "\n\n".join(srs_chunks)  # combine chunks as "retrieved" context

        # Step 2: Prepare the LLM prompt
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

SRS CONTEXT:
{context}
"""

        # Step 3: Call the LLM
        response = ollama.chat(
            model=self.model_name,
            messages=[{"role": "user", "content": prompt}]
        )

        raw_output = response["message"]["content"].strip()

        # Step 4: Extract JSON safely
        match = re.search(r'\[.*\]', raw_output, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                return []
        return []

if __name__ == "__main__":
    srs_text = """
User can login and upload files. Admin can manage users and generate reports.
The system should allow password reset, role-based access, and activity logging.
"""
    rag = PureRAG()
    epics_tasks = rag.generate_json(srs_text)
    print(json.dumps(epics_tasks, indent=2))