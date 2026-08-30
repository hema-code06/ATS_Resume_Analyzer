from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from resume_parser import extract_resume_text, analyze_resume_formatting
from ai_analyzer import analyze_resume

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
def upload_resume(file: UploadFile = File(...), priority: str = Form(None)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="File is required")

    try:
        text = extract_resume_text(file.file, file.filename)

        if not text:
            raise HTTPException(
                status_code=400, detail="Could not extract text from file!!"
            )

        result = analyze_resume(text, priority=priority)
        formatting = analyze_resume_formatting(file.file, file.filename, text)

        return {
            "filename": file.filename,
            "analysis": {
                "ats_score": result["ats_score"],
                "total_skills_found": result["total_skills_found"],
                "found_skills": result["found_skills"],
                "top_roles": result["top_roles"],
                "fuzzy_corrections": result["fuzzy_corrections"],
                "priority_applied": result["priority_applied"],
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
