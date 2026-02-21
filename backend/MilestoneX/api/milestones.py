from fastapi import APIRouter, HTTPException
from ..services.milestone_service import MilestoneService
from ..schema.milestone_schema import MilestoneRequest, MilestoneResponse

router = APIRouter()

@router.post(
    "/milestones",
    response_model=MilestoneResponse
)
async def generate_project_milestones(payload: MilestoneRequest):

    try:
        milestones = MilestoneService.create_milestones(payload.text)

        if not milestones:
            raise HTTPException(
                status_code=400,
                detail="AI failed to generate milestones"
            )

        return {"milestones": milestones}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )