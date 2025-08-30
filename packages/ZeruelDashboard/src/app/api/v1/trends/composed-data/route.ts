import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { z } from 'zod';
import { TrendsAPI } from '@/types/api/trends';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = Object.fromEntries(searchParams.entries());

    const parsed = TrendsAPI.ComposedData.Query.safeParse(query);
    if (!parsed.success) {
        return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const {
        interval, since, until,
        min_final_alignment, max_final_alignment,
        min_deterministic_alignment, max_deterministic_alignment,
        min_llm_overall_alignment, max_llm_overall_alignment,
        min_text_polarity, max_text_polarity,
    } = parsed.data;

    const queryParams = [
        interval,                   // $1
        since,                      // $2
        until,                      // $3
        min_final_alignment,        // $4
        max_final_alignment,        // $5
        min_deterministic_alignment,// $6
        max_deterministic_alignment,// $7
        min_llm_overall_alignment,  // $8
        max_llm_overall_alignment,  // $9
        min_text_polarity,          // $10
        max_text_polarity,          // $11
    ]


    const sqlQuery = `--sql
        SELECT
            date_trunc($1, v.created_at) as bucket,
            COUNT(vf.video_id) as volume,
            AVG(vf.final_alignment) as avg_final_alignment,
            AVG(vf.llm_overall_alignment) as avg_llm_overall_alignment,
            AVG(vf.deterministic_alignment) as avg_deterministic_alignment,
            AVG(vf.polarity) as avg_polarity
        FROM video_features vf
        JOIN videos v ON v.video_id = vf.video_id
        WHERE v.created_at BETWEEN $2 AND $3
            AND ($4::numeric IS NULL OR vf.final_alignment >= $4)
            AND ($5::numeric IS NULL OR vf.final_alignment <= $5)
            AND ($6::numeric IS NULL OR vf.deterministic_alignment >= $6)
            AND ($7::numeric IS NULL OR vf.deterministic_alignment <= $7)
            AND ($8::numeric IS NULL OR vf.llm_overall_alignment >= $8)
            AND ($9::numeric IS NULL OR vf.llm_overall_alignment <= $9)
            AND ($10::numeric IS NULL OR vf.polarity >= $10)
            AND ($11::numeric IS NULL OR vf.polarity <= $11)
        GROUP BY bucket
        ORDER BY bucket;
    `

    try {
        const { rows } = await pool.query(sqlQuery, queryParams)

        const response: TrendsAPI.ComposedData.Response = {
            buckets: rows,
            meta: {
                interval,
                date_range: {since, until},
                total_buckets: rows.length
            }
        }

        return NextResponse.json(response)
    } catch (e) {
        console.error('Database query error:', e);
        return NextResponse.json({ error: "data-bounds query failed. See server log for error" }, { status: 500 })
    }
}
