import { z } from "zod"

export const llmIdentifiedSubjectSchema = z.object({
    subject: z.string(),
    stance: z.number(),
    alignment_score: z.number(),
    expected_alignment: z.number(),
    alignment_gap: z.number()
})

export const EnrichedVideoSchema = z.object({
    video_id: z.string(),
    transcript: z.string(),
    detected_language: z.string(),
    last_enriched_at: z.iso.datetime(),
    
    llm_summary: z.string(),
    llm_identified_subjects: z.array(llmIdentifiedSubjectSchema),
    llm_model_name: z.string(),
    llm_overall_alignment: z.number().min(-1).max(1),
    deterministic_alignment: z.number().min(-1).max(1),
    final_alignment: z.number().min(-1).max(1),
    alignment_conflict: z.number().min(-1).max(2),


    text_sentiment_positive: z.number().min(-1).max(1),
    text_sentiment_negative: z.number().min(-1).max(1),
    text_sentiment_neutral: z.number().min(-1).max(1),
    polarity: z.number().min(-1).max(1),

    enrichment_status: z.string(),
    total_count: z.string()
}) 

export type EnrichedVideo = z.infer<typeof EnrichedVideoSchema>