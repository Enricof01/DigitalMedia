import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const SESSION_COOKIE = "mindscroll_session";

function getSessionSecret() {
  return process.env.AUTH_SECRET ?? process.env.DATABASE_URL ?? "mindscroll-local-secret";
}

function signUserId(userId: number) {
  const signature = createHmac("sha256", getSessionSecret())
    .update(String(userId))
    .digest("hex");

  return `${userId}.${signature}`;
}

function verifySessionValue(value: string | null) {
  if (!value) return null;

  const [userIdValue, signature] = value.split(".");
  const userId = Number(userIdValue);

  if (!Number.isInteger(userId) || userId < 1 || !signature) return null;

  const expected = signUserId(userId).split(".")[1];
  const receivedBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (receivedBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(receivedBuffer, expectedBuffer)) return null;

  return userId;
}

export function readSessionUserId(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((part) => part.trim());
  const sessionCookie = cookies.find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  const value = sessionCookie ? decodeURIComponent(sessionCookie.split("=").slice(1).join("=")) : null;

  return verifySessionValue(value);
}

export function attachSessionCookie(response: NextResponse, userId: number) {
  response.cookies.set(SESSION_COOKIE, signUserId(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
