import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { z } from 'zod';
import { TrendsAPI } from '@/types/api/trends';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const rawQuery = Object.fromEntries(searchParams.entries());

    // Handle bracket-notation e.g. subjects[0][subject]=Putin&subjects[1][subject]=NATO
    if (!rawQuery.subjects) {
        const bracketRe = /^subjects\[(\d+)]\[(\w+)]$/;
        const subjectObjects: Record<string, any> = {};
        searchParams.forEach((value, key) => {
            const m = key.match(bracketRe);
            if (m) {
                const [_, idx, field] = m;
                if (!subjectObjects[idx]) subjectObjects[idx] = {};
                subjectObjects[idx][field] = value;
            }
        });
        const keys = Object.keys(subjectObjects);
        if (keys.length > 0) {
            const arr = keys.sort().map((k) => subjectObjects[k]);
            rawQuery.subjects = JSON.stringify(arr);
        }
    }

    // Fallback: allow simple repetition like ?subject=a&subject=b
    if (rawQuery.subjects) {
        try {
            rawQuery.subjects = JSON.parse(rawQuery.subjects);
        } catch (_) {
            return NextResponse.json({ error: "Invalid 'subjects' JSON" }, { status: 400 });
        }
    }

    const query = rawQuery;

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
        country_code,
        subjects
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

    const queryParams: any[] = [
        since,                      // $1
        until,                      // $2
        min_alignment_score,        // $3
        max_alignment_score,        // $4
        min_polarity,              // $5
        max_polarity,              // $6
    ];

    if (needsKnowledgeJoin) {
        queryParams.push(
            category,               // $7
            min_weight,            // $8
            max_weight,            // $9
            country_code,          // $10
            min_alignment_tendency, // $11
            max_alignment_tendency  // $12
        );
    }

    // Build subject filtering to apply to the result set (not video filtering)
    let subjectResultFilter = "";
    if (subjects && subjects.length > 0) {
        const subjectConditions: string[] = [];
        let paramIdx = queryParams.length + 1;

        subjects.forEach((s) => {
            const conditions: string[] = [];

            if (s.subject) {
                conditions.push(`LOWER(subj_data->>'subject') = LOWER($${paramIdx})`);
                queryParams.push(s.subject);
                paramIdx++;
            }

            if (s.min_stance !== undefined) {
                conditions.push(`(subj_data->>'stance')::numeric >= $${paramIdx}`);
                queryParams.push(s.min_stance);
                paramIdx++;
            }
            if (s.max_stance !== undefined) {
                conditions.push(`(subj_data->>'stance')::numeric <= $${paramIdx}`);
                queryParams.push(s.max_stance);
                paramIdx++;
            }

            if (s.min_alignment_score !== undefined) {
                conditions.push(`(subj_data->>'alignment_score')::numeric >= $${paramIdx}`);
                queryParams.push(s.min_alignment_score);
                paramIdx++;
            }
            if (s.max_alignment_score !== undefined) {
                conditions.push(`(subj_data->>'alignment_score')::numeric <= $${paramIdx}`);
                queryParams.push(s.max_alignment_score);
                paramIdx++;
            }

            if (s.min_expected_alignment !== undefined) {
                conditions.push(`(subj_data->>'expected_alignment')::numeric >= $${paramIdx}`);
                queryParams.push(s.min_expected_alignment);
                paramIdx++;
            }
            if (s.max_expected_alignment !== undefined) {
                conditions.push(`(subj_data->>'expected_alignment')::numeric <= $${paramIdx}`);
                queryParams.push(s.max_expected_alignment);
                paramIdx++;
            }

            if (conditions.length > 0) {
                subjectConditions.push(`(${conditions.join(' AND ')})`);
            }
        });

        if (subjectConditions.length > 0) {
            subjectResultFilter = `\n              AND (${subjectConditions.join(' OR ')})`;
        }
    }

    let sqlQuery: string;

    if (needsKnowledgeJoin) {
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
              ${subjectResultFilter}
            GROUP BY 
                (subj_data->>'subject')::text,
                ks.category, 
                ks.weight, 
                ks.country_code
            ORDER BY popularity DESC
            LIMIT 50
        `;
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
              ${subjectResultFilter}
            GROUP BY (subj_data->>'subject')::text
            ORDER BY popularity DESC
            LIMIT 50
        `;
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