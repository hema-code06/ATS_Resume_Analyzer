from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from resume_parser import extract_resume_text
from ai_analyzer import calculate_ats_score, generate_basic_feedback, generate_ai_feedback

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "ATS Resume Analyzer API running successfully.."
    }


@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    text = extract_resume_text(file.file, file.filename)
    score, found_skills, missing_skills = calculate_ats_score(text)
    basic_feedback = generate_basic_feedback(score, missing_skills, text)
    ai_feedback = generate_ai_feedback(text)

    return {
        "filename": file.filename,
        "ats_score": score,
        "found_skills": found_skills,
        "missing_skills": missing_skills[:5],
        "basic_feedback": basic_feedback,
        "ai_feedback": ai_feedback
    }
