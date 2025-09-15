import {z} from "zod"

export namespace DatabaseAPI {
    export const BaseQuery = z.object({
        video_id:   z.string().regex(/^\d+$/, "videoId must be a numeric string").optional(),
        limit:      z.coerce.number().int().positive().max(100).default(20),
        offset:     z.coerce.number().int().min(0).default(0),
        since:      z.iso.datetime().optional(),
        until:      z.iso.datetime().optional(),
    })




    export namespace Comments {
        export const Query = BaseQuery.extend({
            author:             z.string().optional(),
            video_id:           z.string().optional(),
            comment_id:         z.string().optional(),
            parent_comment_id:  z.string().optional(),
    
            text_contains:      z.string().optional(),
    
            min_likes_count:    z.coerce.number().min(0).optional(),
            max_likes_count:    z.coerce.number().optional(),
    
            sort_by:            z.enum(["likes_count", "created_at", "updated_at"]).default("created_at"),
            sort_dir:           z.enum(["asc", "desc"]).default("desc")
        })
        export type Query = z.infer<typeof Query>
    
        export const Response = z.object({
            items: z.array(z.any()),
            page: z.object({
                limit:  z.number(),
                offset: z.number(),
                total:  z.number(),
            })
        })
        export type Response = z.infer<typeof Response>
    }




    export namespace Videos {
        export const Query = BaseQuery.extend({
            hashtag:    z.string().trim().min(1).optional(),
            sort_by:    z.enum(["created_at", "updated_at", "uploaded_at", "play_count", "comment_count", "share_count", "likes_count"]).default("created_at"),
            sort_dir:   z.enum(["asc", "desc"]).default("desc")
        })
        export type Query = z.infer<typeof Query>
    
        export const Response = z.object({
            items: z.array(z.string()),
            page: z.object({
                limit:  z.number(),
                offset: z.number(),
                total:  z.number(),
            }),
        })
        export type Response = z.infer<typeof Response>
    }




    export namespace VideoFeatures {
        export namespace LLMIdentifiedSubject {
            export const Query = z.object({
                subject:                z.string().trim().min(1),
                min_stance:             z.coerce.number().min(-1).max(1).optional(),
                max_stance:             z.coerce.number().min(-1).max(1).optional(),
                min_alignment_score:    z.coerce.number().min(-1).max(1).optional(),
                max_alignment_score:    z.coerce.number().min(-1).max(1).optional(),
                min_expected_alignment: z.coerce.number().min(-1).max(1).optional(),
                max_expected_alignment: z.coerce.number().min(-1).max(1).optional(),  
                min_alignment_gap:      z.coerce.number().min(-1).max(1).optional(),
                max_alignment_gap:      z.coerce.number().min(-1).max(1).optional(),  
            })
            export type Query = z.infer<typeof Query>

            export const Response = z.object({
                subject:            z.string(),
                stance:             z.number(),
                isInKnowledge:      z.boolean(),
                alignment_score:    z.number().optional(),
                expected_alignment: z.number().optional(),
                alignment_gap:      z.number().optional(),
            })
        }

        const detectedLanguage = z.string().regex(/^[a-z]{2}$/, "Invalid language code")
    
        export const Query = BaseQuery.extend({
            video_id:          z.string().optional(),
            detected_language: detectedLanguage.optional(),
            enrichment_status: z.enum(["completed", "failed", "deleted"]).optional(),
            // -1 means very pro russia while 1 means pro western
            min_alignment:     z.coerce.number().min(-1).max(1).optional(),
            max_alignment:     z.coerce.number().min(-1).max(1).optional(),
            // polairty = positive - negative sentiments
            min_polarity:      z.coerce.number().min(-1).max(1).optional(),
            max_polarity:      z.coerce.number().min(-1).max(1).optional(),
        
            timestamp:         z.enum(["last_enriched_at", "polarity", "llm_overall_alignment"]).default("last_enriched_at").optional(),
            sort:              z.enum(["asc", "desc"]).default("desc").optional(),
        
            identified_subjects: z.array(LLMIdentifiedSubject.Query).optional()
        })
        export type Query = z.infer<typeof Query>

        export const Item = z.object({
            video_id:                 z.string(),
            transcript:               z.string(),
            detected_language:        detectedLanguage,
            last_enriched_at:         z.iso.datetime(),
            llm_summary:              z.string(),
            llm_identified_subjects:  z.array(LLMIdentifiedSubject.Response).nullable(),
            llm_model_name:           z.string(),
            llm_overall_alignment:    z.number(),
            deterministic_alignment:  z.number(),
            final_alignment:          z.number(),
            alignment_conflict:       z.number(),
            text_sentiment_positive:  z.number(),
            text_sentiment_negative:  z.number(),
            text_sentiment_neutral:   z.number(),
            polarity:                 z.number(),
            enrichment_status:        z.enum(["completed", "failed", "deleted"]),
        })
        export type Item = z.infer<typeof Item>
    
        export const Response = z.object({
            items: z.array(Item),
            page: z.object({
                limit:  z.number(),
                offset: z.number(),
                total:  z.number(),
            }),
        })
        export type Response = z.infer<typeof Response>
    }




    export namespace TableMeta {
        export const Column = z.object({
            column_name: z.string(),
            data_type: z.string(),
        });
        export type Column = z.infer<typeof Column>
        
        export const Constraint = z.object({
            constraint_name:     z.string(),
            constraint_type:     z.enum(["PRIMARY KEY", "FOREIGN KEY", "UNIQUE", "CHECK"]),
            column_name:         z.string(),
            foreign_table_name:  z.string().nullable(),
            foreign_column_name: z.string().nullable(),
        });
        export type Constraint = z.infer<typeof Constraint>


        export const Index = z.object({
            index_name: z.string(),
            index_definition: z.string(),
        });
        export type Index = z.infer<typeof Index>
        
        export const Trigger = z.object({
            trigger_name:       z.string(),
            event_manipulation: z.string(),
            action_timing:      z.string(),
        });
        export type Trigger = z.infer<typeof Trigger>
        

        export const Query = z.object({
            tableName: z.enum(['videos', 'video_features', 'comments'])
        })
        export type Query = z.infer<typeof Query>
    
        export const Response = z.object({
            columns:        z.array(Column),
            constraints:    z.array(Constraint),
            indexes:        z.array(Index),
            triggers:       z.array(Trigger),
        });
        export type Response = z.infer<typeof Response>
    }



    
    export namespace KnowledgeSubjects {
        export const SubjectCategory = z.enum([
            "Political Leader",
            "Country",
            "Program",
            "Concept",
            "Institution",
            "EP Group",
            "Party",
            "Extremist Movement"
        ]).optional()

        export const Subject = z.object({
            id:                  z.number(),
            subject_name:        z.string(),
            category:            SubjectCategory,
            country_code:        z.string().regex(/^[a-z]{2}$|^eu$/i, "Must be 2-letter country code or 'eu'").nullable(),
            alignment_tendency:  z.number().min(-1).max(1),
            weight:              z.number(),
            aliases:             z.array(z.string()),
            created_at:          z.string(),
            updated_at:          z.string()
        });
        export type Subject = z.infer<typeof Subject>;

        export const Query = z.object({
            limit:                   z.coerce.number().int().positive().max(100).default(20),
            offset:                  z.coerce.number().int().min(0).default(0),
            subject_name:            z.string().optional(),
            min_alignment_tendency:  z.coerce.number().min(-1).max(1).optional(),
            max_alignment_tendency:  z.coerce.number().min(-1).max(1).optional(),
            min_weight:              z.coerce.number().min(0).max(2).optional(),
            max_weight:              z.coerce.number().min(0).max(2).optional(),
            category:                SubjectCategory.optional(),
            country_code:            z.string().regex(/^[a-z]{2}$|^eu$/i, "Must be 2-letter country code or 'eu'").nullable().optional()
        });
        export type Query = z.infer<typeof Query>;

        export const Response = z.object({
            items:  z.array(Subject),
            page:   z.object({
                limit:  z.number(),
                offset: z.number(),
                total:  z.number(),
            }),
        })
        export type Response = z.infer<typeof Response>
    }
}