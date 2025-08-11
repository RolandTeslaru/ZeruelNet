import { Request, Response } from "express"
import { pool } from "../../../lib/db"

export async function getTableSchema(req: Request, res: Response) {
    const { tableName } = req.params;

    const allowedTables = ['videos', 'video_features', 'comments'];
    if (!allowedTables.includes(tableName)) {
        return res.status(403).json({ error: "Access to this table is forbidden." });
    }

    try {
        const { rows } = await pool.query(
            `SELECT column_name, data_type FROM information_schema.columns 
             WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
            [tableName]
        );
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch table schema." });
    }
}