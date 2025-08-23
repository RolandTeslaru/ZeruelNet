import { z } from "zod"

export const baseParams = z.object({
  video_id: z.string().regex(/^\d+$/, "videoId must be a numeric string").optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  since: z.iso.datetime().optional(),
  until: z.iso.datetime().optional(),
})