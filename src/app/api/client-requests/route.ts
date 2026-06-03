import { NextResponse } from "next/server";
import { addClientRequest } from "@/lib/db";
import { isEmail, numberValue, requireFields, text } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const payload = {
      fullName: text(formData.get("fullName")),
      companyName: text(formData.get("companyName")),
      email: text(formData.get("email")),
      phone: text(formData.get("phone")),
      eventType: text(formData.get("eventType")),
      eventDate: text(formData.get("eventDate")),
      location: text(formData.get("location")),
      ushersNeeded: numberValue(formData.get("ushersNeeded")),
      notes: text(formData.get("notes")),
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

    const client = await addClientRequest(payload);
    return NextResponse.json({ client }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Client request could not be saved." },
      { status: 500 },
    );
  }
}
