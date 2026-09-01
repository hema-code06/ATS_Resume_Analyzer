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
    lookup = {}
    for level in ["HIGH", "MEDIUM", "LOW"]:
        for skill in CONFIG.get("skillValueMap", {}).get(level, []):
            lookup[skill.lower().strip()] = level
    return lookup


def build_cluster_lookup() -> Dict[str, int]:
    lookup = {}
    for idx, cluster in enumerate(CONFIG.get("skillClusters", [])):
        for skill in cluster:
            lookup[skill.lower().strip()] = idx
    return lookup


def build_role_alias_lookup() -> Dict[str, str]:
    lookup = {}
    for role in CONFIG["jobRoles"]:
        lookup[role["title"].lower().strip()] = role["title"]
    for canonical_title, aliases in CONFIG.get("roleAliases", {}).items():
        for alias in aliases:
            lookup[alias.lower().strip()] = canonical_title
    return lookup


SKILL_MAP = build_skill_map()
TIER_LOOKUP = build_tier_lookup()
CLUSTER_LOOKUP = build_cluster_lookup()
ROLE_ALIAS_LOOKUP = build_role_alias_lookup()
SENIORITY_WORDS = CONFIG.get("matchFairness", {}).get("seniorityWords", [])

TIER_WEIGHT = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}
PARTIAL_CREDIT_RATIO = CONFIG.get("matchFairness", {}).get("partialCreditRatio", 0.5)
CURVE_EXPONENT = CONFIG.get("matchFairness", {}).get("curveExponent", 0.75)
PRIORITY_BOOST = CONFIG.get("matchFairness", {}).get("priorityBoost", 20)


def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s\+\#\.\-\/]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def detect_all_skills(text: str) -> List[str]:
    normalized = normalize_text(text)
    exact = set()

    for variant, canonical in SKILL_MAP.items():
        if re.search(r"\b" + re.escape(variant) + r"\b", normalized):
            exact.add(canonical)

    return sorted(exact)


def filter_low_value_skills(skills: List[str]) -> List[str]:
    skill_map = CONFIG.get("skillValueMap", {})
    low = set(s.lower().strip() for s in skill_map.get("LOW", []))
    return [s for s in skills if s.lower().strip() not in low and len(s) > 2]


def get_tier_weight(skill: str) -> int:
    tier = TIER_LOOKUP.get(skill.lower().strip(), "MEDIUM")
    return TIER_WEIGHT[tier]


def has_related_skill(missing_skill: str, found_skills_set: set) -> bool:
    cluster_id = CLUSTER_LOOKUP.get(missing_skill.lower().strip())
    if cluster_id is None:
        return False
    cluster = CONFIG["skillClusters"][cluster_id]
    cluster_set = set(s.lower().strip() for s in cluster)
    return bool(found_skills_set & cluster_set)


def apply_fairness_curve(rate: float) -> float:
    if rate <= 0:
        return 0.0
    curved = 100 * ((rate / 100) ** CURVE_EXPONENT)
    return min(curved, 100.0)


def weighted_skill_match(
    skill_list: List[str], found_skills_set: set
) -> Tuple[float, List[str], List[str]]:
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


def strip_seniority_words(text: str) -> str:
    words = text.split()
    filtered = [w for w in words if w not in SENIORITY_WORDS]
    return " ".join(filtered).strip()


def resolve_priority_skills(priority: str) -> set:
    if not priority:
        return set()
    normalized = normalize_text(priority)
    matched = set()
    for variant, canonical in SKILL_MAP.items():
        if re.search(r"\b" + re.escape(variant) + r"\b", normalized):
            matched.add(canonical)
    return matched


def resolve_priority_role(priority: str) -> str:
    if not priority:
        return None
    core = strip_seniority_words(priority.strip().lower())
    if core in ROLE_ALIAS_LOOKUP:
        return ROLE_ALIAS_LOOKUP[core]
    for alias, title in ROLE_ALIAS_LOOKUP.items():
        if len(core) < 2 or len(alias) < 2:
            continue
        if re.search(r"\b" + re.escape(alias) + r"\b", core) or re.search(
            r"\b" + re.escape(core) + r"\b", alias
        ):
            return title
    return None


def calculate_role_match(
    found_skills: List[str], priority: str = None
) -> Tuple[List[Dict], Dict]:
    weights = CONFIG["scoringWeights"]
    found = set(s.lower().strip() for s in found_skills)
    priority_norm = priority.strip().lower() if priority else None
    priority_skills = resolve_priority_skills(priority) if priority else set()
    priority_role = resolve_priority_role(priority) if priority else None

    results = []
    matched_roles = []

    for role in CONFIG["jobRoles"]:
        required = role["requiredSkills"]
        preferred = role["preferredSkills"]

        req_rate_raw, req_matched, req_missing = weighted_skill_match(required, found)
        pref_rate_raw, pref_matched, pref_missing = weighted_skill_match(
            preferred, found
        )

        all_matched = sorted(
            set(req_matched) | set(pref_matched),
            key=lambda s: get_tier_weight(s),
            reverse=True,
        )

        rank_score = (
            req_rate_raw * weights["requiredSkillMatch"]
            + pref_rate_raw * weights["preferredSkillMatch"]
        )

        is_priority = False
        if priority_norm:
            title_lower = role["title"].lower()
            category_lower = role["category"].lower()
            role_skills = set(s.lower().strip() for s in required + preferred)

            if (
                priority_norm == title_lower
                or priority_norm == category_lower
                or priority_norm in title_lower
            ):
                rank_score += PRIORITY_BOOST
                is_priority = True
                matched_roles.append(role["title"])
            elif priority_role == role["title"]:
                rank_score += PRIORITY_BOOST
                is_priority = True
                matched_roles.append(role["title"])
            elif priority_skills & role_skills:
                rank_score += PRIORITY_BOOST * 0.5
                is_priority = True
                matched_roles.append(role["title"])

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
                "prioritized": is_priority,
                "_rank_score": rank_score,
            }
        )

    results.sort(key=lambda x: x["_rank_score"], reverse=True)
    top_roles = results[:3]

    for role in top_roles:
        del role["_rank_score"]

    priority_status = None
    if priority:
        top_titles = set(r["role_title"] for r in top_roles)
        priority_status = {
            "input": priority,
            "recognized": bool(matched_roles),
            "matched_skills": sorted(priority_skills),
            "matched_roles": sorted(set(matched_roles)),
            "in_top_results": bool(set(matched_roles) & top_titles),
        }

    return top_roles, priority_status


def calculate_ats_score(found_skills: List[str]) -> int:
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


def analyze_resume(text: str, priority: str = None) -> Dict:
    all_found_skills = detect_all_skills(text)
    scored_skills = filter_low_value_skills(all_found_skills)

    top_roles, priority_status = calculate_role_match(
        all_found_skills, priority=priority
    )
    ats_score = calculate_ats_score(scored_skills)
    feedback = generate_smart_insights(ats_score, top_roles, scored_skills)

    return {
        "ats_score": ats_score,
        "total_skills_found": len(scored_skills),
        "found_skills": scored_skills,
        "top_roles": top_roles,
        "feedback": feedback,
        "priority_applied": priority_status,
    }
