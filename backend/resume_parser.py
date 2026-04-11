import pdfplumber
from docx import Document
import re


def clean_text(text: str) -> str:
    if not text:
        return ""

    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s\.\,\-\+\/\:\@\(\)]', '', text)

    return text.strip()


def extract_text_from_pdf(file):
    text_chunks = []

    try:
        file.seek(0)
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_chunks.append(page_text)

    except Exception as e:
        print("PDF ERROR:", str(e))

    return clean_text("\n".join(text_chunks))


def extract_text_from_docx(file):
    text_chunks = []

    try:
        file.seek(0)
        doc = Document(file)

        for para in doc.paragraphs:
            if para.text:
                text_chunks.append(para.text)

    except Exception as e:
        print("DOCX ERROR:", str(e))

    return clean_text("\n".join(text_chunks))


def extract_resume_text(file, filename):
    if not filename:
        raise ValueError("Filename is required")

    filename = filename.lower()

    if filename.endswith(".pdf"):
        return extract_text_from_pdf(file)

    elif filename.endswith(".docx"):
        return extract_text_from_docx(file)

    else:
        raise ValueError("Unsupported file format. Upload PDF or DOCX only.")
