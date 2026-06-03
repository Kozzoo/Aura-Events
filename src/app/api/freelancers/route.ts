import path from "path";
import { NextResponse } from "next/server";
import { addFreelancer } from "@/lib/db";
import { isEmail, numberValue, requireFields, text } from "@/lib/validation";

export const runtime = "nodejs";

// On serverless platforms the filesystem is read-only; instead of writing uploads
// to disk we keep the bytes and store them in the database as bytea columns.
async function readUploadData(file: FormDataEntryValue | null, prefix: string) {
  if (!(file instanceof File) || file.size === 0) {
    return { filename: undefined, data: undefined };
  }

  const extension = path.extname(file.name).slice(0, 12);
  const safeName = `${prefix}-${Date.now()}-${crypto.randomUUID()}${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  return { filename: safeName, data: bytes };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const payload = {
      fullName: text(formData.get("fullName")),
      age: numberValue(formData.get("age")),
      gender: text(formData.get("gender")),
      phone: text(formData.get("phone")),
      email: text(formData.get("email")),
      city: text(formData.get("city")),
      experience: text(formData.get("experience")),
      languages: text(formData.get("languages")),
      availability: text(formData.get("availability")),
      profilePhoto: (await readUploadData(formData.get("profilePhoto"), "photo")).filename,
      profilePhotoData: (await readUploadData(formData.get("profilePhoto"), "photo")).data,
      cv: (await readUploadData(formData.get("cv"), "cv")).filename,
      cvData: (await readUploadData(formData.get("cv"), "cv")).data,
    };
    const missing = requireFields(
      {
        fullName: payload.fullName,
        phone: payload.phone,
      },
      {
        fullName: "Full name",
        phone: "Phone number",
      },
    );

    if (missing) {
      return NextResponse.json({ error: missing }, { status: 400 });
    }

    if (payload.email && !isEmail(payload.email)) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }

    const freelancer = await addFreelancer(payload);
    return NextResponse.json({ freelancer }, { status: 201 });
  } catch (err) {
    // Log the error for debugging
    // eslint-disable-next-line no-console
    console.error("Error saving freelancer application:", err);
    return NextResponse.json(
      { error: "Freelancer application could not be saved." },
      { status: 500 },
    );
  }
}
