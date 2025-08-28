import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(

  _request: NextRequest,
  { params }: { params: Promise<{ tableName: string }> }
  
) {
  const { tableName } = await params;
  try {
    const triggers = await pool.query(
        `SELECT trigger_name, event_manipulation, action_timing FROM information_schema.triggers WHERE event_object_table = $1;`,
        [tableName]
    ).then(result => result.rows);

    return NextResponse.json(triggers);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: `Failed to fetch triggers for table ${tableName}` },
      { status: 500 }
    );
  }
}
