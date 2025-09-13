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
    WITH
    filtered AS (                       -- all query-param constraints applied here
        SELECT
          v.*,                          -- full video metadata, inc. thumbnail_url, stats etc.
          vf.final_alignment,
          vf.llm_overall_alignment,
          vf.deterministic_alignment,
          vf.polarity
        FROM videos v
        JOIN video_features vf ON vf.video_id = v.video_id
        WHERE v.created_at BETWEEN $2 AND $3
          AND ($4::numeric  IS NULL OR vf.final_alignment         >= $4)
          AND ($5::numeric  IS NULL OR vf.final_alignment         <= $5)
          AND ($6::numeric  IS NULL OR vf.deterministic_alignment >= $6)
          AND ($7::numeric  IS NULL OR vf.deterministic_alignment <= $7)
          AND ($8::numeric  IS NULL OR vf.llm_overall_alignment   >= $8)
          AND ($9::numeric  IS NULL OR vf.llm_overall_alignment   <= $9)
          AND ($10::numeric IS NULL OR vf.polarity               >= $10)
          AND ($11::numeric IS NULL OR vf.polarity               <= $11)
          ${subjectSqlClause}
    ),
    
    bucket_stats AS (                   -- reuse the pre-filtered rows
        SELECT
          date_trunc($1, created_at)                     AS bucket,
          COUNT(*)                                       AS volume,
          AVG(final_alignment)                           AS avg_final_alignment,
          AVG(llm_overall_alignment)                     AS avg_llm_overall_alignment,
          AVG(deterministic_alignment)                   AS avg_deterministic_alignment,
          AVG(polarity)                                  AS avg_polarity,
          percentile_cont(0.5) WITHIN GROUP (
              ORDER BY (likes_count + comment_count + share_count)::numeric
          )                                             AS median_engagement,
          AVG((likes_count + comment_count + share_count)::numeric)
                                                        AS mean_engagement,
          SUM(likes_count)                              AS likes,
          SUM(comment_count)                            AS comments,
          SUM(share_count)                              AS shares
        FROM filtered
        GROUP BY bucket
        ORDER BY bucket
    ),
    
    display_videos AS (
        SELECT *, (likes_count + comment_count + share_count) AS engagement
        FROM filtered
        ORDER BY engagement DESC
        LIMIT 12
    )
    
    SELECT
      (SELECT json_agg(bs) FROM bucket_stats  bs) AS buckets,
      (SELECT json_agg(dv) FROM display_videos dv) AS display_videos;
    `

    try {
        const { rows } = await pool.query(sqlQuery, queryParams)

        const response: TrendsAPI.ComposedData.Response = {
            buckets: rows[0].buckets,
            displayVideos: rows[0].display_videos,
            meta: {
                interval,
                date_range: { since, until },
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
