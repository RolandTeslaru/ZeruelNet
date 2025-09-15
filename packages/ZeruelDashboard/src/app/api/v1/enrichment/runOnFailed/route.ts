import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { EnrichmentAPI } from '@/types/api/enrichment';
import { redisBroker } from '@/lib/redisBroker';

export async function GET(request: NextRequest) {
    const getFailedVideoIdsQuery = `--sql
        SELECT video_id FROM video_features
        WHERE enrichment_status = 'failed';
    `;

    try {
        // Get failed video IDs first
        const failedVideos = await pool.query(getFailedVideoIdsQuery);
        
        // Publish each video_id to Redis enrichment queue
        for (const row of failedVideos.rows) {
            await redisBroker.publish('enrichment_queue', row.video_id);
        }

        const responseObject: EnrichmentAPI.RunOnFailed.Response = {
            failedVideoIds: failedVideos.rows.map((r) => r.video_id)
        }

        console.log(`Re-enrichment triggered for ${failedVideos.rows.length} failed videos.`);

        return NextResponse.json(responseObject);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'runOnFailed query failed. See server log' }, { status: 500 });
    }
}