import { z } from "zod"

export const VideosQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).default(20),
    offset: z.coerce.number().int().positive().min(0).default(0),
    hashtag: z.string().trim().min(1).optional(),
    since: z.iso.datetime().optional(),
    until: z.iso.datetime().optional(),
    timestamp: z.enum(["created_at", "updated_at"]).default("created_at"),
    sort: z.enum(["asc", "desc"]).default("desc")
})

export type VideoQueryParams = z.infer<typeof VideosQuerySchema>

export const VideosResponseSchema = z.object({
    items: z.array(z.any()),
    page: z.object({
      limit: z.number(),
      offset: z.number(),
      total: z.number(),
    }), 
})

export type VideosResponse = z.infer<typeof VideosResponseSchema>;