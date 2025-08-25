import { PlatformsSchema } from "@zeruel/types"
import {z} from "zod"

export const ScrapedVideoStatsSchema = z.object({
    likes_count: z.number(),
    share_count: z.number(),
    comment_count: z.number(),
    play_count: z.number(),
})
export type ScrapedVideoStats = z.infer<typeof ScrapedVideoStatsSchema>



export const ScrapedCommentSchema = z.object({
    comment_id: z.string(),
    parent_comment_id: z.string().nullable(),
    author: z.string(),
    text: z.string(),
    likes_count: z.number(),
    is_creator: z.boolean()
})
export type ScrapedComment = z.infer<typeof ScrapedCommentSchema> 



export const ScrapedVideoMetadataSchema = z.object({
    video_id: z.string(),
    thumbnail_url: z.string(),
    searched_hashtag: z.string(),
    video_url: z.string(),
    author_username: z.string(),
    video_description: z.string(),
    extracted_hashtags: z.array(z.string()),
    upload_date: z.iso.datetime(),
    platform: z.enum(["tiktok", "facebook", "x"]),
    stats: ScrapedVideoStatsSchema,
})
export type ScrapedVideoMetadata = z.infer<typeof ScrapedVideoMetadataSchema>



export const ScrapedVideoSchema = ScrapedVideoMetadataSchema.extend({
    comments: z.array(ScrapedCommentSchema)
})
export type ScrapedVideo = z.infer<typeof ScrapedVideoSchema>