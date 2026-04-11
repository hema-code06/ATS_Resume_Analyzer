from fastapi import FastAPI, UploadFile, File, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from resume_parser import extract_resume_text
from ai_analyzer import calculate_ats_score, generate_basic_feedback, generate_ai_feedback

app = FastAPI(title="ATS Resume Analyzer API")

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
        if not file.filename:
            raise HTTPException(status_code=400, detail="File name is missing")

        text = extract_resume_text(file.file, file.filename)

        if not text or text.strip() == "":
            raise HTTPException(
                status_code=400, detail="Could not extract text from resume")

        result = calculate_ats_score(text)
        basic_feedback, color = generate_basic_feedback(result)

        return {
            "filename": file.filename,
            "analysis": {
                "ats_score": result["ats_score"],
                "color": color,
                "found_skills": result["found_skills"],
                "role_match": result["role_match"]
            },
            "feedback": {
                "basic": basic_feedback
            },
            "resume_preview": text[:1000]
        }

    except HTTPException as he:
        raise he

    except Exception as e:
        print("UPLOAD ERROR:", str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to process resume"
        )


@app.post("/ai-feedback")
async def ai_feedback(data: dict = Body(...)):
    try:
        text = data.get("text", "")

        if not text or not isinstance(text, str) or not text.strip():
            raise HTTPException(
                status_code=400,
                detail="Resume text is required"
            )

        ai_feedback_result = generate_ai_feedback(text)

        return {
            "ai_feedback": ai_feedback_result
        }

    except HTTPException as he:
        raise he

    except Exception as e:
        print("AI ERROR:", str(e))
        raise HTTPException(
            status_code=500,
            detail="AI feedback generation failed"
        )
