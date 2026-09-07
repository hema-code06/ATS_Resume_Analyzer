import os
import json
from typing import Dict, List

from ai_analyzer import get_tier_weight, CLUSTER_LOOKUP, CONFIG

try:
    from groq import Groq
except ImportError:
    Groq = None

MODEL = "openai/gpt-oss-20b"
MAX_SUGGESTIONS = 5


def generate_rule_based_suggestions(
    skills_matched: List[str], skills_missing: List[str]
) -> List[str]:
    matched_set = set(s.lower().strip() for s in skills_matched)
    ranked = sorted(skills_missing, key=get_tier_weight, reverse=True)[:MAX_SUGGESTIONS]

    suggestions = []
    for skill in ranked:
        cluster_id = CLUSTER_LOOKUP.get(skill.lower().strip())
        related = None
        if cluster_id is not None:
            for c_skill in CONFIG["skillClusters"][cluster_id]:
                if c_skill.lower().strip() in matched_set:
                    related = c_skill
                    break

        if related:
            suggestions.append(
                f"Learn {skill} next - you already know {related}, a closely related "
                f"skill, so this should be a fairly natural next step."
            )
        else:
            suggestions.append(
                f"Learn {skill} - it's one of the higher-priority skills this job is looking for."
            )

    return suggestions


def generate_llm_suggestions(
    skills_matched: List[str], skills_missing: List[str], jd_text: str
) -> List[str]:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key or Groq is None:
        return None

    prompt = f"""A candidate's resume is being compared against a job description.

Skills the candidate already has that match this job: {", ".join(skills_matched) or "none"}
Skills required by this job that the candidate is missing: {", ".join(skills_missing)}

Job description excerpt:
{jd_text[:1500]}

Give up to {MAX_SUGGESTIONS} short, specific, prioritized suggestions for which missing skills
this candidate should focus on learning first, and briefly why, based only on the skills listed
above. Do not invent skills that are not in the missing list. Do not comment on resume formatting
or wording. Respond with ONLY a JSON array of strings, no other text, no markdown fences."""

    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}],
    )
    raw_text = response.choices[0].message.content
    cleaned = raw_text.strip().strip("`").strip()
    if cleaned.startswith("json"):
        cleaned = cleaned[4:].strip()

    suggestions = json.loads(cleaned)
    if not isinstance(suggestions, list):
        raise ValueError("Response was not a JSON array")

    return suggestions[:MAX_SUGGESTIONS]


def generate_ai_suggestions(
    skills_matched: List[str], skills_missing: List[str], jd_text: str
) -> Dict:
    if not skills_missing:
        return {"available": True, "source": "none", "suggestions": []}

    try:
        llm_result = generate_llm_suggestions(skills_matched, skills_missing, jd_text)
        if llm_result is not None:
            return {"available": True, "source": "ai", "suggestions": llm_result}
    except Exception:
        pass

    fallback = generate_rule_based_suggestions(skills_matched, skills_missing)
    return {"available": True, "source": "rule-based", "suggestions": fallback}
