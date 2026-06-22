import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { ChallengeEntry, ChallengeUser } from "../shared";
import type { EntryRow, SaveEntryInput, UserRow } from "./types";

export function serializeEntries(entries: EntryRow[]): ChallengeEntry[] {
  return entries.map((entry) => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }));
}

export function serializeUser(user: UserRow): ChallengeUser {
  return { id: user.id, name: user.name, email: user.email };
}

export async function loadEntries(userId: number) {
  return prisma.$queryRaw<EntryRow[]>`
    SELECT id, day, "screenMinutes", "targetMinutes", goal, note, "createdAt", "updatedAt"
    FROM "ChallengeEntry"
    WHERE "userId" = ${userId}
    ORDER BY day ASC
  `;
}

export async function loadUser(userId: number) {
  const users = await prisma.$queryRaw<UserRow[]>`
    SELECT id, name, email, password
    FROM "User"
    WHERE id = ${userId}
    LIMIT 1
  `;

  return users[0] ?? null;
}

export async function findUserByEmail(email: string) {
  const users = await prisma.$queryRaw<UserRow[]>`
    SELECT id, name, email, password
    FROM "User"
    WHERE email = ${email}
    LIMIT 1
  `;

  return users[0] ?? null;
}

export async function createUser(name: string, email: string, password: string) {
  const hashedPassword = hashPassword(password);
  const users = await prisma.$queryRaw<UserRow[]>`
    INSERT INTO "User" (name, email, password, "createdAt", "updatedAt")
    VALUES (${name}, ${email}, ${hashedPassword}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id, name, email, password
  `;

  return users[0];
}

export async function updateExistingUser(user: UserRow, name: string, password: string) {
  const nextPassword = user.password || hashPassword(password);
  const nextName = name || user.name;
  const users = await prisma.$queryRaw<UserRow[]>`
    UPDATE "User"
    SET name = ${nextName}, password = ${nextPassword}, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ${user.id}
    RETURNING id, name, email, password
  `;

  return users[0];
}

export function isValidPassword(user: UserRow, password: string) {
  return !user.password || verifyPassword(password, user.password);
}

export async function upsertEntry(input: SaveEntryInput) {
  await prisma.$executeRaw`
    INSERT INTO "ChallengeEntry" ("userId", day, "screenMinutes", "targetMinutes", goal, note, "createdAt", "updatedAt")
    VALUES (${input.userId}, ${input.day}, ${input.screenMinutes}, ${input.targetMinutes}, ${input.goal}, ${input.note || null}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT ("userId", day)
    DO UPDATE SET
      "screenMinutes" = EXCLUDED."screenMinutes",
      "targetMinutes" = EXCLUDED."targetMinutes",
      goal = EXCLUDED.goal,
      note = EXCLUDED.note,
      "updatedAt" = CURRENT_TIMESTAMP
  `;
}
