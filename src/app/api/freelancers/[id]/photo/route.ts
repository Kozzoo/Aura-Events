import { NextResponse } from "next/server";

import { readDb } from "@/lib/db";


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

    const db = await readDb();
    const freelancer = db.freelancers.find((f) => f.id === id);

    // NOTE: `readDb()` does not return binary columns by default.
    // If your DB stores the photo in binary (`profile_photo_data`),
    // the correct fix is to either:
    // 1) expose photo_data in readDb for this route, or
    // 2) query via a server-side DB client export.
    //
    // For now we support the filename/path case.
    if (!freelancer) {
      return NextResponse.json({ error: "Freelancer not found" }, { status: 404 });
    }

    // If we only have a filename/path stored in profilePhoto, serve it from /api/uploads.
    // If profile_photo_data is truly needed, this endpoint should query it directly.
    if (!freelancer.profilePhoto) {
      return NextResponse.json({ error: "No photo available" }, { status: 404 });
    }

    const profilePhoto = freelancer.profilePhoto;
    const contentType = profilePhoto?.endsWith(".png")
      ? "image/png"
      : profilePhoto?.endsWith(".jpg") || profilePhoto?.endsWith(".jpeg")
        ? "image/jpeg"
        : profilePhoto?.endsWith(".gif")
          ? "image/gif"
          : profilePhoto?.endsWith(".webp")
            ? "image/webp"
            : "image/jpeg";

    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: `/api/uploads/${encodeURIComponent(profilePhoto)}`,
        "Content-Type": contentType,
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
