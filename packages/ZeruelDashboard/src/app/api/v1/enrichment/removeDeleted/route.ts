import { NextResponse, NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import { EnrichmentAPI } from '@/types/api/enrichment';


export async function GET(request: NextRequest) {
  const sql = `--sql
    -- Select the videos marked as 'deleted' in video_features,
    WITH to_delete AS (
      SELECT video_id
      FROM video_features
      WHERE enrichment_status = 'deleted'
    ),
    -- Delete them from both video_features and videos tables
    del_video_features AS (
      DELETE FROM video_features vf
      USING to_delete t
      WHERE vf.video_id = t.video_id
      RETURNING vf.video_id
    ),
    del_videos AS (
      DELETE FROM videos v
      USING to_delete t
      WHERE v.video_id = t.video_id
      RETURNING v.video_id
    )
    -- Return the list of deleted video IDs and counts
    SELECT
      COALESCE((SELECT array_agg(DISTINCT video_id) FROM to_delete), '{}') AS ids,
      (SELECT COUNT(*) FROM del_videos) AS deleted_from_videos,
      (SELECT COUNT(*) FROM del_video_features) AS deleted_from_video_features;
  `;

  try {
    const { rows } = await pool.query(sql);
    const row = rows[0] ?? { ids: [], deleted_from_videos: 0, deleted_from_video_features: 0 };

    const responseObject: EnrichmentAPI.RemoveDeleted.Response = {
      ids: row.ids ?? [],
      deleted_from_videos: Number(row.deleted_from_videos ?? 0),
      deleted_from_video_features: Number(row.deleted_from_video_features ?? 0),
    }

    return NextResponse.json(responseObject);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'removeDeleted DELETE failed. See server log' }, { status: 500 });
  }
}
