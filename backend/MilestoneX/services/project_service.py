from AI_Backend.ai_task_generator import generate_epics_tasks_json_with_timeline
from AI_Backend.ai_milestone_generator import generate_milestones
import json
import re


class ProjectService:

    @staticmethod
    def analyze_project(srs_text: str):
        # srs_text = srs_text[:6000]
        # ---------- Generate AI Output ----------
        raw_epics = generate_epics_tasks_json_with_timeline(srs_text)
        raw_milestones = generate_milestones(srs_text)

        print("\n=========== RAW EPICS ===========\n", raw_epics)
        print("\n=========== RAW MILESTONES ===========\n", raw_milestones)

        # ---------- CLEAN EPICS ----------
        cleaned_epics = []

        for epic in raw_epics or []:

            epic_name = (
                epic.get("epic_name")
                or epic.get("Epic Name")
                or epic.get("name")
                or ""
            )

            description = (
                epic.get("description")
                or epic.get("Description")
                or epic.get("epic_description")
                or f"Implementation of {epic_name} module."
            )

            cleaned_tasks = []

            for task in epic.get("tasks", []):

                task_name = (
                    task.get("task_name")
                    or task.get("taskName")
                    or task.get("task_name0")
                    or task.get("task0")
                    or task.get("name")
                    or ""
                )

                timeline = (
                    task.get("timeline_days")
                    or task.get("days")
                    or 0
                )

                try:
                    timeline = int(timeline)
                except:
                    timeline = 0

                cleaned_tasks.append({
                    "task_name": str(task_name),
                    "timeline_days": timeline
                })

            cleaned_epics.append({
                "epic_name": str(epic_name),
                "description": str(description),
                "tasks": cleaned_tasks
            })

        # ---------- CLEAN MILESTONES ----------
        cleaned_milestones = []

        # If milestone returned as string with ```json wrapper
        if isinstance(raw_milestones, str):
            match = re.search(r'\[.*\]', raw_milestones, re.DOTALL)
            if match:
                try:
                    raw_milestones = json.loads(match.group())
                except:
                    raw_milestones = []

        for m in raw_milestones or []:
            # Normalize keys to lowercase
            normalized = {k.lower(): v for k, v in m.items()}

            # Auto-detect name-like keys
            name = (
                normalized.get("name")
                or normalized.get("names")
                or normalized.get("Name")
                or next((v for k, v in normalized.items() if k.startswith("name")), "")
            )

            description = (
            normalized.get("description")
            or normalized.get("descriptions")
            or normalized.get("Description")
            or next((v for k, v in normalized.items() if k.startswith("description")), "")
            or f"Milestone for {name}"
        )

            timeline = normalized.get("timeline_days") or 0

            try:
                timeline = int(timeline)
            except:
                timeline = 0

            # Prevent negative hallucinated timelines
            timeline = max(0, timeline)

            cleaned_milestones.append({
                "name": str(name),
                "description": str(description),
                "timeline_days": timeline
            })

        return {
            "epics": cleaned_epics,
            "milestones": cleaned_milestones
        }