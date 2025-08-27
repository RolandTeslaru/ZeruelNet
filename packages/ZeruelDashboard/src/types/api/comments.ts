import { z } from "zod"
import { baseParams } from "./base"

export namespace CommentsAPI {
    export const QuerySchema = baseParams.extend({
        author: z.string().optional(),
        video_id: z.string().optional(),
        comment_id: z.string().optional(),
        parent_comment_id: z.string().optional(),

        text_contains: z.string().optional(),

        min_likes_count: z.coerce.number().min(0).optional(),
        max_likes_count: z.coerce.number().optional(),

        sort_by: z.enum(["likes_count", "created_at", "updated_at"]).default("created_at"),
        sort_dir: z.enum(["asc", "desc"]).default("desc")
    })
    export type Query = z.infer<typeof QuerySchema>

    export const ResponseSchema = z.object({
        items: z.array(z.any()),
        page: z.object({
            limit: z.number(),
            offset: z.number(),
            total: z.number(),
        })
    })
    export type Response = z.infer<typeof ResponseSchema>
}