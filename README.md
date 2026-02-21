# MilestoneX

An AI-powered system that converts Software Requirement Specification (SRS) documents into a structured and actionable project execution roadmap.

---

## 📌 Problem Statement

Project planning from SRS documents is time-consuming and manual. Teams must:

* Read lengthy requirement documents
* Break them into tasks
* Estimate timelines
* Assign responsibilities

This process is repetitive, subjective, and inefficient.

---

## 💡 Solution

AI Project Manager automates the planning stage.

Upload an SRS document → Extract requirements → Generate task breakdown → Create milestones & timeline → Allocate tasks to team members.

The system acts as an intelligent execution planner.

---

## 🏗️ Core Features

* 📄 Upload SRS (PDF)
* 🧠 AI-based requirement extraction
* 📋 Task & subtask generation
* 📆 Milestone and timeline creation
* 👥 Skill-based smart allocation
* 🔁 Human-in-the-loop approval workflow
* 📊 Project progress tracking

---

## 🧩 System Architecture

Frontend → FastAPI Backend → AI Processing Layer → Database

Modules:

* SRS Upload & Text Extraction
* Requirement Extraction Engine
* Task Breakdown Engine
* Timeline Generator
* Smart Allocation Engine

---

## 📁 Project Structure

```
AIProjectManager/
│
├── backend/MilestoneX
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

## ⚙️ Backend Setup Instructions

### 1. Clone Repository

```
git clone https://github.com/prerna3101sharma/AIProjectManager.git
cd AIProjectManager/backend
```

### 2. Create Virtual Environment

Mac/Linux:

```
python -m venv venv
source venv/bin/activate
```

Windows:

```
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies

```
pip install -r requirements.txt
```

### 4. Add Environment Variables

Create a `.env` file in backend folder:

```
OPENAI_API_KEY=your_api_key_here
```

### 5. Run Backend Server

```
uvicorn MilestoneX.main:app --reload
```

Backend will run at:

```
http://127.0.0.1:8000
```

---

## Workflow

1. Upload SRS document
2. Extract structured requirements
3. Generate task breakdown
4. Create milestones & timeline
5. Input team skills
6. Smart task allocation
7. Review and approve execution plan

---

## Target Users

* Startup Teams
* Hackathon Participants
* Product Managers
* Software Development Teams

---

## 🚀 Future Enhancements

* GitHub integration
* Jira integration
* Dynamic timeline adjustment
* Risk prediction module
* Calendar synchronization

---

## Team Members

* Vishal – AI & Planning Engine
* Prerna – Backend Development
* Ritika – Frontend Development
* Sheetal – UI/UX Design

---

## 🏆 Hackathon Submission

This project is developed as part of a 24-hour hackathon challenge focusing on AI-driven automation and intelligent productivity systems.

---

## License

This project is for academic and hackathon use only.
