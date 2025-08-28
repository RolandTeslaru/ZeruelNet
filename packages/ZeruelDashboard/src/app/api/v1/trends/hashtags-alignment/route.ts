import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { z } from 'zod';

export namespace HashtagsAlignmentAPI {
    export const Query = z.object({
        since: z.iso.datetime().optional(),
        until: z.iso.datetime().optional(),
    
        min_alignment: z.coerce.number().min(-1).max(1).optional(),
        max_alignment: z.coerce.number().min(-1).max(1).optional(),
        // polairty = positive - negative sentiments
        min_polarity: z.coerce.number().min(-1).max(1).optional(),
        max_polarity: z.coerce.number().min(-1).max(1).optional(),
    })
    export type Query = z.infer<typeof Query>

    export const Response = z.object({
        subjects: z.array(z.object({
            subject_name: z.string(),
            popularity: z.int(),
            avg_stance: z.float32(),
            total_mentions: z.int()
        })),
        meta: z.object({
            total_subjects: z.int(),
            filters: Query
        })
    })
    export type Response = z.infer<typeof Response>
}




export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = Object.fromEntries(searchParams.entries());

    const parsed = HashtagsAlignmentAPI.Query.safeParse(query);
    if(!parsed.success) {
        return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const { 
        since, until, min_alignment, max_alignment, min_polarity, max_polarity, 
    } = parsed.data;

 
    const query_params = [
        since ?? null,              // $1
        until ?? null,              // $2
        min_alignment ?? null,      // $3
        max_alignment ?? null,      // $4
        min_polarity ?? null,       // $5
        max_polarity ?? null,       // $6
    ];

    const sqlQuery = `--sql
        SELECT
            (subj_data->>'subject')::text as subject_name,
            COUNT(DISTINCT vf.video_id) as popularity,
            AVG((subj_data->>'stance')::numeric) as avg_stance,
            COUNT(*) as total_mentions,
            COUNT(*) OVER() as total_count
        FROM video_features vf
        CROSS JOIN LATERAL jsonb_array_elements(vf.identified_subjects) as subj_data
        WHERE 1=1
            AND ($1::timestamp IS NULL OR vf.created_at >= $1::timestamp)
            AND ($2::timestamp IS NULL OR vf.created_at <= $2::timestamp)
            AND ($3::numeric IS NULL OR (subj_data->>'stance')::numeric >= $3::numeric)
            AND ($4::numeric IS NULL OR (subj_data->>'stance')::numeric <= $4::numeric)
            AND ($5::numeric IS NULL OR vf.polarity >= $5::numeric)
            AND ($6::numeric IS NULL OR vf.polarity <= $6::numeric)
            AND vf.identified_subjects IS NOT NULL
            AND jsonb_array_length(vf.identified_subjects) > 0
        GROUP BY (subj_data->>'subject')::text
        ORDER BY popularity DESC, avg_stance DESC
        LIMIT 50;
    `;

    try {
        const { rows } = await pool.query(sqlQuery, query_params);
        const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0;
        
        const subjects = rows.map(row => ({
            subject_name: row.subject_name,
            popularity: Number(row.popularity),
            avg_stance: Number(row.avg_stance),
            total_mentions: Number(row.total_mentions)
        }));

        const response: HashtagsAlignmentAPI.Response = {
            subjects,
            meta: {
                total_subjects: total,
                filters: {
                    since,
                    until,
                    min_alignment,
                    max_alignment,
                    min_polarity,
                    max_polarity
                }
            }
        }

        return NextResponse.json(response);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "hashtags-alignment query failed. See server log for error"}, { status: 500 });
    }
}
