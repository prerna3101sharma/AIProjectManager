# 🤖 AI Branch 

This branch contains the AI module of the project, powered by **Ollama** for local LLM inference.

---

## 📁 Project Structure

```
AI/
├── venv/                   # Python virtual environment
├── ai_task_generator.py    # Main AI task generation script
└── README.md               # You are here
```

---

## 📋 Description

The `ai_task_generator.py` script uses a locally running **Ollama** model to automatically generate tasks based on user input or project context. It leverages Ollama's API to communicate with the model running on your machine — no cloud, no API keys required.

---

## ⚙️ Prerequisites

Make sure the following are installed on your system:

- Python 3.8+
- [Ollama](https://ollama.com/) installed and running locally

---

## 🚀 Setup & Execution

### 1. Clone the repository and switch to the AI branch


### 2. Create and activate the virtual environment

```bash
# Create virtual environment
python -m .venv .venv

# Activate 
venv\Scripts\activate
```

### 3. Install dependencies

install the Ollama client manually:
> ```bash
> pip install ollama
> ```

### 4. Pull and run the Ollama model

```bash
# Pull a model (e.g., llama3, mistral, gemma, etc.)
ollama pull phi3:mini


### 5. Run the AI Task Generator

```bash
python ai_task_generator.py
```

---

## 🧠 Changing the Model

Inside `ai_task_generator.py`, you can change the model by updating the model name:

```python
model = "llama3"   # Replace with any model you have pulled via Ollama
```

To see all available models you have locally:

```bash
ollama list
```

---

## 🛑 Deactivate the Virtual Environment

When you're done:

```bash
deactivate
```

---

## 📌 Notes

- Ollama must be running (`ollama serve`) before executing the script.
- The model runs entirely **locally** — no data is sent to external servers.
- Performance depends on your machine's hardware (CPU/GPU).

---
