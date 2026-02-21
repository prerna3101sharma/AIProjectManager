from AI_Backend.ai_milestone_generator import generate_milestones


class MilestoneService:

    @staticmethod
    def create_milestones(text: str):

        raw_milestones = generate_milestones(text)

        cleaned = []

        for m in raw_milestones:
            cleaned.append({
                "name": m.get("name") or m.get("Name") or m.get("name0"),
                "description": m.get("description") or m.get("Description"),
                "timeline_days": m.get("timeline_days") or m.get("Timeline")
            })

        return cleaned