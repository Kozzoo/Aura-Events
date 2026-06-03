import { NextResponse } from "next/server";
import { getAdminByUsername } from "@/lib/db";
import { Pool } from "pg";

export const runtime = "nodejs";

export async function GET() {
  try {
    // simple direct query to list admins
    const res = await fetchAdminList();
    return NextResponse.json({ admins: res });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}

async function fetchAdminList() {
  // reuse the pool from db.ts by importing helper if available
  // fallback: query directly using DATABASE_URL
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const result = await pool.query(`SELECT id, username, created_at as "createdAt" FROM admins ORDER BY id`);
    return result.rows;
  } finally {
    await pool.end();
  }
}
