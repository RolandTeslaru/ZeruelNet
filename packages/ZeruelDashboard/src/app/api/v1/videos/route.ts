import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { VideosQuerySchema } from '@/types/queries/videos';
import { z } from "zod"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const query = Object.fromEntries(searchParams.entries())

    const parsed = VideosQuerySchema.safeParse(query)
    if(!parsed.success)
        return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 })

    const { 
        limit, offset, since, until, hashtag, sort_dir, sort_by, video_id 
    } = parsed.data

    const orderByWhitelist = {
        "created_at": "v.created_at",
        "updated_at": "v.updated_at",
        "uploaded_at": "v.uploaded_at",
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
        offset,           // 5
        video_id ?? null  // 6
    ]

    const sqlQuery = `--sql
        SELECT v.*, COUNT(*) OVER() as total_count
        FROM public.videos v
        WHERE ($1::timestamptz IS NULL OR v.created_at >= $1)
          AND ($2::timestamptz IS NULL OR v.created_at < $2)
          AND (
            $3::text IS NULL
            OR v.searched_hashtag = $3
            OR $3 = ANY(v.extracted_hashtags)
          )
        AND ($6::text is NULL OR v.video_id = $6)
        ORDER BY ${orderBy} ${direction}
        LIMIT $4 OFFSET $5
    `;

    try {
        const { rows } = await pool.query(sqlQuery, query_params)
        const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0;
        return NextResponse.json({ items: rows, page: { limit, offset, total } })
    } catch(e) {
        console.error(e)
        return NextResponse.json({ error: "video_features query failed. See server log for error"}, { status: 500 });
    }
}