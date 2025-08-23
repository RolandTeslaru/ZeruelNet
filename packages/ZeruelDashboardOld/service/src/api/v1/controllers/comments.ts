import { Request, Response } from "express"
import { z } from "zod"
import { pool } from "../../../lib/db"
import { CommentsQuerySchema } from "@zeruel/dashboard-types"

export async function getComments(req: Request, res: Response) {
    const parsed = CommentsQuerySchema.safeParse(req.query);
    if (!parsed.success)
        return res.status(400).json({ error: z.treeifyError(parsed.error) })

    const { since, until, limit, offset, author, video_id, 
        comment_id, parent_comment_id, text_contains,
        min_likes_count, max_likes_count, sort_by, sort_dir
    } = parsed.data

    const orderByWhitelist = {
        "created_at": "c.created_at",
        "updated_at": "c.updated_at",
        "likes_count": "c.likes_count"
    }
    const orderBy = orderByWhitelist[sort_by]
    const direction = sort_dir.toUpperCase();

    const query_params = [
        since ?? null,              // 1
        until ?? null,              // 2
        author ?? null,             // 3
        video_id ?? null,           // 4
        comment_id ?? null,         // 5
        parent_comment_id ?? null,  // 6
        text_contains ?? null,      // 7
        min_likes_count ?? null,    // 8
        max_likes_count ?? null,    // 9
        limit,                      // 10
        offset                      // 11
    ]

    const query = `--sql
        SELECT c.*, COUNT(*) OVER() as total_count
        FROM public.comments c
        WHERE ($1::timestamptz IS NULL OR c.created_at >= $1)--cant stort by "orderBy" because it has the likes_count
          AND ($2::timestamptz IS NULL OR c.created_at < $2)
          AND ($3::text IS NULL OR c.author = $3)
          AND ($4::text IS NULL OR c.video_id = $4)
          AND ($5::text IS NULL OR c.comment_id = $5)
          AND ($6::text IS NULL OR c.parent_comment_id = $6)
          AND ($7::text IS NULL OR c.text ILIKE '%' || $7 || '%')
          AND ($8::integer IS NULL OR c.likes_count >= $8)
          AND ($9::integer IS NULL OR c.likes_count <= $9)
        ORDER BY ${orderBy} ${direction}
        LIMIT $10 OFFSET $11    
    `

    try {
        const { rows } = await pool.query(query, query_params)
        const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0;
        res.json({ items: rows, page: {limit, offset, total }})
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: "comments query failed. See server log"})
    }
}

