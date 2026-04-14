import re
import json
from typing import Dict, List

with open("skills_data.json", "r") as f:
    CONFIG = json.load(f)


def build_skill_map():
    skill_map = {}

    for role in CONFIG["jobRoles"]:
        for skill in role["requiredSkills"] + role["preferredSkills"]:
            canonical = skill.lower().strip()

            skill_map[canonical] = canonical

            variations = CONFIG.get("skillVariations", {}).get(skill, [])
            for v in variations:
                skill_map[v.lower().strip()] = canonical

    return skill_map


def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s\+\#\.]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def normalize_skills(text: str) -> List[str]:
    text = normalize_text(text)
    skill_map = build_skill_map()

    detected = set()

    for variant, canonical in skill_map.items():
        if variant in text:
            detected.add(canonical)

    return sorted(list(detected))


def calculate_role_match(found_skills: List[str]) -> List[Dict]:
    weights = CONFIG["scoringWeights"]
    results = []

    found = set(found_skills)

    for role in CONFIG["jobRoles"]:
        required = set(s.lower() for s in role["requiredSkills"])
        preferred = set(s.lower() for s in role["preferredSkills"])

        req_match = required & found
        pref_match = preferred & found

        missing_req = required - found
        missing_pref = preferred - found

        req_score = (len(req_match) / len(required)) * 100 if required else 0
        pref_score = (len(pref_match) / len(preferred)) * \
            100 if preferred else 0

        final_score = (
            req_score * weights["requiredSkillMatch"] +
            pref_score * weights["preferredSkillMatch"]
        )

        results.append({
            "role_title": role["title"],
            "match_percentage": round(final_score, 2),
            "skills_you_have": sorted(req_match | pref_match),
            "missing_required_skills": sorted(missing_req),
            "missing_preferred_skills": sorted(missing_pref)
        })

    return sorted(results, key=lambda x: x["match_percentage"], reverse=True)[:3]


def calculate_ats_score(found_skills: List[str]) -> int:
    found = set(found_skills)

    HIGH_VALUE = {
        "react", "node.js", "node", "express.js",
        "mongodb", "postgresql", "sql",
        "aws", "docker", "kubernetes",
        "python", "java", "typescript"
    }

    MEDIUM_VALUE = {
        "redux", "git", "rest api", "rest apis", "restful apis",
        "html", "css", "javascript", "sass", "jest",
        "postman", "jenkins"
    }

    LOW_VALUE = {
        "linkedin", "r", "logging", "scheduling",
        "networking", "onboarding"
    }

    score = 0

    for skill in found:

        if skill in HIGH_VALUE:
            score += 6

        elif skill in MEDIUM_VALUE:
            score += 3

        elif skill in LOW_VALUE:
            score += 1

        else:
            score += 2
    max_score = 100
    normalized = min(int((score / 180) * 100), 100)

    return normalized


def generate_feedback(ats_score: int, top_roles: List[Dict]) -> Dict:
    thresholds = CONFIG["matchingThresholds"]

    if ats_score >= thresholds["excellent"]:
        level = "Excellent"
        message = "Your resume is highly ATS optimized."
    elif ats_score >= thresholds["good"]:
        level = "Good"
        message = "Strong resume with minor improvements needed."
    elif ats_score >= thresholds["fair"]:
        level = "Fair"
        message = "Average resume. Add missing core skills."
    else:
        level = "Poor"
        message = "Low ATS compatibility. Improve core skills."

    suggestions = []

    for role in top_roles:
        if role["missing_required_skills"]:
            suggestions.append(
                f"{role['role_title']}: Add {', '.join(role['missing_required_skills'][:5])}"
            )

    return {
        "level": level,
        "message": message,
        "suggestions": suggestions[:3]
    }


def analyze_resume(text: str) -> Dict:
    found_skills = normalize_skills(text)
    top_roles = calculate_role_match(found_skills)
    ats_score = calculate_ats_score(found_skills)
    feedback = generate_feedback(ats_score, top_roles)

    return {
        "ats_score": ats_score,
        "total_skills_found": len(found_skills),
        "found_skills": found_skills,
        "top_roles": top_roles,
        "feedback": feedback
    }
