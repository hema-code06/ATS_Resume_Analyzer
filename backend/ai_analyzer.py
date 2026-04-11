import re
import json
from transformers import pipeline

with open("skills_data.json", "r") as f:
    CONFIG = json.load(f)

generator = pipeline(
    "text-generation",
    model="distilgpt2"
)


def extract_skills(text):
    text_lower = text.lower()

    found_skills = {}
    total_weight = 0

    for category, skills in CONFIG["skills"].items():
        for skill_name, skill_data in skills.items():

            keywords = skill_data
            weight = 0.5

            for keyword in keywords:
                pattern = r'(?<!\w)' + re.escape(keyword.lower()) + r'(?!\w)'

                if skill_name not in found_skills:
                    found_skills[skill_name] = weight
                    total_weight += weight
                    break

    return found_skills, total_weight


def calculate_role_match(found_skills):
    role_scores = {}

    for role, data in CONFIG["roles"].items():
        role_skills = data["skills"]

        match_count = sum(
            1 for skill in role_skills if skill in found_skills
        )

        score = (match_count / len(role_skills)) * 100

        role_scores[role] = round(score, 2)

    return role_scores


def calculate_ats_score(text):
    found_skills, total_weight = extract_skills(text)

    max_possible_weight = sum(
        0.5
        for category in CONFIG["skills"].values()
        for _ in category.values()
    )

    max_possible_weight = max(max_possible_weight, 1)

    skill_score = (total_weight / max_possible_weight) * 70
    section_score = 30

    total_score = min(int(skill_score + section_score), 100)

    role_scores = calculate_role_match(found_skills)

    return {
        "ats_score": min(total_score, 100),
        "found_skills": found_skills,
        "role_match": role_scores
    }


def generate_basic_feedback(result):
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

        lines = [
            line.strip()
            for line in output.split("\n")
            if line.strip().startswith("-")
        ]

        return "\n".join(lines[:3]) if lines else \
            "- Add measurable achievements\n- Improve formatting\n- Add relevant skills"

    except Exception as e:
        print("AI ERROR:", str(e))
        return "- Add measurable achievements\n- Improve formatting\n- Add relevant skills"
