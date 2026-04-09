import re

COMMON_SKILLS = [
    "python", "java", "javascript", "react", "node", "express",
    "mongodb", "sql", "postgresql", "html", "css", "docker",
    "fastapi", "django", "flask", "git", "rest api"
]


def calculate_ats_score(text):
    text_lower = text.lower()
    found_skills = []
    missing_skills = []

    for skill in COMMON_SKILLS:
        if skill in text_lower:
            found_skills.append(skill)
        else:
            missing_skills.append(skill)

    score = int((len(found_skills) / len(COMMON_SKILLS))*100)

    return score, found_skills, missing_skills


def generate_feedback(score, missing_skills, text):
    feedback = []
    if score > 75:
        feedback.append("Good ATS compatibility.")
    elif score > 50:
        feedback.append("Moderate ATS score. Improve skill coverage.")
    else:
        feedback.append("Low ATS score. Add more relevant skills.")

    if "project" not in text.lower():
        feedback.append("Add projects experience section!!")

    if "experience" not in text.lower():
        feedback.append("Consider adding work experience!!")

    if missing_skills:
        feedback.append(f"Missing skills:{', '.join(missing_skills[:5])}")

    return feedback
