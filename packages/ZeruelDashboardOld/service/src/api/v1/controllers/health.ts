import { Request, Response } from "express"
import { pool } from "../../../lib/db"

export async function getDatabaseHealth(req: Request, res: Response){
    try {
        await pool.query('SELECT 1');
        res.status(200).send('Database connection is healthy');
    } catch (error) {
        console.error('Database health check failed:', error);
        res.status(503).send('Database connection failed');
    }
}