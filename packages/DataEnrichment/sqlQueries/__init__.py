# Query that runs if the DataEnrichment process is successfull 
UPDATE_SUCCESSFUL_ENRICHMENT_QUERY = """--sql
    INSERT INTO video_features (
        video_id, transcript, detected_language, enrichment_status, last_enriched_at,
        llm_summary, llm_identified_subjects, llm_overall_alignment, llm_model_name,
        final_alignment, deterministic_alignment, alignment_conflict,
        text_sentiment_positive, text_sentiment_negative, text_sentiment_neutral, polarity
    ) VALUES (
        %s, %s, %s, %s, CURRENT_TIMESTAMP,
        %s, %s, %s, %s,
        %s, %s, %s,
        %s, %s, %s, %s
    )
    ON CONFLICT (video_id) DO UPDATE SET
        transcript = EXCLUDED.transcript,
        detected_language = EXCLUDED.detected_language,
        enrichment_status = 'completed',
        last_enriched_at = CURRENT_TIMESTAMP,
        llm_summary = EXCLUDED.llm_summary,
        llm_identified_subjects = EXCLUDED.llm_identified_subjects,
        llm_overall_alignment = EXCLUDED.llm_overall_alignment,
        llm_model_name = EXCLUDED.llm_model_name,
        final_alignment = EXCLUDED.final_alignment,
        deterministic_alignment = EXCLUDED.deterministic_alignment,
        alignment_conflict = EXCLUDED.alignment_conflict,
        text_sentiment_positive = EXCLUDED.text_sentiment_positive,
        text_sentiment_negative = EXCLUDED.text_sentiment_negative,
        text_sentiment_neutral = EXCLUDED.text_sentiment_neutral,
        polarity = EXCLUDED.polarity;
"""


# Querry that runs if its unsucessfull
# it sets the enrichment_status column to failed
UPDATE_ENRICHMENT_STATUS_ON_FAILURE_QUERY = """--sql
    INSERT INTO video_features (video_id, enrichment_status)
    VALUES (%s, %s)
    ON CONFLICT (video_id) DO UPDATE SET
        enrichment_status = EXCLUDED.enrichment_status,
        last_enriched_at = CURRENT_TIMESTAMP;
"""