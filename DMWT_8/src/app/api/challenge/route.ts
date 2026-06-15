import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ChallengePayload = {
  action?: unknown;
  name?: unknown;
  email?: unknown;
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

function readText(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 120) : fallback;
}

function readEmail(value: unknown) {
  const email = readText(value).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
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
    const userId = readNumber(searchParams.get("userId"), 1, Number.MAX_SAFE_INTEGER);

    if (userId === null) {
      return NextResponse.json({ error: "Bitte erst anmelden." }, { status: 400 });
    }

    const entries = await loadEntries(userId);
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

    if (action === "login") {
      const name = readText(body.name);
      const email = readEmail(body.email);

      if (!name || !email) {
        return NextResponse.json(
          { error: "Bitte Name und gültige E-Mail angeben." },
          { status: 400 },
        );
      }

      const users = await prisma.$queryRaw<UserRow[]>`
        INSERT INTO "User" (name, email, password, "createdAt", "updatedAt")
        VALUES (${name}, ${email}, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (email)
        DO UPDATE SET name = EXCLUDED.name, "updatedAt" = CURRENT_TIMESTAMP
        RETURNING id, name, email
      `;
      const user = users[0];
      const entries = await loadEntries(user.id);

      return NextResponse.json({ user, entries: serializeEntries(entries) }, { status: 200 });
    }

    const userId = readNumber(body.userId, 1, Number.MAX_SAFE_INTEGER);
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
