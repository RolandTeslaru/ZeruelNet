import { Request, Response } from "express"
import { z } from "zod"
import { pool } from "../../../lib/db"
import { VideoFeaturesQuerySchema } from "@zeruel/dashboard-types"

export async function getVideoFeatures(req: Request, res: Response) {
    const parsed = VideoFeaturesQuerySchema.safeParse(req.query)
    if(!parsed.success)
        return res.status(400).json({ error: z.treeifyError(parsed.error) })

    const { limit, offset, since, until, detected_language, enrichment_status,
            min_alignment, max_alignment, min_polarity, max_polarity, 
            identified_subjects, timestamp, sort, video_id
    } = parsed.data

    const orderByWhitelist = {
        "last_enriched_at": "vf.last_enriched_at",
        "polarity": "vf.polarity",
        "llm_overall_alignment": "vf.llm_overall_alignment"
    };
    const orderBy = orderByWhitelist[timestamp]; // zod provides a a default option
    const direction = sort.toUpperCase()

    const query_params = [
        since ?? null,              // $1
        until ?? null,              // $2
        detected_language ?? null,  // $3
        enrichment_status ?? null,  // $4
        min_alignment ?? null,      // $5
        max_alignment ?? null,      // $6
        min_polarity ?? null,       // $7
        max_polarity ?? null,       // $8
        identified_subjects ? JSON.stringify(identified_subjects) : null, // $9
        limit,                      // $10
        offset,                      // $11
        video_id ?? null            // $12
    ];

    const query = `--sql
        WITH search_criteria AS (
            SELECT
                (c->>'subject') AS subject,
                (c->>'min_stance')::float AS min_stance,
                (c->>'max_stance')::float AS max_stance
            FROM jsonb_array_elements($9::jsonb) AS c
        )
        SELECT vf.*, COUNT(*) OVER() as total_count
        FROM public.video_features vf
        WHERE
            ($1::timestamptz IS NULL OR vf.last_enriched_at >= $1)
            AND ($2::timestamptz IS NULL OR vf.last_enriched_at < $2)
            AND ($3::text IS NULL OR vf.detected_language = $3)
            AND ($4::text IS NULL OR vf.enrichment_status = $4)
            AND ($5::float IS NULL OR vf.llm_overall_alignment >= $5)
            AND ($6::float IS NULL OR vf.llm_overall_alignment <= $6)
            AND ($7::float IS NULL OR vf.polarity >= $7)
            AND ($8::float IS NULL OR vf.polarity <= $8)
            AND ($9::jsonb IS NULL OR (
                SELECT COUNT(*)
                FROM search_criteria sc
                WHERE EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements(vf.llm_identified_subjects) elem
                    WHERE
                        lower(elem->>'subject') LIKE '%' || lower(sc.subject) || '%'
                        AND ((elem->>'stance')::float >= sc.min_stance OR sc.min_stance IS NULL)
                        AND ((elem->>'stance')::float <= sc.max_stance OR sc.max_stance IS NULL)
                )
            ) = (SELECT COUNT(*) FROM search_criteria)
        )
        AND ($12::text IS NULL OR vf.video_id = $12)
        ORDER BY ${orderBy} ${direction}
        LIMIT $10 OFFSET $11;
    `;

    try {
        const { rows } = await pool.query(query, query_params)
        const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0
        res.json({ items: rows, page: { limit, offset, total }})
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: "video_features query failed. See server log for error"})
    }
}
