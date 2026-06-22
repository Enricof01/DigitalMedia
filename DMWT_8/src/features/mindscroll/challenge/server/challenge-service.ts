import {
  createUser,
  findUserByEmail,
  isValidPassword,
  loadEntries,
  loadUser,
  serializeEntries,
  serializeUser,
  updateExistingUser,
  upsertEntry,
} from "./repository";
import { buildWeeklyReport } from "./report";
import { sendReportEmail } from "./email";
import { HttpError } from "./http-error";
import type { SaveEntryInput } from "./types";

type AuthAction = "login" | "register";

export async function listEntriesForSession(sessionUserId: number | null, requestedUserId: number | null) {
  if (sessionUserId === null) {
    throw new HttpError(401, "Bitte erst anmelden.");
  }

  if (requestedUserId !== null && requestedUserId !== sessionUserId) {
    throw new HttpError(403, "Du bist nicht für diesen Account angemeldet.");
  }

  const entries = await loadEntries(sessionUserId);
  return serializeEntries(entries);
}

export async function authenticateChallengeUser(
  action: AuthAction,
  input: { name: string; email: string | null; password: string | null },
) {
  const { name, email, password } = input;

  if (!email || !password || (action === "register" && !name)) {
    throw new HttpError(
      400,
      action === "register"
        ? "Bitte Name, gültige E-Mail und ein Passwort mit mindestens 6 Zeichen angeben."
        : "Bitte gültige E-Mail und Passwort angeben.",
    );
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    if (action === "register" && existingUser.password) {
      throw new HttpError(409, "Diesen Account gibt es schon. Bitte einloggen.");
    }

    if (!isValidPassword(existingUser, password)) {
      throw new HttpError(401, "Passwort stimmt nicht.");
    }

    const user = await updateExistingUser(existingUser, name, password);
    const entries = await loadEntries(user.id);

    return { user: serializeUser(user), entries: serializeEntries(entries) };
  }

  if (action === "login") {
    throw new HttpError(404, "Account nicht gefunden. Bitte erst neu erstellen.");
  }

  const user = await createUser(name, email, password);
  return { user: serializeUser(user), entries: [] };
}

export async function saveChallengeEntry(sessionUserId: number | null, input: SaveEntryInput) {
  if (sessionUserId !== input.userId) {
    throw new HttpError(401, "Bitte zuerst mit diesem Account anmelden.");
  }

  await upsertEntry(input);

  const entries = await loadEntries(input.userId);
  return serializeEntries(entries);
}

export async function sendWeeklyReport(sessionUserId: number | null, userId: number | null) {
  if (userId === null || sessionUserId !== userId) {
    throw new HttpError(401, "Bitte zuerst mit diesem Account anmelden.");
  }

  const user = await loadUser(sessionUserId);

  if (!user) {
    throw new HttpError(404, "Account nicht gefunden.");
  }

  const entries = await loadEntries(sessionUserId);

  if (entries.length === 0) {
    throw new HttpError(400, "Speichere zuerst mindestens einen Challenge-Tag.");
  }

  const report = buildWeeklyReport(user, entries);
  await sendReportEmail(user.email, report);

  return `Wochenbericht wurde an ${user.email} verschickt.`;
}
