import re
import pdfplumber
from docx import Document


def clean_text(text: str) -> str:
    if not text:
        return ""

    text = text.lower()
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s\.\,\-\+\/\:\@\(\)]", "", text)

    return text.strip()


def extract_text_from_pdf(file) -> str:
    try:
        file.seek(0)
        with pdfplumber.open(file) as pdf:
            text = " ".join(
                page.extract_text() or "" for page in pdf.pages
            )
        return clean_text(text)

    except Exception as e:
        raise RuntimeError(f"Error processing PDF: {e}") from e


def extract_text_from_docx(file) -> str:
    try:
        file.seek(0)
        doc = Document(file)
        text = " ".join(
            para.text for para in doc.paragraphs if para.text
        )
        return clean_text(text)

    except Exception as e:
        raise RuntimeError(f"Error processing DOCX: {e}") from e


def extract_resume_text(file, filename: str) -> str:
    if not filename:
        raise ValueError("Filename is required")

    filename = filename.lower()

    if filename.endswith(".pdf"):
        return extract_text_from_pdf(file)

    if filename.endswith(".docx"):
        return extract_text_from_docx(file)

    raise ValueError("Unsupported file format. Upload PDF or DOCX only.")
