import { Request, Response } from "express"
import { z } from "zod"
import { pool } from "../../../lib/db"
import { VideosQuerySchema } from "@zeruel/dashboard-types"
import { timeStamp } from "console";

// The scraped videos in the videos table
export async function getVideos(req: Request, res: Response) {
    const parsed = VideosQuerySchema.safeParse(req.query);
    if (!parsed.success){
        console.error(z.treeifyError(parsed.error))
        return res.status(400).json({ error: z.treeifyError(parsed.error) })
    }

    const { limit, offset, since, until, hashtag, sort_dir, sort_by } = parsed.data
    
    const orderByWhitelist = {
        "created_at": "v.created_at",
        "updated_at": "v.updated_at",
        "play_count": "v.play_count",
        "comment_count": "v.comment_count",
        "share_count": "v.share_count",
        "likes_count": "v.likes_count",
    }

    const orderBy = orderByWhitelist[sort_by]
    const direction = sort_dir.toUpperCase()

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
        WHERE ($1::timestamptz IS NULL OR v.created_at >= $1)
          AND ($2::timestamptz IS NULL OR v.created_at < $2)
          AND (
            $3::text IS NULL
            OR v.searched_hashtag = $3
            OR $3 = ANY(v.extracted_hashtags)
          )
        ORDER BY ${orderBy} ${direction}
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

export async function getAllVideoIds(req: Request, res: Response) {
    const query = `--sql
        SELECT id FROM public.videos
    `;
    try {
        const { rows } = await pool.query(query);
        const ids = rows.map(row => row.id);
        res.json(ids);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch all video IDs" });
    }
}