import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { readDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await readDb();
  return NextResponse.json({ clients: db.clients });
}
