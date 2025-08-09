import { Request, Response } from "express"
import { z } from "zod"
import { pool } from "../../lib/db"

const baseParams = z.object({
    since: z.iso.datetime().optional(),
    until: z.iso.datetime().optional(),
    bucket: z.enum(["hour", "day", "week"]).default("day")
})

const videosSchema = z.object({
    limit: z.coerce.number().int().positive().max(100).default(20),
    offset: z.coerce.number().int().positive().min(0).default(0),
    hashtag: z.string().trim().min(1).optional(),
    since: z.iso.datetime().optional(),
    until: z.iso.datetime().optional(),
    timestamp: z.enum(["created_at", "updated_at"]).default("created_at"),
    sort: z.enum(["asc", "desc"]).default("desc")
})

// The scraped videos in the videos table
export async function getVideos(req: Request, res: Response) {
    const parsed = videosSchema.safeParse(req.query);
    if (!parsed.success)
        return res.status(400).json({ error: z.treeifyError(parsed.error) })

    const { limit, offset, hashtag, since, until, timestamp, sort } = parsed.data
    
    const timestampColumnId = `v.${timestamp}`
    const direction = sort === "asc" ? "ASC" : "DESC"

    const sql_params = [
        since ?? null,    // 1
        until ?? null,    // 2
        hashtag ?? null,  // 3
        limit,            // 4 
        offset            // 5
    ]

    const sql = `--sql
        SELECT v.*, COUNT(*) OVER() as total_count
        FROM public.videos v
        WHERE ($1::timestamptz IS NULL OR ${timestampColumnId} >= $1)
          AND ($2::timestamptz IS NULL OR ${timestampColumnId} < $2)
          AND (
            $3::text IS NULL
            OR v.searched_hashtag = $3 -- the searched_hashtag is the single hashtahg used by the scraper when search for the videos
            OR EXISTS (
                SELECT 1
                FROM jsonb_array_elements_text(v.extracted_hashtags) h
                WHERE h = $3
            )
          )
        ORDER BY ${timestampColumnId} ${direction}
        LIMIT $4 OFFSET $5
    `;

    try {
        const { rows } = await pool.query(sql, sql_params);
        const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0;
        res.json({ items: rows, page: {limit, offset, total }})
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "querry_faled" })
    }
}

export async function getVideoFeatures(req: Request, res: Response) {

}

export async function getComments(req: Request, res: Response) {

}

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