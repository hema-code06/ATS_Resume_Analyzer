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

    for level in CONFIG.get("skillValueMap", {}):
        for skill in CONFIG["skillValueMap"][level]:
            skill_map[skill.lower().strip()] = skill.lower().strip()

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
        pattern = r"\b" + re.escape(variant) + r"\b"
        if re.search(pattern, text):
            detected.add(canonical)

    cleaned = set()
    for skill in detected:
        base = skill.replace("apis", "api").strip()
        base = base.replace("restful api", "rest api")
        cleaned.add(base)

    return sorted(list(cleaned))


def filter_low_value_skills(skills: List[str]) -> List[str]:
    skill_map = CONFIG.get("skillValueMap", {})
    low = set(skill_map.get("LOW", []))

    return [s for s in skills if s.lower().strip() not in low and len(s) > 2]


def get_skill_value(skill: str) -> int:
    skill_map = CONFIG.get("skillValueMap", {})
    skill_lower = skill.lower().strip()

    if skill_lower in skill_map.get("HIGH", []):
        return 3
    elif skill_lower in skill_map.get("MEDIUM", []):
        return 2
    elif skill_lower in skill_map.get("LOW", []):
        return 1
    return 2


def calculate_role_match(found_skills: List[str]) -> List[Dict]:
    weights = CONFIG["scoringWeights"]
    results = []

    found = set(s.lower().strip() for s in found_skills)

    for role in CONFIG["jobRoles"]:
        required = set(s.lower().strip() for s in role["requiredSkills"])
        preferred = set(s.lower().strip() for s in role["preferredSkills"])

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

        all_matched = list(req_match | pref_match)
        all_matched.sort(key=lambda s: get_skill_value(s), reverse=True)

        all_missing = list(missing_req | missing_pref)
        all_missing.sort(key=lambda s: get_skill_value(s), reverse=True)

        results.append({
            "role_title": role["title"],
            "role_category": role["category"],
            "match_percentage": round(final_score, 2),
            "skills_you_have": all_matched,
            "total_matched_skills": len(all_matched),
            "missing_required_skills": sorted(missing_req),
            "missing_preferred_skills": sorted(missing_pref),
            "all_missing_skills": all_missing,
            "total_missing_skills": len(all_missing),
            "required_match_rate": round(req_score, 1),
            "preferred_match_rate": round(pref_score, 1)
        })

    return sorted(results, key=lambda x: x["match_percentage"], reverse=True)[:3]


def calculate_ats_score(found_skills: List[str]) -> int:
    skill_map = CONFIG.get("skillValueMap", {})
    HIGH_VALUE = set(skill_map.get("HIGH", []))
    MEDIUM_VALUE = set(skill_map.get("MEDIUM", []))
    LOW_VALUE = set(skill_map.get("LOW", []))

    score = 0

    for skill in found_skills:
        skill = skill.lower().strip()

        if skill in HIGH_VALUE:
            score += 6

        elif skill in MEDIUM_VALUE:
            score += 3

        elif skill in LOW_VALUE:
            score += 1

        else:
            score += 2

    max_score = len(found_skills) * 6 if found_skills else 1
    normalized = min(int((score / max_score) * 100), 100)

    return normalized


def generate_smart_insights(ats_score: int, top_roles: List[Dict], found_skills: List[str]) -> Dict:

    thresholds = CONFIG["matchingThresholds"]
    skill_map = CONFIG.get("skillValueMap", {})

    high_skills = [s for s in found_skills if s.lower()
                   in skill_map.get("HIGH", [])]
    medium_skills = [s for s in found_skills if s.lower()
                     in skill_map.get("MEDIUM", [])]

    if ats_score >= thresholds["excellent"]:
        level = "Excellent"
        emoji = "🎉"
    elif ats_score >= thresholds["good"]:
        level = "Good"
        emoji = "✅"
    elif ats_score >= thresholds["fair"]:
        level = "Fair"
        emoji = "⚠️"
    else:
        level = "Poor"
        emoji = "❌"

    return {
        "level": level,
        "emoji": emoji,
        "ats_score": ats_score,
        "skill_breakdown": {
            "high_value_count": len(high_skills),
            "medium_value_count": len(medium_skills),
            "total_skills": len(found_skills)
        }
    }


def analyze_resume(text: str) -> Dict:
    found_skills = normalize_skills(text)
    found_skills = filter_low_value_skills(found_skills)
    top_roles = calculate_role_match(found_skills)
    ats_score = calculate_ats_score(found_skills)
    feedback = generate_smart_insights(ats_score, top_roles, found_skills)

    return {
        "ats_score": ats_score,
        "total_skills_found": len(found_skills),
        "found_skills": found_skills,
        "top_roles": top_roles,
        "feedback": feedback
    }
