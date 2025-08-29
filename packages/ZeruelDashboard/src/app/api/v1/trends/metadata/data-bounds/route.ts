import { pool } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { TrendsAPI } from "@/types/api";

export async function GET(request: NextRequest) {
    const sqlQuery = `--sql
        SELECT
            MIN(upload_date) as start_video_date,
            MAX(upload_date) as end_video_date
        FROM public.videos;
    `

    try {
        const { rows } = await pool.query(sqlQuery)
        const row = rows[0]
        
        if (!row || !row.start_video_date || !row.end_video_date) {
            return NextResponse.json({ 
                error: "No video data found in database" 
            }, { status: 404 })
        }

        const response: TrendsAPI.Metadata.DataBounds.Response = {
            start_video_date: new Date(row.start_video_date).toISOString(),
            end_video_date: new Date(row.end_video_date).toISOString()
        }
        
        return NextResponse.json(response)
    } catch (e) {
        console.error('Database query error:', e);
        return NextResponse.json({ error: "data-bounds query failed. See server log for error"}, { status: 500 })
    }
}