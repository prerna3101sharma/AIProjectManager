from AI_Backend.ai_allocation_generator import TaskAllocator


class AllocationService:

    @staticmethod
    def allocate(team_payload, tasks_payload):
        """
        Bridges FastAPI backend and AI TaskAllocator.
        """

        team_data = {"team": team_payload}
        tasks_data = tasks_payload

        allocator = TaskAllocator(team_data, tasks_data)
        return allocator.allocate_tasks()