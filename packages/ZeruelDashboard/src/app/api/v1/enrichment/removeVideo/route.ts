import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { EnrichmentAPI } from '@/types/api/enrichment';
import { redisBroker } from '@/lib/redisBroker';
import { success, z } from 'zod';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = Object.fromEntries(searchParams.entries());

    const parsed = EnrichmentAPI.RemoveVideo.Query.safeParse(query);
    if (!parsed.success) {
        console.error(z.treeifyError(parsed.error));
        return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const videoId = parsed.data.video_id;

    try {
        await pool.query('DELETE FROM video_features WHERE video_id = $1', [videoId]);
        await pool.query('DELETE FROM videos WHERE video_id = $1', [videoId]);
        
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}