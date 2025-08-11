import { Request, Response } from "express"
import { z } from "zod"
import { pool } from "../../../lib/db"
import { VideosQuerySchema } from "@zeruel/dashboard-types"

// The scraped videos in the videos table
export async function getVideos(req: Request, res: Response) {
    const parsed = VideosQuerySchema.safeParse(req.query);
    if (!parsed.success){
        console.error(z.treeifyError(parsed.error))
        return res.status(400).json({ error: z.treeifyError(parsed.error) })
    }

    const { limit, offset, since, until, hashtag, timestamp, sort } = parsed.data
    
    const timestampColumnId = `v.${timestamp}`
    const direction = sort === "asc" ? "ASC" : "DESC"

    const query_params = [
        since ?? null,    // 1
        until ?? null,    // 2
        hashtag ?? null,  // 3
        limit,            // 4 
        offset            // 5
    ]

    const query = `--sql
        SELECT v.*, COUNT(*) OVER() as total_count
        FROM public.videos v
        WHERE ($1::timestamptz IS NULL OR ${timestampColumnId} >= $1)
          AND ($2::timestamptz IS NULL OR ${timestampColumnId} < $2)
          AND (
            $3::text IS NULL
            OR v.searched_hashtag = $3 -- the searched_hashtag is the single hashtahg used by the scraper when search for the videos
            OR $3 = ANY(v.extracted_hashtags)
          )
        ORDER BY ${timestampColumnId} ${direction}
        LIMIT $4 OFFSET $5
    `;

    try {
        const { rows } = await pool.query(query, query_params);
        const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0;
        res.json({ items: rows, page: {limit, offset, total }})
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "videos query_faled. See Server log", })
    }
}