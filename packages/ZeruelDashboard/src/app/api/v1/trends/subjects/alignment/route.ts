import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { z } from 'zod';
import { TrendsAPI } from '@/types/api';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = Object.fromEntries(searchParams.entries());

    const parsed = TrendsAPI.Subjects.Alignment.Query.safeParse(query);
    if (!parsed.success) {
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
            
        WITH subject_stats AS (
            -- Calculate average stance for each subject in the time period
            SELECT 
                (subj_data->>'subject')::text as subject_name,
                AVG((subj_data->>'stance')::numeric) as avg_stance,
                COUNT(DISTINCT vf.video_id) as popularity,
                COUNT(*) as total_mentions
            FROM video_features vf
            INNER JOIN videos v ON vf.video_id = v.video_id
            CROSS JOIN LATERAL jsonb_array_elements(vf.llm_identified_subjects) as subj_data
            WHERE 1=1
                AND ($1::timestamp IS NULL OR v.created_at >= $1::timestamp)
                AND ($2::timestamp IS NULL OR v.created_at <= $2::timestamp)
                AND ($3::numeric IS NULL OR (subj_data->>'stance')::numeric >= $3::numeric)
                AND ($4::numeric IS NULL OR (subj_data->>'stance')::numeric <= $4::numeric)
                AND ($5::numeric IS NULL OR vf.polarity >= $5::numeric)
                AND ($6::numeric IS NULL OR vf.polarity <= $6::numeric)
                AND vf.llm_identified_subjects IS NOT NULL
                AND jsonb_array_length(vf.llm_identified_subjects) > 0
            GROUP BY (subj_data->>'subject')::text
            HAVING COUNT(*) >= 3  -- Only subjects with enough mentions for statistical significance
        )
        SELECT 
            ss.subject_name,
            ss.avg_stance,
            ss.popularity,
            ss.total_mentions,
            ks.alignment_tendency as expected_alignment,
            ks.category,
            ks.weight,
            ks.country_code,
            -- Calculate alignment delta (how far from expected)
            (ss.avg_stance - COALESCE(ks.alignment_tendency, 0)) as alignment_delta,
            -- Calculate alignment accuracy (how close to expected, 0-1 scale)
            (1.0 - ABS(ss.avg_stance - COALESCE(ks.alignment_tendency, 0)) / 2.0) as alignment_accuracy,
            COUNT(*) OVER() as total_count
        FROM subject_stats ss
        LEFT JOIN knowledge_subjects ks ON LOWER(ss.subject_name) = LOWER(ks.subject_name)
        WHERE 1=1
            -- Optional: Only include subjects we have knowledge about
            -- AND ks.subject_name IS NOT NULL  
        ORDER BY 
            CASE 
                WHEN ks.subject_name IS NOT NULL THEN 0  -- Known subjects first
                ELSE 1                                   -- Unknown subjects last
            END,
            ABS(ss.avg_stance - COALESCE(ks.alignment_tendency, 0)) DESC,  -- Biggest deltas first
            ss.popularity DESC,                                            -- Then by popularity
            ss.subject_name;
    `;

    try {
        const { rows } = await pool.query(sqlQuery, query_params);
        const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0;

        const subjects = rows.map(row => ({
            subject_name: row.subject_name,
            avg_stance: Number(row.avg_stance),
            popularity: Number(row.popularity),
            total_mentions: Number(row.total_mentions),
            
            knowledge: {
                alignment_tendency: Number(row.alignment_tendency),
                category: row.category,
                weight: Number(row.weight),
                country_code: row.country_code
            },
            alignment_delta: Number(row.alignment_delta),
            alignment_accuracy
        }));

        const response: TrendsAPI.Subjects.Alignment.Response = {
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
        return NextResponse.json({ error: "subjects query failed. See server log for error", e }, { status: 500 });
    }
}
