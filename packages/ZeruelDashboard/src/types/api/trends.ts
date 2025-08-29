import { z } from "zod"
import { DatabaseAPI } from "./database"

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
            category: z.enum(["Political Leader", "Country", "Program", "Concept", "Institution", "EP Group", "Party", "Extremist Movement"]).optional(),
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
                used_knowledge_join: z.boolean()  // Indicates if knowledge data was included
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