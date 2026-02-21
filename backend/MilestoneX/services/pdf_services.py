import pdfplumber
from fastapi import UploadFile
import io


class PDFService:

    @staticmethod
    async def extract_text(file: UploadFile) -> str:
        content = await file.read()

        with pdfplumber.open(io.BytesIO(content)) as pdf:
            full_text = ""
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"

        return full_text.strip()