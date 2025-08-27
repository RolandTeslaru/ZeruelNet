import {z} from "zod"
import { baseParams } from "./base"

export namespace VideosAPI {
    export const QuerySchema = baseParams.extend({
        hashtag: z.string().trim().min(1).optional(),
        sort_by: z.enum(["created_at", "updated_at", "uploaded_at", "play_count", "comment_count", "share_count", "likes_count"]).default("created_at"),
        sort_dir: z.enum(["asc", "desc"]).default("desc")
    })
    export type Query = z.infer<typeof QuerySchema>

    
    export const ResponseSchema = z.object({
        items: z.array(z.any()),
        page: z.object({
            limit: z.number(),
            offset: z.number(),
            total: z.number(),
        }),
    })
    export type Response = z.infer<typeof ResponseSchema>
}

// export namespace VideosAPI {
//     export const QuerySchema = 
//     export type Query = z.infer<typeof QuerySchema>

//     export const ResponseSchema = 
//     export type Response = z.infer<typeof ResponseSchema>
// }