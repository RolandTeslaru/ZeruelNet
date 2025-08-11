import { z } from "zod"
import { baseParams } from "./base";

export const VideosQuerySchema = baseParams.extend({
    hashtag: z.string().trim().min(1).optional(),
    timestamp: z.enum(["created_at", "updated_at"]).default("created_at"),
    sort: z.enum(["asc", "desc"]).default("desc")
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

