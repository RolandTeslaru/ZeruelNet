import { pool } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const sqlQuery = `--sql
        SELECT
            MIN(uploaded_at) as earliest_video_date,
            MAX(uploaded_at) as latest_video_date
        FROM public.videos;
    `

    try {
        const { rows } = await pool.query(sqlQuery)
        const { earliest_video_date, latest_video_date } = rows[0]
        return NextResponse.json({ earliest_video_date, latest_video_date })
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "volume range query failed. See server log for error"}, { status: 500 })
    }
}