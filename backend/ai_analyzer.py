from transformers import pipeline

generator = pipeline(
    "text-generation",
    model="gpt2"
)


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
    try:
        text = text[:500]  # limit input

        prompt = f"""
You are a resume expert.

Give exactly 3 short bullet point suggestions to improve the resume.

Do NOT repeat resume content.
Keep each point under 10 words.

Resume:
{text}

Suggestions:
- 
- 
- 
"""

        result = generator(
            prompt,
            max_new_tokens=60,
            num_return_sequences=1,
            do_sample=True,
            temperature=0.7
        )

        output = result[0]["generated_text"]

        # Extract only generated part
        if "Suggestions:" in output:
            output = output.split("Suggestions:")[-1]

        # Clean lines
        lines = output.split("\n")

        clean_lines = []
        for line in lines:
            line = line.strip()

            if (
                line.startswith("-")
                and len(line) > 3
                and not any(word in line.lower() for word in ["email", "linkedin", "github", "phone"])
            ):
                clean_lines.append(line)

        # Ensure exactly 3 points
        return "\n".join(clean_lines[:3]) if clean_lines else """- Add measurable achievements
- Improve formatting
- Include more relevant skills"""

    except Exception as e:
        print("AI ERROR:", str(e))
        return """- Add measurable achievements
- Improve formatting
- Include more relevant skills"""