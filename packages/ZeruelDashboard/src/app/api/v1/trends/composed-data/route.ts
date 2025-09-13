import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { z } from 'zod';
import { TrendsAPI } from '@/types/api/trends';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    // subjects comes in as a single JSON-encoded string because query strings
    // can’t carry nested objects cleanly. Parse it manually and merge into the
    // query object so Zod can validate it against `TrendsAPI.ComposedData.Query`.
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

    const parsed = TrendsAPI.ComposedData.Query.safeParse(query);
    if (!parsed.success) {
        return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const {
        interval, since, until,
        min_final_alignment, max_final_alignment,
        min_deterministic_alignment, max_deterministic_alignment,
        min_llm_overall_alignment, max_llm_overall_alignment,
        min_text_polarity, max_text_polarity, subjects
    } = parsed.data;

    const queryParams: any[] = [
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

    // Dynamically build per-subject filters (OR between subjects, AND within one)
    let subjectSqlClause = "";
    if (subjects && subjects.length > 0) {
        const perSubjectClauses: string[] = [];
        let paramIdx = queryParams.length + 1; // next placeholder index

        subjects.forEach((s) => {
            const clauses: string[] = [];

            if (s.subject) {
                clauses.push(`LOWER(elem->>'subject') = LOWER($${paramIdx})`);
                queryParams.push(s.subject);
                paramIdx++;
            }

            if (s.min_stance !== undefined) {
                clauses.push(`(elem->>'stance')::numeric >= $${paramIdx}`);
                queryParams.push(s.min_stance);
                paramIdx++;
            }
            if (s.max_stance !== undefined) {
                clauses.push(`(elem->>'stance')::numeric <= $${paramIdx}`);
                queryParams.push(s.max_stance);
                paramIdx++;
            }

            if (s.min_alignment_score !== undefined) {
                clauses.push(`(elem->>'alignment_score')::numeric >= $${paramIdx}`);
                queryParams.push(s.min_alignment_score);
                paramIdx++;
            }
            if (s.max_alignment_score !== undefined) {
                clauses.push(`(elem->>'alignment_score')::numeric <= $${paramIdx}`);
                queryParams.push(s.max_alignment_score);
                paramIdx++;
            }

            if (s.min_expected_alignment !== undefined) {
                clauses.push(`(elem->>'expected_alignment')::numeric >= $${paramIdx}`);
                queryParams.push(s.min_expected_alignment);
                paramIdx++;
            }
            if (s.max_expected_alignment !== undefined) {
                clauses.push(`(elem->>'expected_alignment')::numeric <= $${paramIdx}`);
                queryParams.push(s.max_expected_alignment);
                paramIdx++;
            }

            if (clauses.length > 0) {
                perSubjectClauses.push(`EXISTS (SELECT 1 FROM jsonb_array_elements(vf.llm_identified_subjects) elem WHERE ${clauses.join(' AND ')})`);
            }
        });

        if (perSubjectClauses.length > 0) {
            subjectSqlClause = `\n            AND (${perSubjectClauses.join(' OR ')})`;
        }
    }


    const sqlQuery = `--sql
        SELECT
            date_trunc($1, v.created_at) as bucket,
            COUNT(vf.video_id) as volume,
            AVG(vf.final_alignment) as avg_final_alignment,
            AVG(vf.llm_overall_alignment) as avg_llm_overall_alignment,
            AVG(vf.deterministic_alignment) as avg_deterministic_alignment,
            AVG(vf.polarity) as avg_polarity,
            percentile_cont(0.5) WITHIN GROUP (ORDER BY ((v.likes_count + v.comment_count + v.share_count)::numeric)) as median_engagement,
            AVG((v.likes_count + v.comment_count + v.share_count)::numeric) as mean_engagement,
            SUM(v.likes_count)   AS likes,
            SUM(v.comment_count) AS comments,
            SUM(v.share_count)   AS shares

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
            AND ($11::numeric IS NULL OR vf.polarity <= $11)${subjectSqlClause}
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
                total_buckets: rows.length,
                queryParams
            }
        }

        return NextResponse.json(response)
    } catch (e) {
        console.error('Database query error:', e);
        return NextResponse.json({ error: "data-bounds query failed. See server log for error" }, { status: 500 })
    }
}
