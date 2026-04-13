import re
import json
from typing import Dict, List, Tuple

try:
    with open("skills_data.json", "r") as f:
        CONFIG = json.load(f)
except Exception as e:
    raise RuntimeError(f"Error loading config: {e}") from e


def extract_skills(text: str) -> Tuple[Dict[str, float], float]:
    text_lower = text.lower()
    found_skills = {}
    total_weight = 0.0

    for category in CONFIG["skills"].values():
        for skill_name, keywords in category.items():
            for keyword in keywords:
                pattern = rf"(?<!\w){re.escape(keyword.lower())}(?!\w)"

                if re.search(pattern, text):
                    if skill_name not in found_skills:
                        weight = 1.0
                        found_skills[skill_name] = weight
                        total_weight += weight
                    break

    return found_skills, total_weight


def get_top_role_matches(found_skills: Dict[str, float], top_n: int = 3):
    role_results = []

    for role, data in CONFIG["roles"].items():
        role_skills = set(data["skills"])
        found = role_skills.intersection(found_skills.keys())
        missing = role_skills - found

        score = (len(found) / len(role_skills)) * 100

        role_results.append({
            "role": role,
            "match_percentage": round(score, 2),
            "found_skills": sorted(list(found)),
            "missing_skills": sorted(list(missing))
        })

    role_results.sort(key=lambda x: x["match_percentage"], reverse=True)
    return role_results[:top_n]


def calculate_ats_score(text: str):
    found_skills, total_weight = extract_skills(text)

    total_possible = sum(
        1 for category in CONFIG["skills"].values()
        for _ in category
    )

    total_possible = max(total_possible, 1)

    skill_score = (total_weight / total_possible) * 70
    section_score = 30

    ats_score = min(int(skill_score+section_score), 100)
    top_roles = get_top_role_matches(found_skills)

    return {
        "ats_score": ats_score,
        "total_skills_found": len(found_skills),
        "found_skills": sorted(list(found_skills.keys())),
        "top_roles": top_roles
    }


def generate_feedback(result: Dict):
    score = result["ats_score"]

    if score >= 75:
        level = "Strong"
        message = "Great ATS compatibility. You're on track."
    elif score >= 50:
        level = "Moderate"
        message = "Decent profile. Add more relevant skills."
    else:
        level = "Low"
        message = "Needs improvement. Focus on core skills."

    suggestions = []

    for role in result["top_roles"]:
        if role["missing_skills"]:
            suggestions.append(
                f"For {role['role']}, consider adding: {', '.join(role['missing_skills'][:5])}"
            )

    return {
        "level": level,
        "message": message,
        "suggestions": suggestions[:3]
    }
