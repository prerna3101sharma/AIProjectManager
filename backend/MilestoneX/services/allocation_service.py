import json
from AI_Backend.ai_allocation_generator import allocate_tasks


class AllocationService:

    @staticmethod
    def allocate(tasks, team):
        """
        Wrapper between backend and AI layer.
        Ensures clean structured communication.
        """

        # Always send proper JSON
        tasks_json = json.dumps(tasks)
        team_json = json.dumps(team)

        return allocate_tasks(tasks_json, team_json)