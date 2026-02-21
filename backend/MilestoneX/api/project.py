from fastapi import APIRouter, UploadFile, File, HTTPException
from ..services.pdf_services import PDFService
from ..services.project_service import ProjectService
from ..schema.project_schema import ProjectAnalysisResponse

router = APIRouter()


@router.post(
    "/analyze-project",
    response_model=ProjectAnalysisResponse
)
async def analyze_project(file: UploadFile = File(...)):

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    try:
        # Step 1: Extract SRS text
        extracted_text = await PDFService.extract_text(file)

        if not extracted_text:
            raise HTTPException(
                status_code=400,
                detail="Empty PDF"
            )

        # Step 2: Generate everything
        result = ProjectService.analyze_project(extracted_text)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))