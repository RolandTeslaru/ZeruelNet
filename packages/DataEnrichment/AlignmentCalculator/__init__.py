from knowledge import MODEL_KNOWLEDGE
from functools import lru_cache
from typing import Dict, List, Tuple

# Alias resolution
@lru_cache(maxsize=1)
def _build_alias_map() -> Dict[str, str]:
    alias_map: Dict[str, str] = {}
    for canonical, data in MODEL_KNOWLEDGE.items():
        canonical_lower = canonical.lower() 
        alias_map[canonical_lower] = canonical_lower 

        for alias in data.get("aliases", []):
            alias_map[alias.lower()] = canonical_lower
    return alias_map


def _resolve_alias(name: str) -> str:
    return _build_alias_map().get(name.lower().strip(), name.lower().strip())


# calculates the deterministic alignment based on the identified subjects and compares them to the KnowledgeBase
def get_deterministic(identified: List[dict] = []) -> float:
    total_contrib: float = 0.0
    total_weight: float = 0.0

    for item in identified:
        subject_raw: str = item.get("subject", "")
        stance: float = float(item.get("stance", 0.0))

        # Resolve aliases and fetch KB entry
        canonical: str = _resolve_alias(subject_raw)
        kb_entry: dict = MODEL_KNOWLEDGE.get(canonical, {})

        tendency: float = float(kb_entry.get("alignment_tendency", 0.0))
        subject_weight: float = float(kb_entry.get("weight", 1.0))

        contribution = stance * tendency * subject_weight

        total_contrib += contribution
        total_weight += abs(tendency * subject_weight) if tendency else 0.0

    det_score: float = total_contrib / total_weight if total_weight else 0.0
    det_score = max(-1.0, min(1.0, det_score))

    return det_score


def calculate(identified_subjects: List[dict], llm_score: float, alpha: float = 0.5) -> Tuple[float, float, float]:
    det_score = get_deterministic(identified_subjects)

    same_sign = (llm_score >= 0 and det_score >= 0) or (llm_score <= 0 and det_score <= 0)

    alignment_conflict = abs(det_score - llm_score)

    # use determinstic score if signs clash 
    if not same_sign:
        final_alignment = det_score
    else:
        # Blend scores: alpha = 0 trust LLM, alpha = 1 trust deterministic
        final_alignment = (1 - alpha) * llm_score + alpha * det_score

    final_alignment = max(-1.0, min(1.0, final_alignment))

    return final_alignment, det_score, alignment_conflict