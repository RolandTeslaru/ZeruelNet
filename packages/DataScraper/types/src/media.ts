import { PlatformsSchema } from "@zeruel/types"
import {z} from "zod"

export const TiktokScrapedVideoStatsSchema = z.object({
    likes_count: z.number(),
    share_count: z.number(),
    comment_count: z.number(),
    play_count: z.number(),
})
export type TiktokScrapedVideoStats = z.infer<typeof TiktokScrapedVideoStatsSchema>



export const TiktokScrapedCommentSchema = z.object({
    comment_id: z.string(),
    parent_comment_id: z.string().nullable(),
    author: z.string(),
    text: z.string(),
    likes_count: z.number(),
    is_creator: z.boolean()
})
export type TiktokScrapedComment = z.infer<typeof TiktokScrapedCommentSchema> 



export const TiktokScrapedVideoMetadataSchema = z.object({
    video_id: z.string(),
    thumbnail_url: z.string(),
    searched_hashtag: z.string(),
    video_url: z.string(),
    author_username: z.string(),
    video_description: z.string(),
    extracted_hashtags: z.array(z.string()),
    platform: z.enum(["tiktok", "facebook", "x"]),
    stats: TiktokScrapedVideoStatsSchema,
})
export type TiktokScrapedVideoMetadata = z.infer<typeof TiktokScrapedVideoMetadataSchema>



export const TiktokScrapedVideoSchema = TiktokScrapedVideoMetadataSchema.extend({
    comments: z.array(TiktokScrapedCommentSchema)
})
export type TiktokScrapedVideo = z.infer<typeof TiktokScrapedVideoSchema>