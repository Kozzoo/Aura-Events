import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const uploadDir = path.join(process.cwd(), "data", "uploads");

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
};

export async function GET(
  _: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const safeName = path.basename(filename);

  if (safeName !== filename) {
    return NextResponse.json({ error: "Invalid file." }, { status: 400 });
  }

  try {
    const file = await readFile(path.join(uploadDir, safeName));
    const extension = path.extname(safeName).toLowerCase();

    return new NextResponse(file, {
      headers: {
        "content-type": contentTypes[extension] ?? "application/octet-stream",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
}
