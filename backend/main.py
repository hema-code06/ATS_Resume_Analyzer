from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from resume_parser import extract_resume_text, analyze_resume_formatting
from ai_analyzer import analyze_resume, analyze_against_job_description
from ai_suggestions import generate_ai_suggestions

app = FastAPI(title="ATS Resume Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"message": "ATS Resume Analyzer API running successfully.."}


@app.post("/upload")
def upload_resume(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="File is required")

    try:
        text = extract_resume_text(file.file, file.filename)

        if not text:
            raise HTTPException(
                status_code=400, detail="Could not extract text from file!!"
            )

        result = analyze_resume(text)
        formatting = analyze_resume_formatting(
            file.file, file.filename, text, result["total_skills_found"]
        )

        return {
            "filename": file.filename,
            "analysis": {
                "ats_score": result["ats_score"],
                "total_skills_found": result["total_skills_found"],
                "found_skills": result["found_skills"],
                "top_roles": result["top_roles"],
            },
            "formatting_check": formatting,
            "feedback": result["feedback"],
        }

    except HTTPException:
        raise

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Resume processing failed: {str(e)}"
        )


@app.post("/match-jd")
def match_job_description(
    file: UploadFile = File(...), job_description: str = Form(...)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="File is required")

    if not job_description or not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is required")

    try:
        text = extract_resume_text(file.file, file.filename)

        if not text:
            raise HTTPException(
                status_code=400, detail="Could not extract text from file!!"
            )

        match = analyze_against_job_description(text, job_description)

        if not match["jd_skills_detected"]:
            raise HTTPException(
                status_code=400,
                detail="Could not detect any recognizable skills in the job description.",
            )

        ai = generate_ai_suggestions(
            match["skills_matched"], match["skills_missing"], job_description
        )

        return {
            "filename": file.filename,
            "match_rate": match["match_rate"],
            "jd_skills_detected": match["jd_skills_detected"],
            "skills_matched": match["skills_matched"],
            "skills_missing": match["skills_missing"],
            "ai_suggestions": ai,
        }

    except HTTPException:
        raise

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Job description matching failed: {str(e)}"
        )
