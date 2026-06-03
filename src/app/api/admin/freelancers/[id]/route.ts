import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteFreelancer, updateFreelancerStatus } from "@/lib/db";
import type { FreelancerStatus } from "@/lib/types";

export const runtime = "nodejs";


type Context = {
  params: { id: string } | Promise<{ id: string }>;
};
export async function GET(_: Request, context: Context) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const params = await context.params;
  const idStr = typeof params === "object" && "id" in params ? params.id : undefined;
  if (!idStr) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const id = Number(idStr);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const { readDb } = await import("@/lib/db");
  const db = await readDb();
  const freelancer = db.freelancers.find((f) => f.id === id);
  if (!freelancer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(freelancer);
}

export async function PATCH(request: Request, context: Context) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = (await request.json().catch(() => ({}))) as {
    status?: FreelancerStatus;
  };

  if (!status || !["Pending", "Approved", "Rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const { id: idStr } = await context.params;
  const id = Number(idStr);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const freelancer = await updateFreelancerStatus(id, status);

  if (!freelancer) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ freelancer });
}

export async function DELETE(_: Request, context: Context) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await context.params;
  const id = Number(idStr);
  const deleted = await deleteFreelancer(id);

  return NextResponse.json({ deleted });
}
