import os
import json
from typing import Dict, List

try:
    from anthropic import Anthropic
except ImportError:
    Anthropic = None

MODEL = "claude-haiku-4-5-20251001"
MAX_SUGGESTIONS = 5


def generate_ai_suggestions(
    skills_matched: List[str], skills_missing: List[str], jd_text: str
) -> Dict:
    api_key = os.environ.get("ANTHROPIC_API_KEY")

    if not api_key:
        return {
            "available": False,
            "reason": "AI suggestions are not configured on this server.",
            "suggestions": [],
        }

    if Anthropic is None:
        return {
            "available": False,
            "reason": "The anthropic package is not installed.",
            "suggestions": [],
        }

    if not skills_missing:
        return {
            "available": True,
            "reason": None,
            "suggestions": [],
        }

    prompt = f"""A candidate's resume is being compared against a job description.

Skills the candidate already has that match this job: {", ".join(skills_matched) or "none"}
Skills required by this job that the candidate is missing: {", ".join(skills_missing)}

Job description excerpt:
{jd_text[:1500]}

Give up to {MAX_SUGGESTIONS} short, specific, prioritized suggestions for which missing skills
this candidate should focus on learning first, and briefly why, based only on the skills listed
above. Do not invent skills that are not in the missing list. Do not comment on resume formatting
or wording. Respond with ONLY a JSON array of strings, no other text, no markdown fences."""

    try:
        client = Anthropic(api_key=api_key)
        response = client.messages.create(
            model=MODEL,
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )
        raw_text = "".join(
            block.text for block in response.content if block.type == "text"
        )
        cleaned = raw_text.strip().strip("`").strip()
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()

        suggestions = json.loads(cleaned)
        if not isinstance(suggestions, list):
            raise ValueError("Response was not a JSON array")

        return {
            "available": True,
            "reason": None,
            "suggestions": suggestions[:MAX_SUGGESTIONS],
        }

    except Exception as e:
        return {
            "available": False,
            "reason": f"AI suggestion generation failed: {e}",
            "suggestions": [],
        }
