import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { z } from 'zod';
import { TrendsAPI } from '@/types/api/trends';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = Object.fromEntries(searchParams.entries());

    const parsed = TrendsAPI.Subjects.Query.safeParse(query);
    if (!parsed.success) {
        return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const {
        since,
        until,
        min_alignment_score,
        max_alignment_score,
        min_alignment_tendency,
        max_alignment_tendency,
        min_polarity,
        max_polarity,
        include_knowledge,
        category,
        min_weight,
        max_weight,
        country_code
    } = parsed.data;

    // Determine if we need to JOIN with knowledge_subjects table
    const needsKnowledgeJoin = !!(
        category || 
        min_weight || 
        max_weight || 
        country_code ||
        min_alignment_tendency ||
        max_alignment_tendency ||
        include_knowledge
    );

    let sqlQuery: string;
    let queryParams: any[];

    if (needsKnowledgeJoin) {
        // Query WITH knowledge JOIN for filtering and/or including knowledge data
        sqlQuery = `--sql
            SELECT
                (subj_data->>'subject')::text as subject_name,
                AVG((subj_data->>'alignment_score')::numeric) as avg_alignment_score,
                AVG((subj_data->>'stance')::numeric) as avg_stance,
                AVG((subj_data->>'expected_alignment')::numeric) as expect_alignment,
                COUNT(DISTINCT vf.video_id) as popularity,
                COUNT(*) as total_mentions,
                ks.category,
                ks.weight,
                ks.country_code,
                COUNT(*) OVER() as total_count
            FROM video_features vf
            INNER JOIN videos v ON vf.video_id = v.video_id
            CROSS JOIN LATERAL jsonb_array_elements(vf.llm_identified_subjects) as subj_data
            LEFT JOIN knowledge_subjects ks ON LOWER(ks.subject_name) = LOWER(subj_data->>'subject')
            WHERE v.created_at BETWEEN $1 AND $2
              AND ($3::numeric IS NULL OR (subj_data->>'alignment_score')::numeric >= $3)
              AND ($4::numeric IS NULL OR (subj_data->>'alignment_score')::numeric <= $4)
              AND ($5::numeric IS NULL OR vf.polarity >= $5)
              AND ($6::numeric IS NULL OR vf.polarity <= $6)
              AND ($7::text IS NULL OR ks.category = $7)
              AND ($8::numeric IS NULL OR ks.weight >= $8)
              AND ($9::numeric IS NULL OR ks.weight <= $9)
              AND ($10::text IS NULL OR ks.country_code = $10)
              AND ($11::numeric IS NULL OR ks.alignment_tendency >= $11)
              AND ($12::numeric IS NULL OR ks.alignment_tendency <= $12)
              AND vf.llm_identified_subjects IS NOT NULL
              AND jsonb_array_length(vf.llm_identified_subjects) > 0
            GROUP BY 
                (subj_data->>'subject')::text,
                ks.category, 
                ks.weight, 
                ks.country_code
            ORDER BY AVG((subj_data->>'alignment_score')::numeric) DESC
            LIMIT 50
        `;
        
        queryParams = [
            since, until,
            min_alignment_score, max_alignment_score,
            min_polarity, max_polarity,
            category, min_weight, max_weight, country_code,
            min_alignment_tendency, max_alignment_tendency
        ];
        
    } else {
        // Fast query WITHOUT knowledge JOIN
        sqlQuery = `--sql
            SELECT
                (subj_data->>'subject')::text as subject_name,
                AVG((subj_data->>'alignment_score')::numeric) as avg_alignment_score,
                AVG((subj_data->>'stance')::numeric) as avg_stance,
                AVG((subj_data->>'expected_alignment')::numeric) as expect_alignment,
                COUNT(DISTINCT vf.video_id) as popularity,
                COUNT(*) as total_mentions,
                COUNT(*) OVER() as total_count
            FROM video_features vf
            INNER JOIN videos v ON vf.video_id = v.video_id
            CROSS JOIN LATERAL jsonb_array_elements(vf.llm_identified_subjects) as subj_data
            WHERE v.created_at BETWEEN $1 AND $2
              AND ($3::numeric IS NULL OR (subj_data->>'alignment_score')::numeric >= $3)
              AND ($4::numeric IS NULL OR (subj_data->>'alignment_score')::numeric <= $4)
              AND ($5::numeric IS NULL OR vf.polarity >= $5)
              AND ($6::numeric IS NULL OR vf.polarity <= $6)
              AND vf.llm_identified_subjects IS NOT NULL
              AND jsonb_array_length(vf.llm_identified_subjects) > 0
            GROUP BY (subj_data->>'subject')::text
            ORDER BY AVG((subj_data->>'alignment_score')::numeric) DESC
            LIMIT 50
        `;
        
        queryParams = [
            since, until,
            min_alignment_score, max_alignment_score,
            min_polarity, max_polarity
        ];
    }

    try {
        const { rows } = await pool.query(sqlQuery, queryParams);
        const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0;
        
        // Format the response
        const subjects = rows.map(row => {
            const subject: any = {
                subject_name: row.subject_name,
                avg_alignment_score: Number(row.avg_alignment_score),
                avg_stance: Number(row.avg_stance),
                expect_alignment: Number(row.expect_alignment),
                popularity: Number(row.popularity),
                total_mentions: Number(row.total_mentions)
            };
            
            // Only include knowledge data if we performed the JOIN
            if (needsKnowledgeJoin) {
                subject.category = row.category;
                subject.weight = row.weight ? Number(row.weight) : null;
                subject.country_code = row.country_code;
            }
            
            return subject;
        });

        const max_total_mentions = Math.max(...subjects.map(s => s.total_mentions))

        const response: TrendsAPI.Subjects.Response = {
            subjects,
            meta: {
                total_subjects: total,
                date_range: {
                    since,
                    until
                },
                used_knowledge_join: needsKnowledgeJoin,
                max_total_mentions
            }
        };

        return NextResponse.json(response);
        
    } catch (e) {
        console.error('Subjects alignment query error:', e);
        return NextResponse.json({ 
            error: "subjects alignment query failed. See server log for error" 
        }, { status: 500 });
    }
}
