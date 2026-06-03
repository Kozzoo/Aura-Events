import { NextResponse } from "next/server";
import { createSessionToken, setAdminCookie } from "@/lib/auth";
import { verifyAdminCredentials } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { username: rawUsername, password } = (await request.json().catch(() => ({}))) as {
    username?: string;
    password?: string;
  };

  const username = rawUsername?.trim();
  console.log("[LOGIN] Attempting login for username:", username);
  console.log("[LOGIN] Password received:", password ? `${password.length} chars` : "empty");

  if (!username || !password) {
    console.log("[LOGIN] Missing username or password");
    return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
  }

  const isValid = await verifyAdminCredentials(username, password);
  console.log("[LOGIN] Credential verification result:", isValid);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
  }

  await setAdminCookie(createSessionToken());
  return NextResponse.json({ ok: true });
}
