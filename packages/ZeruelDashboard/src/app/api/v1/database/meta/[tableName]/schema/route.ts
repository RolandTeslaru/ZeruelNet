import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(

  _request: NextRequest,
  { params }: { params: Promise<{ tableName: string }> }
  
) {
  const { tableName } = await params;

  const allowedTables = ['videos', 'video_features', 'comments'];
  if (!allowedTables.includes(tableName)) {
      return NextResponse.json({ error: "Access to this table is forbidden." }, { status: 403 });
  }

  try {
      const { rows } = await pool.query(
          `SELECT column_name, data_type FROM information_schema.columns 
           WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
          [tableName]
      );
      return NextResponse.json(rows);
  } catch (e) {
      console.error(e);
      return NextResponse.json({ error: "Failed to fetch table schema." }, { status: 500 });
  }
}
