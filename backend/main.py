from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from resume_parser import extract_resume_text
from ai_analyzer import calculate_ats_score, generate_feedback

app = FastAPI(title="ATS Resume Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {
        "message": "ATS Resume Analyzer API running successfully.."
    }


@app.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="File is required")

    try:
        text = extract_resume_text(file.file, file.filename)

        if not text:
            raise HTTPException(
                status_code=400, detail="Could not extract text from file")

        result = calculate_ats_score(text)
        feedback = generate_feedback(result)

        return {
            "filename": file.filename,
            "analysis": {
                "ats_score": result["ats_score"],
                "total_skills_found": result["total_skills_found"],
                "found_skills": result["found_skills"],
                "top_roles": result["top_roles"]
            },
            "feedback": feedback
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Resume processing failed: {str(e)}"
        )
