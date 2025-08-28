export * from "./abstractScraper"

import { Platforms } from "@zeruel/types"
import {z} from "zod"

export namespace ScraperAPI {

    export const Sources = z.enum(["hashtag", "user", "url"]).default("hashtag")
    export type Source = z.infer<typeof Sources>

    export const Policy = z.enum(["metadata+comments", "metadata"]).default("metadata+comments")
    export type Policy = z.infer<typeof Policy>




    export namespace Mission {
        export const SideMission = z.object({
            platform: Platforms,
            url: z.string(),
            policy: Policy
        })
        export type SideMission = z.infer<typeof SideMission>


        export const Schema = z.object({
            sideMissions: z.array(SideMission),
            limit: z.coerce.number().int().min(1).default(10),
            batchSize: z.int().max(10).min(1).default(4),
            identifier: z.string(),
            source: Sources,
            scrapeCommentsLen: z.int().min(0).max(200).default(100),
        })
        export type Type = z.infer<typeof Schema>

        export namespace Variants {
            const Scrape = z.object({
                sideMissions: z.array(SideMission),
                limit: z.coerce.number().int().min(1).default(10),
                batchSize: z.int().max(10).min(1).default(4),
                identifier: z.string(),
                source: Sources,
                scrapeCommentsLen: z.int().min(0).max(200).default(100),
            })
            export type Scrape =  z.infer<typeof Scrape>

            const Discover = z.object({
                source: Sources,
                identifier: z.string(),
                limit: z.number().optional()
            })
            export type Discover = z.infer<typeof Discover>
        }
    }





    export namespace Workflow {
        export namespace Variants { 
            export const ByVideoId = z.object({
                videoId: z.string().regex(/^\d+$/, "videoId must be a numeric string"),
                scrapeCommentsLen: z.number().min(0).max(200).default(100),
                policy: ScraperAPI.Policy
            })
            export type ByVideoId = z.infer<typeof ByVideoId>
    
            export const ByHashtag = Mission.Schema.omit({sideMissions: true})
            export type ByHashtag = z.infer<typeof ByHashtag>
        }

        export const Schema = z.discriminatedUnion("type", [
            z.object({
                type: z.literal("hashtag"),
                workflow: Variants.ByHashtag
            }),
            z.object({
                type: z.literal("videoId"),
                workflow: Variants.ByVideoId
            })
        ])
        export type Type = z.infer<typeof Schema>
    }





    export namespace Data {
        export namespace Video {
            export const Stats = z.object({
                likes_count: z.number(),
                share_count: z.number(),
                comment_count: z.number(),
                play_count: z.number(),
            })
            export type Stats = z.infer<typeof Stats>
            
            export const Metadata = z.object({
                video_id: z.string(),
                thumbnail_url: z.string(),
                searched_hashtag: z.string(),
                video_url: z.string(),
                author_username: z.string(),
                video_description: z.string(),
                extracted_hashtags: z.array(z.string()),
                upload_date: z.iso.datetime(),
                platform: z.enum(["tiktok", "facebook", "x"]),
                stats: Stats,
            })
            export type Metadata = z.infer<typeof Metadata>


            export const Comment = z.object({
                comment_id: z.string(),
                parent_comment_id: z.string().nullable(),
                author: z.string(),
                text: z.string(),
                likes_count: z.number(),
                is_creator: z.boolean()
            })
            export type Comment = z.infer<typeof Comment> 

            
            export const Schema = Metadata.extend({
                comments: z.array(Comment)
            })
            export type Type = z.infer<typeof Schema>
        }   
    }

    export const Report = z.object({
        newVideosScraped: z.int(),
        videosUpdated: z.int(),
        updatedVideoIds: z.array(z.string()),
        totalCommentsScraped: z.int(),
        failedSideMissions: z.int()
    })
    export type Report = z.infer<typeof Report>



    export namespace Paylaod {
        export const Action = z.enum([
            "SET_CURRENT_BATCH",
            "ADD_SIDE_MISSION",
            "FINALISE_SIDE_MISSION",
            "ADD_VIDEO_METADATA"
        ]) 
        
        export type Action = z.infer<typeof Action>
        export const Schema = z.discriminatedUnion("action", [
            z.object({
                action: z.literal("SET_CURRENT_BATCH"),
                batch: z.array(ScraperAPI.Mission.SideMission),
                currentBatch: z.number(),
                totalBatches: z.number(),
            }),
            z.object({
                action: z.literal("ADD_SIDE_MISSION"),
                sideMission: ScraperAPI.Mission.SideMission,
            }),
            z.object({
                action: z.literal("ADD_VIDEO_METADATA"),
                metadata: ScraperAPI.Data.Video.Metadata.omit({ searched_hashtag: true }),
            }),
            z.object({
                action: z.literal("FINALISE_SIDE_MISSION"),
                type: z.enum(["succes", "error"]), 
                sideMission: ScraperAPI.Mission.SideMission,
                error: z.any().optional(),
            }),
        ])
        export type Type = z.infer<typeof Schema>

        // export namespace Variant {
        //     z.object({
        //         action: z.literal("SET_CURRENT_BATCH"),
        //         batch: z.array(ScraperAPI.Mission.SideMission),
        //         currentBatch: z.number(),
        //         totalBatches: z.number(),
        //     })
        //     z.object({
        //         action: z.literal("ADD_SIDE_MISSION"),
        //         sideMission: ScraperAPI.Mission.SideMission,
        //     })
        //     z.object({
        //         action: z.literal("ADD_VIDEO_METADATA"),
        //         metadata: ScraperAPI.Data.Video.Metadata.omit({ searched_hashtag: true }),
        //     }),
        //     z.object({
        //         action: z.literal("FINALISE_SIDE_MISSION"),
        //         type: z.enum(["succes", "error"]), 
        //         sideMission: ScraperAPI.Mission.SideMission,
        //         error: z.any().optional(),
        //     }),

        // }
    }
}        





