import { z } from "zod"
import { baseParams } from "./base";

export const VideosQuerySchema = baseParams.extend({
    hashtag: z.string().trim().min(1).optional(),
    sort_by: z.enum(["created_at", "updated_at", "play_count", "comment_count", "share_count", "likes_count"]).default("created_at").optional(),
    sort_dir: z.enum(["asc", "desc"]).default("desc").optional()
})

export type VideosQueryParams = z.infer<typeof VideosQuerySchema>

export const VideosResponseSchema = z.object({
    items: z.array(z.any()),
    page: z.object({
        limit: z.number(),
        offset: z.number(),
        total: z.number(),
    }),
})

export type VideosResponse = z.infer<typeof VideosResponseSchema>;

