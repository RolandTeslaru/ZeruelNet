import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { tableName: string } }
) {
  const { tableName } = params;
  try {
    const columns = await pool.query(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1;`,
        [tableName]
    ).then(result => result.rows);
    
    return NextResponse.json(columns);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: `Failed to fetch columns for table ${tableName}` },
      { status: 500 }
    );
  }
}
