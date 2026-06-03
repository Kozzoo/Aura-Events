import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id?: string }> }
) {
  try {
    const { id: idStr } = await params;
    if (!idStr) {
      return NextResponse.json({ error: "Missing freelancer ID" }, { status: 400 });
    }

    const id = Number(idStr);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid freelancer ID" }, { status: 400 });
    }

    // Fetch the profile_photo_data from the database
    const result = await pool.query(
      `SELECT profile_photo_data, profile_photo FROM freelancers WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Freelancer not found" }, { status: 404 });
    }

    const { profile_photo_data, profile_photo } = result.rows[0];

    if (!profile_photo_data) {
      return NextResponse.json({ error: "No photo available" }, { status: 404 });
    }

    // Return the binary data with appropriate content-type
    const contentType = profile_photo?.endsWith(".png")
      ? "image/png"
      : profile_photo?.endsWith(".jpg") || profile_photo?.endsWith(".jpeg")
        ? "image/jpeg"
        : profile_photo?.endsWith(".gif")
          ? "image/gif"
          : profile_photo?.endsWith(".webp")
            ? "image/webp"
            : "image/jpeg"; // default to JPEG

    return new NextResponse(profile_photo_data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600", // cache for 1 hour
      },
    });
  } catch (err) {
    console.error("Error fetching freelancer photo:", err);
    return NextResponse.json(
      { error: "Failed to fetch photo" },
      { status: 500 }
    );
  }
}
