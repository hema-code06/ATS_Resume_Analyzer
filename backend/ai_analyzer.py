from transformers import pipeline
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

    skill_score = (len(found_skills) / len(COMMON_SKILLS))*70

    section_score = 0
    if "experience" in text_lower:
        section_score += 10
    if "project" in text_lower:
        section_score += 10
    if "education" in text_lower:
        section_score += 10

    total_score = int(skill_score+section_score)
    return total_score, found_skills, missing_skills


def generate_basic_feedback(score, missing_skills, text):
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


def generate_ai_feedback(text):
    generator = pipeline(
        "text2text-generation", model="google/flan-t5-small"
    )
    try:
        result = generator(...)
        return result[0]["generated_text"]
    except:
        return """- Add measurable achievements
- Improve formatting
- Include more relevant skills"""
