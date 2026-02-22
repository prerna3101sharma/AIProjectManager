# 🚀 MilestoneX

> An AI-powered system that converts Software Requirement Specification (SRS) documents into structured, actionable project execution roadmaps — automatically.

---

## 📌 Project Description

**MilestoneX** eliminates the pain of manual project planning. Traditional planning from SRS documents is time-consuming: teams read lengthy requirement documents, break them into tasks, estimate timelines, and assign responsibilities — a process that is repetitive, subjective, and error-prone.

MilestoneX automates the entire planning stage using AI. Simply upload an SRS document and the system extracts requirements, generates a structured task breakdown, creates milestones with timelines, and intelligently allocates tasks to team members based on their skills.

The result: a complete, AI-generated project execution plan — in minutes, not days.

### 🎯 Target Users
- Startup Teams
- Hackathon Participants
- Product Managers
- Software Development Teams

---

## 👤 User Flow

```
User
 │
 ├─► Upload SRS PDF
 │        │
 │        ▼
 │   Upload & Extraction Module (Backend)
 │        │  Extracted Text
 │        ▼
 │   Requirement Extraction (AI)
 │        │  Structured Requirements
 │        ▼
 │   Task Breakdown Engine (AI)
 │        │  Tasks + Estimates
 │        ▼
 │   Timeline & Milestone Generator
 │        │  Roadmap Data
 │        ▼
 │   Team Input & Allocation Module
 │        │  Assigned Tasks
 │        ▼
 │   Dashboard / Visualization (UI)
 │        │
 └────────►  Display Plan → User
```

### Step-by-Step Walkthrough

1. **Upload SRS** — User uploads an SRS document (PDF format) through the web interface.
2. **Text Extraction** — The backend parses and extracts raw text content from the PDF.
3. **Requirement Extraction** — The AI layer reads the extracted text and identifies structured requirements.
4. **Task Breakdown** — The AI generates granular tasks and subtasks with time estimates for each requirement.
5. **Timeline & Milestones** — An automated generator creates a project roadmap with milestones and delivery dates.
6. **Team Allocation** — Users input team member profiles; the system allocates tasks based on skills.
7. **Review & Approve** — The user reviews the generated plan via the dashboard and approves the execution roadmap.

---

## 🏗️ System Architecture

```
Frontend (React)
      │
      ▼
FastAPI Backend
      │
      ▼
AI Processing Layer (Ollama / LLM)
      │
      ▼
Database
```

The system is composed of five core modules:

- **SRS Upload & Text Extraction** — Handles file uploads and PDF parsing
- **Requirement Extraction Engine** — AI-driven identification of functional/non-functional requirements
- **Task Breakdown Engine** — Converts requirements into tasks with effort estimates
- **Timeline & Milestone Generator** — Produces a project calendar and milestone plan
- **Smart Allocation Engine** — Maps tasks to team members based on skills and availability

---

## 💻 Frontend

The frontend is built with **React** and provides an intuitive interface for the entire MilestoneX workflow.

### Key Features
- 📤 SRS PDF upload interface
- 📊 Interactive project dashboard with progress tracking
- 📅 Visual timeline and milestone display
- 👥 Team management and task assignment view
- ✅ Human-in-the-loop approval workflow for the generated plan

### Setup

```bash
cd frontend
npm install
npm start
```

The frontend runs at `http://localhost:3000` by default.

### Project Structure

```
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── App.jsx
└── package.json
```

---

## ⚙️ Backend

The backend is built with **FastAPI (Python)** and handles file processing, API routing, database interaction, and orchestration of the AI layer.

### Key Features
- 📄 PDF upload and text extraction endpoint
- 🔗 REST API connecting frontend with AI services
- 🗄️ Data persistence for requirements, tasks, and timelines
- 🔁 Workflow orchestration for multi-step AI processing

### Setup

**1. Clone Repository**
```bash
git clone https://github.com/prerna3101sharma/AIProjectManager.git
cd AIProjectManager/backend
```

**2. Create Virtual Environment**

Mac/Linux:
```bash
python -m venv venv
source venv/bin/activate
```

Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

**3. Install Dependencies**
```bash
pip install -r requirements.txt
```

**4. Run Backend Server**
```bash
uvicorn MilestoneX.main:app --reload
```

The backend runs at `http://127.0.0.1:8000`.

### Project Structure

```
backend/MilestoneX/
├── main.py
├── api/
├── services/
└── requirements.txt
```

---

## 🧠 AI Module

The AI layer is the core intelligence of MilestoneX. It leverages **Large Language Models (Ollama)** to understand and transform raw SRS content into structured project plans.

### Key Features
- 🔍 **Requirement Extraction** — Parses unstructured SRS text and identifies discrete functional/non-functional requirements
- 📋 **Task Generation** — Breaks down each requirement into actionable development tasks and subtasks with effort estimates
- 📆 **Timeline Planning** — Generates realistic milestones and sprint plans from task estimates
- 👥 **Smart Allocation** — Matches tasks to team members based on declared skills

### How It Works

The AI module uses carefully crafted prompts to guide the LLM through a structured chain-of-thought planning process. Each prompt is designed to produce consistent, machine-parseable outputs that feed seamlessly into the next pipeline stage.
docs: add comprehensive README for MilestoneX

## 📁 Full Project Structure

```
AIProjectManager/
│
├── backend/MilestoneX/
│   ├── main.py
│   ├── api/
│   ├── services/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── ai/
│   ├── prompts/
│   └── planning_logic.py
│
├── docs/
└── README.md
```

---

## 🌟 Core Features

| Feature | Description |
|---|---|
| 📄 SRS Upload | Upload PDF documents for processing |
| 🧠 AI Requirement Extraction | Automatically identify structured requirements |
| 📋 Task & Subtask Generation | Granular task breakdown with effort estimates |
| 📆 Milestone & Timeline Creation | Auto-generated project roadmap |
| 👥 Skill-Based Smart Allocation | Assign tasks based on team member skills |
| 🔁 Human-in-the-Loop Approval | Review and approve AI-generated plans |
| 📊 Progress Tracking Dashboard | Visualize project status in real time |

---

## 🚀 Future Enhancements

- GitHub integration for issue and PR tracking
- Jira integration for enterprise project management
- Dynamic timeline adjustment based on progress
- Risk prediction and early warning module
- Calendar synchronization (Google Calendar, Outlook)

---

## 👩‍💻 Team

| Name | Role |
|---|---|
| **Vishal** | AI & Planning Engine |
| **Prerna** | Backend Development |
| **Ritika** | Frontend Development |
| **Sheetal** | UI/UX Design |

---

## 🏆 Hackathon Submission

This project was developed as part of a **24-hour hackathon challenge** focusing on AI-driven automation and intelligent productivity systems.
