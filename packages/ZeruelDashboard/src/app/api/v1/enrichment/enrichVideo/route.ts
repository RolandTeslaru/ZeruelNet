import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { EnrichmentAPI } from '@/types/api/enrichment';
import { redisBroker } from '@/lib/redisBroker';
import { z } from 'zod';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = Object.fromEntries(searchParams.entries());

    const parsed = EnrichmentAPI.Enrich.Query.safeParse(query);
    if (!parsed.success) {
        console.error(z.treeifyError(parsed.error));
        return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const videoId = parsed.data.video_id;

    try {
        const response = await redisBroker.publish('enrichment_queue', videoId);
    
        return NextResponse.json({
            message: "Enrichment task queued",
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'runOnFailed query failed. See server log' }, { status: 500 });
    }
}