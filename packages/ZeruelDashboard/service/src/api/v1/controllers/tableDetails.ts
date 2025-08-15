import { pool } from "../../../lib/db";
import { z } from "zod";
import { TableSchemaQuerySchema } from "@zeruel/dashboard-types";

export async function getTableColumns(req: any, res: any) {
    const { tableName } = req.params;
    try {
        const columns = await pool.query(
            `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1;`,
            [tableName]
        ).then(result => result.rows);
        res.status(200).json(columns);
    } catch (err) {
        res.status(500).json({ error: `Failed to fetch columns for table ${tableName}` });
    }
}

export async function getTableConstraints(req: any, res: any) {
    const { tableName } = req.params;
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
        res.status(200).json(constraints);
    } catch (err) {
        res.status(500).json({ error: `Failed to fetch constraints for table ${tableName}` });
    }
}

export async function getTableIndexes(req: any, res: any) {
    const { tableName } = req.params;
    try {
        const indexes = await pool.query(
            `SELECT indexname AS index_name, indexdef AS index_definition FROM pg_indexes WHERE tablename = $1;`,
            [tableName]
        ).then(result => result.rows);
        res.status(200).json(indexes);
    } catch (err) {
        res.status(500).json({ error: `Failed to fetch indexes for table ${tableName}` });
    }
}

export async function getTableTriggers(req: any, res: any) {
    const { tableName } = req.params;
    try {
        const triggers = await pool.query(
            `SELECT trigger_name, event_manipulation, action_timing FROM information_schema.triggers WHERE event_object_table = $1;`,
            [tableName]
        ).then(result => result.rows);
        res.status(200).json(triggers);
    } catch (err) {
        res.status(500).json({ error: `Failed to fetch triggers for table ${tableName}` });
    }
} 