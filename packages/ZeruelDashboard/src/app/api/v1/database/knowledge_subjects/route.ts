import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { z } from 'zod';
import { DatabaseAPI } from '@/types/api/database';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = Object.fromEntries(searchParams.entries());

    const parsed = DatabaseAPI.KnowledgeSubjects.Query.safeParse(query);
    if(!parsed.success) {
        return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const { 
        subject_name, min_alignment_tendency, max_alignment_tendency, 
        min_weight, max_weight, category, country_code
    } = parsed.data;

    const query_params = [
        subject_name            ?? null, // $1
        min_alignment_tendency  ?? null, // $2
        max_alignment_tendency  ?? null, // $3
        min_weight              ?? null, // $4
        max_weight              ?? null, // $5
        category                ?? null, // $6
        country_code            ?? null, // $7
    ];

    const sqlQuery = `--sql
        select ks.*, COUNT(*) OVER() as total_count
        from public.knowledge_subjects ks
        WHERE ($1::text IS NULL OR ks.subject_name = $1)
          AND ($2::float IS NULL OR ks.alignment_tendency >= $2)
          AND ($3::float IS NULL OR ks.alignment_tendency <= $3)
          AND ($4::float IS NULL OR ks.weight >= $4)
          AND ($5::float IS NULL OR ks.weight <= $5)
          AND ($6::text IS NULL OR ks.category = $6)
          AND ($7::text IS NULL OR ks.country_code = $7)

          
    `;

    try {
        const { rows } = await pool.query(sqlQuery, query_params);
        const total = rows[0]?.total_count ? Number(rows[0].total_count) : 0;
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "video_features query failed. See server log for error"}, { status: 500 });
    }
}
