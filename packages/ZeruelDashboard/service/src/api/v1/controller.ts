import { Request, Response } from "express"
import { z } from "zod"
import { pool } from "../../lib/db"

const baseParams = z.object({
    since: z.iso.datetime().optional(),
    until: z.iso.datetime().optional(),
    bucket: z.enum(["hour", "day", "week"]).default("day")
})

export async function getSentimentTrend(req: Request, res: Response) {
    const parsed = baseParams.extend({
        scope: z.enum(["transcripts", "comments"]).default("transcripts"),
        language: z.string().optional(),
        hashtag: z.string().optional(),
        subject: z.string().optional()
    }).safeParse(req.query)

    if(!parsed.success)
        return res.status(400).json({ error: z.treeifyError(parsed.error) })

    const { since, until, bucket, scope, language, hashtag, subject } = parsed.data

     
}