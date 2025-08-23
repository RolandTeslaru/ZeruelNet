import { z } from "zod"
import { baseParams } from "./base"

export const CommentsQuerySchema = baseParams.extend({
    author: z.string().optional(),
    video_id: z.string().optional(),
    comment_id: z.string().optional(),
    parent_comment_id: z.string().optional(),
    
    text_contains: z.string().optional(),

    min_likes_count: z.coerce.number().min(0).optional(),
    max_likes_count: z.coerce.number().optional(),

    sort_by: z.enum(["likes_count", "created_at", "updated_at"]).default("created_at").optional(),
    sort_dir: z.enum(["asc", "desc"]).default("desc").optional()
})

export type CommentQueryParams = z.infer<typeof CommentsQuerySchema>

export const CommentsResponseSchema = z.object({
    items: z.array(z.any()),
    page: z.object({
        limit: z.number(),
        offset: z.number(),
        total: z.number(),
    })
})

export type CommentsResponse = z.infer<typeof CommentsResponseSchema>