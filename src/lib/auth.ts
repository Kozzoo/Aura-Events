import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const cookieName = "aura_admin_session";
const sessionHours = 8;

function secret() {
  return process.env.AUTH_SECRET ?? "replace-this-secret-before-production";
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD ?? "admin123";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function verifyPassword(password: string) {
  const expected = Buffer.from(adminPassword());
  const actual = Buffer.from(password);

  return (
    expected.length === actual.length && timingSafeEqual(expected, actual)
  );
}

export function createSessionToken() {
  const expires = Date.now() + sessionHours * 60 * 60 * 1000;
  const payload = `admin.${expires}`;

  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string) {
  if (!token) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const payload = `${parts[0]}.${parts[1]}`;
  const expected = sign(payload);
  const received = parts[2];
  const isValid =
    expected.length === received.length &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(received));

  return isValid && Number(parts[1]) > Date.now();
}

export async function requireAdmin() {
  const token = (await cookies()).get(cookieName)?.value;
  return verifySessionToken(token);
}

export async function setAdminCookie(token: string) {
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionHours * 60 * 60,
    path: "/",
  });
}

export async function clearAdminCookie() {
  (await cookies()).delete(cookieName);
}
