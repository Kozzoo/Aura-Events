import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSummary } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getSummary());
}
