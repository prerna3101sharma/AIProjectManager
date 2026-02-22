import json
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.llms import Ollama
from langchain_core.documents import Document

# ==============================
# 🔹 RAG + AI Planner Engine
# ==============================

class AIPlanner:

    def __init__(self, model_name="phi3:mini"):
        # print("🚀 Initializing Ollama + RAG...")
        self.llm = Ollama(model=model_name, format="json")
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        self.vectorstore = None

    # ------------------------------
    # 1️⃣ Ingest SRS into Vector DB
    # ------------------------------
    def ingest_srs(self, srs_text):
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=100
        )

        chunks = splitter.split_text(srs_text)
        docs = [Document(page_content=chunk) for chunk in chunks]

        self.vectorstore = FAISS.from_documents(docs, self.embeddings)
        # print("✅ SRS Ingested into Vector Store")

    # ------------------------------
    # RAG Retrieval
    # ------------------------------
    def retrieve_context(self, query, k=4):
        docs = self.vectorstore.similarity_search(query, k=k)
        return "\n\n".join([doc.page_content for doc in docs])

    # ------------------------------
    # LLM Call
    # ------------------------------
    def generate(self, prompt):
        return self.llm.invoke(prompt)

    # ==============================
    # 🔹 AI Layer 1
    # Requirement Extraction
    # ==============================
    def extract_requirements(self):

        context = self.retrieve_context(
            "Extract functional and non-functional requirements"
        )

        prompt = f"""
You are a senior software architect.

Using the SRS context below, extract:

1. Functional Requirements
2. Non-Functional Requirements
3. Identified Modules
4. Assumptions

Return STRICT JSON format:

{{
    "functional_requirements": [],
    "non_functional_requirements": [],
    "modules": [],
    "assumptions": []
}}

SRS Context:
{context}
"""

        response = self.generate(prompt)

        try:
            return json.loads(response)
        except:
            return {"raw_output": response}

    # ==============================
    # 🔹 AI Layer 2
    # Task Breakdown Engine
    # ==============================
    def generate_tasks(self, requirements_json):

        prompt = f"""
    You are a senior technical project manager.

    Break the following modules into structured project planning format.
    STRICT BEHAVIOUR:
    - Strictly follow the given json format only
    - Do not Repeat or rephrase the tasks
    
    IMPORTANT:
    - Output STRICT JSON only.
    - No explanation.
    - No markdown.
    - No extra text.
    - DO NOT repeat the tasks
    - Do NOT add fields other than specified.

    Required Output Format:

    {{
    "epics": [
        {{
        "epic_name": "",
        "description": "",
        "tasks": [
            {{
            "task_name": "",
            "timeline_days": 0
            }}
        ]
        }}
    ]
    }}

    Strict Rules:
    - timeline_days must be integer
    - Small frontend task: 2 to 4 days
    - Medium backend/API task: 3 to 5 days
    - Integration task: 2 to 3 days
    - Complex module: 5 to 8 days

    Requirements:
    {requirements_json}
    """

        response = self.generate(prompt)

        try:
            parsed = json.loads(response)
            return parsed
        except:
            return {
                "error": "Model did not return strict JSON",
                "raw_output": response
            }

# ==============================
# 🔹 MAIN EXECUTION
# ==============================

if __name__ == "__main__":

    # 🔹 Example SRS (Replace with your real SRS)
    srs_text = """
The system shall provide user authentication with login and registration.
Users can view dashboard with analytics.
Admin can generate reports.
System must respond within 2 seconds.
Data must be encrypted.
Role-based access control is required.
"""

    planner = AIPlanner(model_name="phi3:mini")

    # Step 1: Ingest SRS
    planner.ingest_srs(srs_text)

    # Step 2: Extract Requirements (AI Layer 1)
    # print("\n==============================")
    # print("🔹 REQUIREMENT EXTRACTION")
    # print("==============================\n")

    requirements = planner.extract_requirements()
    # print(requirements)
    # print(json.dumps(requirements, indent=2))
    # # Step 3: Task Breakdown (AI Layer 2)
    # print("\n==============================")
    # print("🔹 TASK BREAKDOWN")
    # print("==============================\n")

    tasks = planner.generate_tasks(requirements)
    print(json.dumps(tasks, indent=2))

    #print("\n🎯 AI Planning Complete!")