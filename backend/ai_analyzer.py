import json
from transformers import pipeline

with open("skills_data.json", "r") as f:
    CONFIG = json.load(f)

generator = pipeline(
    "text-generation",
    model="gpt2"
)


def extract_skills(text):
    text_lower = text.lower()

    found_skills = {}
    total_weight = 0

    for category, skills in CONFIG["skills"].items():
        for skill_name, skill_data in skills.items():
            for keyword in skill_data["keywords"]:
                if keyword in text_lower:
                    found_skills[skill_name] = skill_data["weight"]
                    total_weight += skill_data["weight"]
                    break

    return found_skills, total_weight


def check_sections(text):
    text_lower = text.lower()

    required = CONFIG["sections"]["required"]

    found_sections = []
    missing_sections = []

    for section in required:
        if section.lower() in text_lower:
            found_sections.append(section)
        else:
            missing_sections.append(section)

    return found_sections, missing_sections


def calculate_role_match(found_skills):
    role_scores = {}

    for role, data in CONFIG["roles"].items():
        role_skill_count = len(data["skills"])
        match_count = 0

        for skill in data["skills"]:
            if skill in found_skills:
                match_count += 1

        score = (match_count / role_skill_count) * 100
        score *= data["weight"]

        role_scores[role] = int(score)

    return role_scores


def calculate_ats_score(text):
    found_skills, total_weight = extract_skills(text)
    found_sections, missing_sections = check_sections(text)

    max_possible_weight = sum(
        skill["weight"]
        for category in CONFIG["skills"].values()
        for skill in category.values()
    )

    skill_score = (total_weight / max_possible_weight) * 70
    section_score = (len(found_sections) /
                     len(CONFIG["sections"]["required"])) * 30

    total_score = int(skill_score + section_score)

    role_scores = calculate_role_match(found_skills)

    return {
        "ats_score": total_score,
        "found_skills": found_skills,
        "missing_sections": missing_sections,
        "role_match": role_scores
    }


def generate_basic_feedback(result, text):
    score = result["ats_score"]
    feedback = []

    if score > 75:
        feedback.append("Good ATS compatibility.")
        color = "green"
    elif score > 50:
        feedback.append("Moderate ATS score. Improve skill coverage.")
        color = "orange"
    else:
        feedback.append("Low ATS score. Add more relevant skills.")
        color = "red"

    if result["missing_sections"]:
        feedback.append(
            f"Missing sections: {', '.join(result['missing_sections'])}")

    if len(result["found_skills"]) < 5:
        feedback.append("Add more technical skills to improve ranking.")

    return feedback, color


def generate_ai_feedback(text):
    try:
        text = text[:500]

        prompt = f"""
You are a resume expert.

Give exactly 3 short bullet point suggestions.

Keep each under 10 words.

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

        if "Suggestions:" in output:
            output = output.split("Suggestions:")[-1]

        lines = output.split("\n")

        clean_lines = []
        for line in lines:
            line = line.strip()

            if line.startswith("-") and len(line) > 3:
                clean_lines.append(line)

        return "\n".join(clean_lines[:3]) if clean_lines else """- Add measurable achievements
- Improve formatting
- Include more relevant skills"""

    except Exception as e:
        print("AI ERROR:", str(e))
        return """- Add measurable achievements
- Improve formatting
- Include more relevant skills"""
