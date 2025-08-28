import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(

  _request: NextRequest,
  { params }: { params: Promise<{ tableName: string }> }
  
) {
  const { tableName } = await params;
  try {
    const indexes = await pool.query(
        `SELECT indexname AS index_name, indexdef AS index_definition FROM pg_indexes WHERE tablename = $1;`,
        [tableName]
    ).then(result => result.rows);

    return NextResponse.json(indexes);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: `Failed to fetch indexes for table ${tableName}` },
      { status: 500 }
    );
  }
}
