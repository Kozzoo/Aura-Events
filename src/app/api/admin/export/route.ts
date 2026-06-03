import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { readDb } from "@/lib/db";

export const runtime = "nodejs";

function escapeCell(value: unknown) {
  const cell = String(value ?? "");
  return `"${cell.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") === "freelancers" ? "freelancers" : "clients";
  const db = await readDb();
  const rows =
    type === "freelancers"
      ? db.freelancers.map((item) => ({
          id: item.id,
          fullName: item.fullName,
          age: item.age,
          gender: item.gender,
          phone: item.phone,
          email: item.email,
          city: item.city,
          experience: item.experience,
          languages: item.languages,
          availability: item.availability,
          status: item.status,
          profilePhoto: item.profilePhoto ?? "",
          cv: item.cv ?? "",
          createdAt: item.createdAt,
        }))
      : db.clients.map((item) => ({
          id: item.id,
          fullName: item.fullName,
          companyName: item.companyName,
          email: item.email,
          phone: item.phone,
          eventType: item.eventType,
          eventDate: item.eventDate,
          location: item.location,
          ushersNeeded: item.ushersNeeded,
          notes: item.notes,
          createdAt: item.createdAt,
        }));

  const headers = Object.keys(rows[0] ?? { empty: "" });
  const csv = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCell(row[header as keyof typeof row])).join(","),
    ),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "content-disposition": `attachment; filename="aura-${type}.csv"`,
      "content-type": "text/csv; charset=utf-8",
    },
  });
}
