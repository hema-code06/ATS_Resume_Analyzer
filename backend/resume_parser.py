import pdfplumber
import docx
import re


def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""

    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s\.\,\-\+]', '', text)

    return text.strip()


def extract_text_from_pdf(file) -> str:
    text_parts = []

    try:
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()

                if page_text:
                    text_parts.append(page_text)

    except Exception as e:
        print(f"PDF ERROR:{e}")
        return ""

    return clean_text("\n".join(text_parts))


def extract_text_from_docx(file) -> str:
    text_parts = []

    try:
        doc = docx.Document(file)

        for para in doc.paragraphs:
            if para.text and para.text.strip():
                text_parts.append(para.text)

    except Exception as e:
        print(f"DOCX ERROR: {e}")
        return ""

    return clean_text("\n".join(text_parts))


def extract_resume_text(file, filename: str) -> str:
    if not filename:
        raise ValueError("Filename is required")

    filename = filename.lower()

    if filename.endswith(".pdf"):
        return extract_text_from_pdf(file)

    elif filename.endswith(".docx"):
        return extract_text_from_docx(file)

    else:
        raise ValueError(
            "Unsupported file format. Only PDF and DOCX are allowed.")
