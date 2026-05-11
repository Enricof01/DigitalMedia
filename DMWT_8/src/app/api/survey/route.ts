import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SurveyPayload = {
  dailyMinutes?: unknown;
  pickups?: unknown;
  mainApp?: unknown;
  hardestMoment?: unknown;
  goal?: unknown;
};

const MAX_DAILY_MINUTES = 720;
const MAX_PICKUPS = 250;

function readNumber(value: unknown, min: number, max: number) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return null;

  return Math.max(min, Math.min(max, Math.round(numberValue)));
}

function readText(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 80) : fallback;
}

function getScore(dailyMinutes: number, pickups: number) {
  const minutesScore = (dailyMinutes / MAX_DAILY_MINUTES) * 62;
  const pickupScore = (pickups / MAX_PICKUPS) * 38;

  return Math.max(1, Math.min(100, Math.round(minutesScore + pickupScore)));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SurveyPayload;
    const dailyMinutes = readNumber(body.dailyMinutes, 15, MAX_DAILY_MINUTES);
    const pickups = readNumber(body.pickups, 1, MAX_PICKUPS);

    if (dailyMinutes === null || pickups === null) {
      return NextResponse.json(
        { error: "Bitte Nutzungsdauer und Check-ins angeben." },
        { status: 400 },
      );
    }

    const mainApp = readText(body.mainApp, "Social Media");
    const hardestMoment = readText(body.hardestMoment, "Abends");
    const goal = readText(body.goal, "60 Minuten zurückholen");
    const score = getScore(dailyMinutes, pickups);

    const response = await prisma.surveyResponse.create({
      data: {
        dailyMinutes,
        pickups,
        mainApp,
        hardestMoment,
        goal,
        score,
      },
      select: {
        id: true,
        score: true,
        createdAt: true,
      },
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Failed to save survey response", error);

    return NextResponse.json(
      { error: "Die Umfrage konnte nicht gespeichert werden." },
      { status: 500 },
    );
  }
}
