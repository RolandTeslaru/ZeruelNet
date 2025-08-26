import { pool } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = Object.fromEntries(searchParams.entries());
    
    const sqlQuery = `--sql
        
    `

    try {
        
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "query failed. See server log for error"}, { status: 500 })
    }
}