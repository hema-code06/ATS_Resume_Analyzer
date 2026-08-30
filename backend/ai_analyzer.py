import re
import json
from pathlib import Path
from typing import Dict, List, Tuple

CONFIG_PATH = Path(__file__).parent / "skills_data.json"
with open(CONFIG_PATH, "r", encoding="utf-8") as f:
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


def build_tier_lookup() -> Dict[str, str]:
    """Maps every classified skill (lowercased) to its tier: HIGH / MEDIUM / LOW."""
    lookup = {}
    for level in ["HIGH", "MEDIUM", "LOW"]:
        for skill in CONFIG.get("skillValueMap", {}).get(level, []):
            lookup[skill.lower().strip()] = level
    return lookup


def build_cluster_lookup() -> Dict[str, int]:
    """Maps every skill (lowercased) in a skillClusters group to that group's index,
    so we can check whether a resume has a *related* skill for one it's missing."""
    lookup = {}
    for idx, cluster in enumerate(CONFIG.get("skillClusters", [])):
        for skill in cluster:
            lookup[skill.lower().strip()] = idx
    return lookup


SKILL_MAP = build_skill_map()
TIER_LOOKUP = build_tier_lookup()
CLUSTER_LOOKUP = build_cluster_lookup()

TIER_WEIGHT = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}
PARTIAL_CREDIT_RATIO = CONFIG.get("matchFairness", {}).get("partialCreditRatio", 0.5)
CURVE_EXPONENT = CONFIG.get("matchFairness", {}).get("curveExponent", 0.75)


def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s\+\#\.\-\/]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def normalize_skills(text: str) -> List[str]:
    """Detects every skill mentioned in the resume, including soft/LOW-tier skills.
    This full, unfiltered list is what role matching runs against."""
    text = normalize_text(text)
    detected = set()

    for variant, canonical in SKILL_MAP.items():
        pattern = r"\b" + re.escape(variant) + r"\b"
        if re.search(pattern, text):
            detected.add(canonical)

    return sorted(detected)


def filter_low_value_skills(skills: List[str]) -> List[str]:
    """Strips LOW-tier (generic soft) skills out. Used only for the overall ATS
    score and the displayed 'found skills' list — NOT for role matching, since a
    role can legitimately require a soft skill like Communication."""
    skill_map = CONFIG.get("skillValueMap", {})
    low = set(s.lower().strip() for s in skill_map.get("LOW", []))

    return [s for s in skills if s.lower().strip() not in low and len(s) > 2]


def get_tier_weight(skill: str) -> int:
    tier = TIER_LOOKUP.get(skill.lower().strip(), "MEDIUM")
    return TIER_WEIGHT[tier]


def has_related_skill(missing_skill: str, found_skills_set: set) -> bool:
    """True if the resume has a different skill from the same cluster as a
    missing one (e.g. missing 'React' but resume has 'Vue.js')."""
    cluster_id = CLUSTER_LOOKUP.get(missing_skill.lower().strip())
    if cluster_id is None:
        return False
    cluster = CONFIG["skillClusters"][cluster_id]
    cluster_set = set(s.lower().strip() for s in cluster)
    return bool(found_skills_set & cluster_set)


def apply_fairness_curve(rate: float) -> float:
    """Softens the old strictly-linear scoring. A resume matching roughly half
    the weighted skill value for a role now shows meaningfully above 50%,
    while a near-complete match still lands close to 100 — matching how a
    recruiter reads 'mostly there' vs 'barely started', not a flat ratio."""
    if rate <= 0:
        return 0.0
    curved = 100 * ((rate / 100) ** CURVE_EXPONENT)
    return min(curved, 100.0)


def weighted_skill_match(
    skill_list: List[str], found_skills_set: set
) -> Tuple[float, List[str], List[str]]:
    """Tier-weighted match rate for one skill list (required or preferred),
    with partial credit for related-but-not-exact skills. Returns the raw
    (uncurved) rate plus the matched and missing skill names."""
    if not skill_list:
        return 0.0, [], []

    matched = []
    missing = []
    earned = 0.0
    total = 0.0

    for skill in skill_list:
        s = skill.lower().strip()
        weight = get_tier_weight(s)
        total += weight

        if s in found_skills_set:
            earned += weight
            matched.append(skill)
        elif has_related_skill(s, found_skills_set):
            earned += weight * PARTIAL_CREDIT_RATIO
            missing.append(skill)
        else:
            missing.append(skill)

    rate = (earned / total) * 100 if total else 0.0
    return rate, matched, missing


def calculate_role_match(found_skills: List[str]) -> List[Dict]:
    """Ranks all roles by a skills-only weighted match, then returns the top 3
    with separate required/preferred match rates. No blended per-role score
    is exposed - required and preferred are reported independently since they
    answer different questions."""
    weights = CONFIG["scoringWeights"]
    found = set(s.lower().strip() for s in found_skills)

    results = []

    for role in CONFIG["jobRoles"]:
        required = role["requiredSkills"]
        preferred = role["preferredSkills"]

        req_rate_raw, req_matched, req_missing = weighted_skill_match(required, found)
        pref_rate_raw, pref_matched, pref_missing = weighted_skill_match(preferred, found)

        all_matched = sorted(
            set(req_matched) | set(pref_matched),
            key=lambda s: get_tier_weight(s),
            reverse=True,
        )

        rank_score = (
            req_rate_raw * weights["requiredSkillMatch"]
            + pref_rate_raw * weights["preferredSkillMatch"]
        )

        results.append(
            {
                "role_title": role["title"],
                "role_category": role["category"],
                "skills_you_have": all_matched,
                "total_matched_skills": len(all_matched),
                "missing_required_skills": sorted(req_missing),
                "missing_preferred_skills": sorted(pref_missing),
                "required_match_rate": round(apply_fairness_curve(req_rate_raw), 1),
                "preferred_match_rate": round(apply_fairness_curve(pref_rate_raw), 1),
                "_rank_score": rank_score,
            }
        )

    results.sort(key=lambda x: x["_rank_score"], reverse=True)
    top_roles = results[:3]

    for role in top_roles:
        del role["_rank_score"]

    return top_roles


def calculate_ats_score(found_skills: List[str]) -> int:
    """Overall resume strength score, independent of any specific role.
    Rewards HIGH/MEDIUM value skills found in the resume; LOW-tier (soft)
    skills never reach here since they're filtered out beforehand."""
    skill_map = CONFIG.get("skillValueMap", {})
    HIGH_VALUE = set(s.lower().strip() for s in skill_map.get("HIGH", []))
    MEDIUM_VALUE = set(s.lower().strip() for s in skill_map.get("MEDIUM", []))
    LOW_VALUE = set(s.lower().strip() for s in skill_map.get("LOW", []))

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


def generate_smart_insights(
    ats_score: int, top_roles: List[Dict], found_skills: List[str]
) -> Dict:

    thresholds = CONFIG["matchingThresholds"]
    skill_map = CONFIG.get("skillValueMap", {})

    high_skills = [s for s in found_skills if s.lower() in skill_map.get("HIGH", [])]
    medium_skills = [
        s for s in found_skills if s.lower() in skill_map.get("MEDIUM", [])
    ]

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
            "total_skills": len(found_skills),
        },
    }


def find_cross_role_skills(top_roles: List[Dict]) -> List[Dict]:
    """Of the skills the user has, which ones count toward more than one of
    their top 3 matched roles? Helps show which skills are pulling the most
    weight across their whole match, not just one role."""
    skill_role_count = {}

    for role in top_roles:
        for skill in role["skills_you_have"]:
            key = skill.lower().strip()
            if key not in skill_role_count:
                skill_role_count[key] = {"skill": skill, "roles": []}
            skill_role_count[key]["roles"].append(role["role_title"])

    overlap = [v for v in skill_role_count.values() if len(v["roles"]) > 1]
    overlap.sort(key=lambda v: len(v["roles"]), reverse=True)

    return overlap


def find_high_impact_missing_skills(top_roles: List[Dict], limit: int = 5) -> List[Dict]:
    """Among the skills missing from the user's top 3 role matches, which
    ones would unlock the most roles out of all 30 if learned? Lets someone
    prioritize the highest-leverage skill to learn next instead of guessing."""
    missing_pool = set()
    for role in top_roles:
        for skill in role["missing_required_skills"] + role["missing_preferred_skills"]:
            missing_pool.add(skill.lower().strip())

    demand_count = {}
    demand_name = {}
    for role in CONFIG["jobRoles"]:
        role_skills = set(
            s.lower().strip() for s in role["requiredSkills"] + role["preferredSkills"]
        )
        for skill in role_skills & missing_pool:
            demand_count[skill] = demand_count.get(skill, 0) + 1
            if skill not in demand_name:
                # keep original casing from the first role that lists it
                for s in role["requiredSkills"] + role["preferredSkills"]:
                    if s.lower().strip() == skill:
                        demand_name[skill] = s
                        break

    ranked = sorted(demand_count.items(), key=lambda x: x[1], reverse=True)

    return [
        {"skill": demand_name[skill], "roles_unlocked": count}
        for skill, count in ranked[:limit]
    ]


def analyze_resume(text: str) -> Dict:
    all_found_skills = normalize_skills(text)
    scored_skills = filter_low_value_skills(all_found_skills)
    top_roles = calculate_role_match(all_found_skills)
    ats_score = calculate_ats_score(scored_skills)
    feedback = generate_smart_insights(ats_score, top_roles, scored_skills)
    cross_role_skills = find_cross_role_skills(top_roles)
    high_impact_missing_skills = find_high_impact_missing_skills(top_roles)

    return {
        "ats_score": ats_score,
        "total_skills_found": len(scored_skills),
        "found_skills": scored_skills,
        "top_roles": top_roles,
        "feedback": feedback,
        "cross_role_skills": cross_role_skills,
        "high_impact_missing_skills": high_impact_missing_skills,
    }
