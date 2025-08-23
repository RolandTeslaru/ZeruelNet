import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { tableName: string } }
) {
  const { tableName } = params;
  try {
    const constraints = await pool.query(
        `SELECT
            con.conname AS constraint_name,
            CASE con.contype
                WHEN 'p' THEN 'PRIMARY KEY'
                WHEN 'f' THEN 'FOREIGN KEY'
                WHEN 'u' THEN 'UNIQUE'
                WHEN 'c' THEN 'CHECK'
            END AS constraint_type,
            col.attname AS column_name,
            f_rel.relname AS foreign_table_name,
            f_col.attname AS foreign_column_name
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        LEFT JOIN pg_attribute col ON col.attrelid = con.conrelid AND col.attnum = ANY(con.conkey)
        LEFT JOIN pg_class f_rel ON f_rel.oid = con.confrelid
        LEFT JOIN pg_attribute f_col ON f_col.attrelid = con.confrelid AND f_col.attnum = ANY(con.confkey)
        WHERE rel.relname = $1;`,
        [tableName]
    ).then(result => result.rows);

    return NextResponse.json(constraints);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: `Failed to fetch constraints for table ${tableName}` },
      { status: 500 }
    );
  }
}
