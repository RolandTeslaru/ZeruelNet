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



SIGN_AGREEMENT_THRESHOLD = 0.2

def calculate(identified_subjects: List[dict], llm_score: float, alpha: float = 0.5) -> Tuple[float, float, float]:
    det_score = get_deterministic(identified_subjects)

    alignment_conflict = abs(det_score - llm_score)

    llm_is_positive = llm_score > SIGN_AGREEMENT_THRESHOLD
    llm_is_negative = llm_score < -SIGN_AGREEMENT_THRESHOLD

    det_is_positive = det_score > SIGN_AGREEMENT_THRESHOLD
    det_is_negative = det_score < -SIGN_AGREEMENT_THRESHOLD

    signs_clash = (llm_is_positive and det_is_negative) or (llm_is_negative and det_is_positive)

    if signs_clash:
        final_alignment = det_score
    else:
        # Blend scores: alpha = 0 trust LLM, alpha = 1 trust deterministic
        final_alignment = (1 - alpha) * llm_score + alpha * det_score

    final_alignment = max(-1.0, min(1.0, final_alignment))

    # Mutate identified_subjects with knowledge base data
    for subject in identified_subjects:
        subject_raw: str = subject.get("subject", "")
        stance: float = float(subject.get("stance", 0.0))
        
        # Resolve aliases and fetch KB entry
        canonical: str = _resolve_alias(subject_raw)
        kb_entry: dict = MODEL_KNOWLEDGE.get(canonical, {})
        
        subject["isInKnowledge"] = bool(kb_entry)
 
        # Add knowledge base data to the subject
        subject["expected_alignment"] = float(kb_entry.get("alignment_tendency", 0.0))
        subject["alignment_score"] = stance * subject["expected_alignment"]
        subject["alignment_gap"] = abs(stance - subject["expected_alignment"])

    return final_alignment, det_score, alignment_conflict