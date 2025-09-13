import { z } from "zod"
import { DatabaseAPI } from "./database"
import { ScraperAPI } from "@zeruel/scraper-types"

export namespace TrendsAPI {
    export namespace Subjects {
        export const Query = z.object({
            since: z.iso.datetime(),
            until: z.iso.datetime(),
            
            // Filtering options
            min_alignment_score: z.coerce.number().min(-1).max(1).optional(),
            max_alignment_score: z.coerce.number().min(-1).max(1).optional(),
            min_alignment_tendency: z.coerce.number().min(-1).max(1).optional(),
            max_alignment_tendency: z.coerce.number().min(-1).max(1).optional(),
            min_polarity: z.coerce.number().min(-1).max(1).optional(),
            max_polarity: z.coerce.number().min(-1).max(1).optional(),
            
            // Response format
            include_knowledge: z.coerce.boolean().default(false).optional(),  // Whether to include category and weight in response
            
            // If include_knowledge is false then the knowledge based filtering wont work
            
            // Knowledge-based filtering (triggers JOIN)
            category: DatabaseAPI.KnowledgeSubjects.SubjectCategory.optional(),
            min_weight: z.coerce.number().min(0).max(2).optional(),
            max_weight: z.coerce.number().min(0).max(2).optional(),
            country_code: z.string().regex(/^[a-z]{2}$|^eu$/i).nullable().optional(),
            
        })
        export type Query = z.infer<typeof Query>

        export const Response = z.object({
            subjects: z.array(z.object({
                subject_name: z.string(),
                avg_alignment_score: z.number(), 
                avg_stance: z.number(),
                expect_alignment: z.number(), // this is fixed because its defined once in the knowledge
                popularity: z.number(),
                total_mentions: z.number(),
                
                // Optional knowledge data (only if include_knowledge=true or filtering by knowledge)
                category: z.string().optional(),
                weight: z.number().optional(),
                country_code: z.string().nullable().optional()
            })),
            meta: z.object({
                total_subjects: z.number(),
                date_range: z.object({
                    since: z.iso.datetime(),
                    until: z.iso.datetime()
                }),
                used_knowledge_join: z.boolean(),  // Indicates if knowledge data was included
                max_total_mentions: z.number()
            })
        })
        export type Response = z.infer<typeof Response>
    }

    
    export namespace ComposedData {
        export const BucketInterval = z.enum(['hour', 'day', 'week', 'month'])
        export type BucketInterval = z.infer<typeof BucketInterval>

        export const Query = z.object({
            interval:                   BucketInterval,
            since:                      z.iso.datetime(),
            until:                      z.iso.datetime(),
            subjects:                   z.array(DatabaseAPI.VideoFeatures.LLMIdentifiedSubject.Query).optional(),
            min_final_alignment:        z.coerce.number().min(-1).max(1).optional(),
            max_final_alignment:        z.coerce.number().min(-1).max(1).optional(),
            min_deterministic_alignment:z.coerce.number().min(-1).max(1).optional(),
            max_deterministic_alignment:z.coerce.number().min(-1).max(1).optional(),
            min_llm_overall_alignment:  z.coerce.number().min(-1).max(1).optional(),
            max_llm_overall_alignment:  z.coerce.number().min(-1).max(1).optional(),
            min_text_polarity:          z.coerce.number().min(-1).max(1).optional(),
            max_text_polarity:          z.coerce.number().min(-1).max(1).optional(),
        })
        export type Query = z.infer<typeof Query>

        export const ResponseBucket = z.object({
            bucket:                     z.string(), // ISO start time string
            volume:                     z.number(),
            avg_final_alignment:        z.number().nullable(),
            avg_llm_overall_alignment:  z.number().nullable(),
            avg_deterministic_alignment:z.number().nullable(),
            avg_polarity:               z.number().nullable(),
            median_engagement:          z.number().nullable(),
            mean_engagement:            z.number().nullable(),
            likes:                      z.number(),
            comments:                   z.number(),
            shares:                     z.number(),
        })

        export const DisplayItem = z.object({
            video_id:                 z.number(),
            author_username:          z.string(),
            video_url:                z.number(),
            likes_count:              z.number(),
            share_count:              z.number(),
            comment_count:            z.number(),
            play_count:               z.number(),
            video_description:        z.string(),
            final_alignment:          z.number(),
            llm_overall_alignment:    z.number(),
            deterministic_alignment:  z.number()
        })
        export type DisplayItem = z.infer<typeof DisplayItem>

        export const Response = z.object({
            buckets:        z.array(ResponseBucket),
            displayVideos:  z.array(DisplayItem),
            meta: z.object({
                interval:       BucketInterval,
                date_range: z.object({
                    since:      z.iso.datetime(),
                    until:      z.iso.datetime()
                }),
                total_buckets:  z.number(),
                queryParams:    z.any()
            })
        })
        export type Response = z.infer<typeof Response>
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