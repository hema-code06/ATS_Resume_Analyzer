from fastapi import FastAPI, UploadFile, File, Body
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
    try:
        text = extract_resume_text(file.file, file.filename)

        result = calculate_ats_score(text)
        basic_feedback, color = generate_basic_feedback(result, text)

        return {
            "filename": file.filename,
            "analysis": {
                "ats_score": result["ats_score"],
                "color": color,
                "found_skills": result["found_skills"],
                "missing_sections": result["missing_sections"],
                "role_match": result["role_match"]
            },
            "feedback": {
                "basic": basic_feedback
            },
            "resume_preview": text[:1000]
        }

    except Exception as e:
        print("UPLOAD ERROR:", str(e))
        return {
            "error": str(e)
        }


@app.post("/ai-feedback")
async def ai_feedback(data: dict = Body(...)):
    try:
        text = data.get("text", "")
        if not text or text.strip() == "":
            return {
                "ai_feedback": "No resume text provided."
            }
        ai_feedback_result = generate_ai_feedback(text)
        return {
            "ai_feedback": ai_feedback_result
        }
    except Exception as e:
        print("AI ERROR:", str(e))
        return {
            "ai_feedback": "⚠️ Failed to generate AI feedback. Try again."
        }
