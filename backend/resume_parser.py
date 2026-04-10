import pdfplumber
import docx
import re


def clean_text(text: str) -> str:
    if not text:
        return ""

    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s\.\,\-\+]', '', text)

    return text.strip()


def extract_text_from_pdf(file):
    text = ""
    try:
        with pdfplumber.open(file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()

                if page_text:
                    text += page_text+"\n"
    except Exception as e:
        print("PDF ERROR:", str(e))

    return clean_text(text)


def extract_text_from_docx(file):
    text = ""
    try:
        doc = docx.Document(file)

        for para in doc.paragraphs:
            if para.text:
                text += para.text+"\n"
    except Exception as e:
        print("DOCX ERROR:", str(e))
    return clean_text(text)


def extract_resume_text(file, filename):
    filename = filename.lower()

    if filename.endswith(".pdf"):
        return extract_text_from_pdf(file)

    elif filename.endswith(".docx"):
        return extract_text_from_docx(file)

    else:
        raise ValueError("Unsupported file format. Upload PDF or DOCX only.")
