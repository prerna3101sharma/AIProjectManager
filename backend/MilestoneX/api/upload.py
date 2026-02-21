from fastapi import APIRouter, UploadFile, File, HTTPException, status
from ..services.pdf_services import PDFService
from AI_Backend.ai_task_generator import generate_epics_tasks_json_with_timeline

router = APIRouter()


@router.post("/upload", status_code=status.HTTP_200_OK)
async def upload_srs(file: UploadFile = File(...)):

    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files allowed"
        )

    try:
        # Step 1: Extract text
        extracted_text = await PDFService.extract_text(file)

        if not extracted_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty PDF (no extractable text)"
            )

        # Step 2: Send to AI module
        ai_response = generate_epics_tasks_json_with_timeline(extracted_text)

        # Step 3: Return structured response
        return {
            "message": "File processed successfully",
            "epics": ai_response
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )