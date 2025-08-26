import { pool } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const sqlQuery = `--sql
        SELECT
            MIN(upload_date) as start_video_date,
            MAX(upload_date) as end_video_date
        FROM public.videos;
    `

    try {
        const { rows } = await pool.query(sqlQuery)
        const { start_video_date, end_video_date } = rows[0]
        return NextResponse.json({ start_video_date, end_video_date })
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "volume range query failed. See server log for error"}, { status: 500 })
    }
}