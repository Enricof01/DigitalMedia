import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createHmac, timingSafeEqual } from "node:crypto";

type ChallengePayload = {
  action?: unknown;
  name?: unknown;
  email?: unknown;
  password?: unknown;
  userId?: unknown;
  day?: unknown;
  screenMinutes?: unknown;
  targetMinutes?: unknown;
  goal?: unknown;
  note?: unknown;
};

type UserRow = {
  id: number;
  name: string;
  email: string;
  password: string;
};

type EntryRow = {
  id: number;
  day: number;
  screenMinutes: number;
  targetMinutes: number;
  goal: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const MAX_SCREEN_MINUTES = 16 * 60;
const MAX_TARGET_MINUTES = 12 * 60;
const SESSION_COOKIE = "mindscroll_session";

function getSessionSecret() {
  return process.env.AUTH_SECRET ?? process.env.DATABASE_URL ?? "mindscroll-local-secret";
}

function readText(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 120) : fallback;
}

function readEmail(value: unknown) {
  const email = readText(value).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function readPassword(value: unknown) {
  if (typeof value !== "string") return null;

  const password = value.trim();
  return password.length >= 6 ? password : null;
}

function readNumber(value: unknown, min: number, max: number) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return null;

  return Math.max(min, Math.min(max, Math.round(numberValue)));
}

function serializeEntries(entries: EntryRow[]) {
  return entries.map((entry) => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }));
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

function readSessionUserId(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((part) => part.trim());
  const sessionCookie = cookies.find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  const value = sessionCookie ? decodeURIComponent(sessionCookie.split("=").slice(1).join("=")) : null;

  return verifySessionValue(value);
}

async function loadEntries(userId: number) {
  return prisma.$queryRaw<EntryRow[]>`
    SELECT id, day, "screenMinutes", "targetMinutes", goal, note, "createdAt", "updatedAt"
    FROM "ChallengeEntry"
    WHERE "userId" = ${userId}
    ORDER BY day ASC
  `;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionUserId = readSessionUserId(request);
    const requestedUserId = readNumber(searchParams.get("userId"), 1, Number.MAX_SAFE_INTEGER);

    if (sessionUserId === null) {
      return NextResponse.json({ error: "Bitte erst anmelden." }, { status: 401 });
    }

    if (requestedUserId !== null && requestedUserId !== sessionUserId) {
      return NextResponse.json({ error: "Du bist nicht fuer diesen Account angemeldet." }, { status: 403 });
    }

    const entries = await loadEntries(sessionUserId);
    return NextResponse.json({ entries: serializeEntries(entries) });
  } catch (error) {
    console.error("Failed to load challenge entries", error);

    return NextResponse.json(
      { error: "Die Challenge konnte nicht geladen werden." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChallengePayload;
    const action = readText(body.action, "entry");

    if (action === "login" || action === "register") {
      const name = readText(body.name);
      const email = readEmail(body.email);
      const password = readPassword(body.password);

      if (!email || !password || (action === "register" && !name)) {
        return NextResponse.json(
          { error: action === "register" ? "Bitte Name, gültige E-Mail und ein Passwort mit mindestens 6 Zeichen angeben." : "Bitte gültige E-Mail und Passwort angeben." },
          { status: 400 },
        );
      }

      const existingUsers = await prisma.$queryRaw<UserRow[]>`
        SELECT id, name, email, password
        FROM "User"
        WHERE email = ${email}
        LIMIT 1
      `;
      const existingUser = existingUsers[0] ?? null;
      let user: UserRow;

      if (existingUser) {
        if (action === "register" && existingUser.password) {
          return NextResponse.json(
            { error: "Diesen Account gibt es schon. Bitte einloggen." },
            { status: 409 },
          );
        }

        if (existingUser.password && !verifyPassword(password, existingUser.password)) {
          return NextResponse.json(
            { error: "Passwort stimmt nicht." },
            { status: 401 },
          );
        }

        const nextPassword = existingUser.password || hashPassword(password);
        const nextName = name || existingUser.name;
        const updatedUsers = await prisma.$queryRaw<UserRow[]>`
          UPDATE "User"
          SET name = ${nextName}, password = ${nextPassword}, "updatedAt" = CURRENT_TIMESTAMP
          WHERE id = ${existingUser.id}
          RETURNING id, name, email, password
        `;
        user = updatedUsers[0];
      } else {
        if (action === "login") {
          return NextResponse.json(
            { error: "Account nicht gefunden. Bitte erst neu erstellen." },
            { status: 404 },
          );
        }

        const hashedPassword = hashPassword(password);
        const createdUsers = await prisma.$queryRaw<UserRow[]>`
          INSERT INTO "User" (name, email, password, "createdAt", "updatedAt")
          VALUES (${name}, ${email}, ${hashedPassword}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id, name, email, password
        `;
        user = createdUsers[0];
      }

      const entries = await loadEntries(user.id);
      const response = NextResponse.json(
        {
          user: { id: user.id, name: user.name, email: user.email },
          entries: serializeEntries(entries),
        },
        { status: 200 },
      );

      response.cookies.set(SESSION_COOKIE, signUserId(user.id), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 14,
      });

      return response;
    }

    const userId = readNumber(body.userId, 1, Number.MAX_SAFE_INTEGER);
    const sessionUserId = readSessionUserId(request);
    const day = readNumber(body.day, 1, 7);
    const screenMinutes = readNumber(body.screenMinutes, 0, MAX_SCREEN_MINUTES);
    const targetMinutes = readNumber(body.targetMinutes, 15, MAX_TARGET_MINUTES);
    const goal = readText(body.goal, "60 Minuten");
    const note = readText(body.note, "");

    if (userId === null || day === null || screenMinutes === null || targetMinutes === null) {
      return NextResponse.json(
        { error: "Bitte Tag und Bildschirmzeit angeben." },
        { status: 400 },
      );
    }

    if (sessionUserId !== userId) {
      return NextResponse.json(
        { error: "Bitte zuerst mit diesem Account anmelden." },
        { status: 401 },
      );
    }

    await prisma.$executeRaw`
      INSERT INTO "ChallengeEntry" ("userId", day, "screenMinutes", "targetMinutes", goal, note, "createdAt", "updatedAt")
      VALUES (${userId}, ${day}, ${screenMinutes}, ${targetMinutes}, ${goal}, ${note || null}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT ("userId", day)
      DO UPDATE SET
        "screenMinutes" = EXCLUDED."screenMinutes",
        "targetMinutes" = EXCLUDED."targetMinutes",
        goal = EXCLUDED.goal,
        note = EXCLUDED.note,
        "updatedAt" = CURRENT_TIMESTAMP
    `;

    const entries = await loadEntries(userId);
    return NextResponse.json({ entries: serializeEntries(entries) }, { status: 201 });
  } catch (error) {
    console.error("Failed to save challenge entry", error);

    return NextResponse.json(
      { error: "Der Challenge-Tag konnte nicht gespeichert werden." },
      { status: 500 },
    );
  }
}
