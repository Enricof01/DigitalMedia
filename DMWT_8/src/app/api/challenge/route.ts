import { NextResponse } from "next/server";
import {
  authenticateChallengeUser,
  listEntriesForSession,
  saveChallengeEntry,
  sendWeeklyReport,
} from "@/features/mindscroll/challenge/server/challenge-service";
import { getErrorMessage, getErrorStatus } from "@/features/mindscroll/challenge/server/http-error";
import { attachSessionCookie, clearSessionCookie, readSessionUserId } from "@/features/mindscroll/challenge/server/session";
import type { ChallengePayload } from "@/features/mindscroll/challenge/server/types";
import {
  MAX_SCREEN_MINUTES,
  MAX_TARGET_MINUTES,
  readEmail,
  readNumber,
  readPassword,
  readText,
} from "@/features/mindscroll/challenge/server/validation";

function getPostFallback(action: string) {
  if (action === "login" || action === "register") return "Anmeldung fehlgeschlagen.";
  if (action === "sendWeeklyReport") return "Mailversand fehlgeschlagen.";

  return "Der Challenge-Tag konnte nicht gespeichert werden.";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionUserId = readSessionUserId(request);
    const requestedUserId = readNumber(searchParams.get("userId"), 1, Number.MAX_SAFE_INTEGER);
    const entries = await listEntriesForSession(sessionUserId, requestedUserId);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Failed to load challenge entries", error);

    return NextResponse.json(
      { error: getErrorMessage(error, "Die Challenge konnte nicht geladen werden.") },
      { status: getErrorStatus(error, 503) },
    );
  }
}

export async function POST(request: Request) {
  let action = "entry";

  try {
    const body = (await request.json()) as ChallengePayload;
    action = readText(body.action, "entry");

    if (action === "logout") {
      const response = NextResponse.json({ success: true }, { status: 200 });
      clearSessionCookie(response);

      return response;
    }

    if (action === "login" || action === "register") {
      const result = await authenticateChallengeUser(action, {
        name: readText(body.name),
        email: readEmail(body.email),
        password: readPassword(body.password),
      });
      const response = NextResponse.json(result, { status: 200 });

      attachSessionCookie(response, result.user.id);

      return response;
    }

    if (action === "sendWeeklyReport") {
      const userId = readNumber(body.userId, 1, Number.MAX_SAFE_INTEGER);
      const message = await sendWeeklyReport(readSessionUserId(request), userId);

      return NextResponse.json({ sent: true, message }, { status: 200 });
    }

    const userId = readNumber(body.userId, 1, Number.MAX_SAFE_INTEGER);
    const day = readNumber(body.day, 1, 7);
    const screenMinutes = readNumber(body.screenMinutes, 0, MAX_SCREEN_MINUTES);
    const targetMinutes = readNumber(body.targetMinutes, 15, MAX_TARGET_MINUTES);

    if (userId === null || day === null || screenMinutes === null || targetMinutes === null) {
      return NextResponse.json(
        { error: "Bitte Tag und Bildschirmzeit angeben." },
        { status: 400 },
      );
    }

    const entries = await saveChallengeEntry(readSessionUserId(request), {
      userId,
      day,
      screenMinutes,
      targetMinutes,
      goal: readText(body.goal, "60 Minuten"),
      note: readText(body.note, ""),
    });

    return NextResponse.json({ entries }, { status: 201 });
  } catch (error) {
    console.error("Failed to handle challenge request", error);

    return NextResponse.json(
      { error: getErrorMessage(error, getPostFallback(action)) },
      { status: getErrorStatus(error, action === "sendWeeklyReport" ? 503 : 500) },
    );
  }
}
