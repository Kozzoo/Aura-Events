import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteClient } from "@/lib/db";

export const runtime = "nodejs";

type Context = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_: Request, context: Context) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await context.params;
  const id = Number(idStr);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const deleted = await deleteClient(id);

  return NextResponse.json({ deleted });
}
