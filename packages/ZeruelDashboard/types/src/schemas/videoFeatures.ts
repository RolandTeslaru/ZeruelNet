import { z } from "zod"
import { baseParams } from "./base";

export const IdentifiedSubjectScehma = z.object({
    subject: z.string().trim().min(1),
    min_stance: z.coerce.number().min(-1).max(1).optional(),
    max_stance: z.coerce.number().min(-1).max(1).optional(),
})

export const VideoFeaturesQuerySchema = baseParams.extend({
    video_id: z.string().optional(),
    detected_language: z.string().regex(/^[a-z]{2}$/, "Invalid language code").optional(),
    enrichment_status: z.enum(["completed", "failed"]).optional(),
    // -1 means very pro russia while 1 means pro western
    min_alignment: z.coerce.number().min(-1).max(1).optional(),
    max_alignment: z.coerce.number().min(-1).max(1).optional(),
    // polairty = positive - negative sentiments
    min_polarity: z.coerce.number().min(-1).max(1).optional(),
    max_polarity: z.coerce.number().min(-1).max(1).optional(),

    timestamp: z.enum(["last_enriched_at", "polarity", "llm_overall_alignment"]).default("last_enriched_at").optional(),
    sort: z.enum(["asc", "desc"]).default("desc").optional(),

    identified_subjects: z.array(IdentifiedSubjectScehma).min(1).optional()
})

export type VideoFeaturesQueryParams = z.infer<typeof VideoFeaturesQuerySchema>

export const VideoFeaturesResponseSchema = z.object({
    items: z.array(z.any()),
    page: z.object({
        limit: z.number(),
        offset: z.number(),
        total: z.number(),
    }),
})

export type VideoFeaturesResponse = z.infer<typeof VideoFeaturesResponseSchema>
