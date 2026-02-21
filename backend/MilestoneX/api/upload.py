from fastapi import APIRouter, UploadFile, File, HTTPException, status
from ..services.pdf_services import PDFService

router = APIRouter()


@router.post("/upload", status_code=status.HTTP_200_OK)
async def upload_srs(file: UploadFile = File(...)):
    
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    try:
        extracted_text = await PDFService.extract_text(file)

        if not extracted_text:
            return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty PDF(don't contain any text)")

        return {
            "message": "File processed successfully",
            "extracted_text": extracted_text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))