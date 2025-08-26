VIDEO_ANALYSIS_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "summary": {
            "type": "STRING",
            "description": "A brief, neutral, one-paragraph summary of the video's content. CRITICAL: Must frame unsubstantiated claims as allegations made by the speaker (e.g., 'The speaker claims...', 'The video alleges...')."
        },
        "identified_subjects": {
            "type": "ARRAY",
            "description": "A list of the key political, geopolitical, or ideological subjects that are explicitly present in the video.",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "subject": {
                        "type": "STRING",
                        "description": "The canonical name of the identified subject (e.g., 'nato', 'vladimir putin', 'globalists', 'property tax')."
                    },
                    "stance": {
                        "type": "NUMBER",
                        "description": "The video's specific opinion of this subject, from -1.0 to 1.0. This score MUST be derived ONLY from the video's content and rhetorical framing (sarcasm, scapegoating, etc.). It MUST NOT be influenced by the 'alignment_tendency' from the knowledge base."
                    }
                },
                "required": ["subject", "stance"]
            }
        },
        "overall_alignment": {
            "type": "NUMBER",
            "description": "The video's final geopolitical alignment score (-1.0 Pro-Russian to 1.0 Pro-Western). This is a HOLISTIC DEDUCTION based on the alignment of the video's 'heroes' (praised subjects) and 'villains' (criticized subjects). A video praising anti-Western figures/concepts will have a negative score."
        }
    },
    "required": ["summary", "identified_subjects", "overall_alignment"]
}
