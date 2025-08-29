import { z } from "zod"
import { DatabaseAPI } from "./database"

export namespace TrendsAPI {
    export namespace Subjects {
        export namespace Alignment {
            export const Query = z.object({
                since: z.iso.datetime(),
                until: z.iso.datetime(),

                min_alignment: z.coerce.number().min(-1).max(1).optional(),
                max_alignment: z.coerce.number().min(-1).max(1).optional(),
                // polairty = positive - negative sentiments
                min_polarity: z.coerce.number().min(-1).max(1).optional(),
                max_polarity: z.coerce.number().min(-1).max(1).optional(),
            })
            export type Query = z.infer<typeof Query>

            export const Response = z.object({
                subjects: z.array(z.object({
                    subject_name: z.string(),
                    avg_stance: z.number(),
                    popularity: z.number(),
                    total_mentions: z.number(),

                    knowledge: z.object({
                        alignment_tendency: z.number().nullable(),
                        category: z.string().nullable(),
                        weight: z.number().nullable(),
                        country_code: z.string().nullable()
                    }).nullable,
                    expected_alignment: z.number().nullable(),
                    alignment_delta: z.number(),      // avg_stance - expected_alignment
                    alignment_accuracy: z.number(),   // How close to expected (0-1)
                })),
                meta: z.object({
                    total_subjects: z.number(),
                    date_range: z.object({
                        since: z.iso.datetime(),
                        until: z.iso.datetime()
                    })
                })
            })
            export type Response = z.infer<typeof Response>
        }

        export namespace AverageStance {
            export const Query = z.object({
                since: z.iso.datetime(),
                until: z.iso.datetime(),

                min_alignment: z.coerce.number().min(-1).max(1).optional(),
                max_alignment: z.coerce.number().min(-1).max(1).optional(),
                // polairty = positive - negative sentiments
                min_polarity: z.coerce.number().min(-1).max(1).optional(),
                max_polarity: z.coerce.number().min(-1).max(1).optional(),
            })
            export type Query = z.infer<typeof Query>

            export const Response = z.object({
                subjects: z.array(z.object({
                    subject_name: z.string(),
                    popularity: z.int(),
                    avg_stance: z.float32(),
                    total_mentions: z.int()
                })),
                meta: z.object({
                    total_subjects: z.int(),
                    filters: Query
                })
            })
            export type Response = z.infer<typeof Response>
        }
    }


    export namespace Metadata {
        export namespace DataBounds {
            export const Response = z.object({
                start_video_date: z.iso.datetime(),
                end_video_date: z.iso.datetime()
            })
            export type Response = z.infer<typeof Response>
        }
    }
}