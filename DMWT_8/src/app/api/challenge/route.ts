import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createHmac, timingSafeEqual } from "node:crypto";
import nodemailer from "nodemailer";

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

type ReportData = {
  subject: string;
  text: string;
  html: string;
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

async function loadUser(userId: number) {
  const users = await prisma.$queryRaw<UserRow[]>`
    SELECT id, name, email, password
    FROM "User"
    WHERE id = ${userId}
    LIMIT 1
  `;

  return users[0] ?? null;
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest} Min`;
  if (rest === 0) return `${hours}h`;

  return `${hours}h ${rest}m`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getReportReward(goal: string, savedMinutes: number) {
  if (savedMinutes < 15) {
    return "Noch ist wenig Zeit eingespart. Der wichtigste Hebel ist jetzt Regelmaessigkeit: jeden Tag einmal bewusst eintragen.";
  }

  if (goal === "Training") {
    const workouts = Math.max(1, Math.floor(savedMinutes / 45));
    return `Deine gesparte Zeit reicht fuer ${workouts} kurze Workouts. Wenn du das beibehaeltst, wird aus weniger Scrollen sichtbar mehr Energie.`;
  }

  if (goal === "Buch lesen") {
    const pages = Math.max(1, Math.floor(savedMinutes / 2));
    return `Deine gesparte Zeit reicht fuer ungefaehr ${pages} gelesene Seiten. Ab ca. 150 Seiten bist du schon bei etwa einem halben Buch.`;
  }

  if (goal === "Mehr Fokus") {
    const focusBlocks = Math.max(1, Math.floor(savedMinutes / 25));
    return `Deine gesparte Zeit ergibt ${focusBlocks} Fokus-Bloecke. Das ist Zeit, in der kein Feed zwischen dich und deine Aufgabe kommt.`;
  }

  return `Du hast ${formatMinutes(savedMinutes)} zurueckgeholt. Das ist echte freie Zeit, nicht nur eine bessere Statistik.`;
}

function buildWeeklyReport(user: UserRow, entries: EntryRow[]): ReportData {
  const sortedEntries = [...entries].sort((a, b) => a.day - b.day);
  const firstEntry = sortedEntries[0];
  const latestEntry = sortedEntries[sortedEntries.length - 1];
  const baselineMinutes = firstEntry?.screenMinutes ?? 0;
  const latestMinutes = latestEntry?.screenMinutes ?? 0;
  const totalMinutes = sortedEntries.reduce((sum, entry) => sum + entry.screenMinutes, 0);
  const averageMinutes = sortedEntries.length > 0 ? Math.round(totalMinutes / sortedEntries.length) : 0;
  const savedMinutes = sortedEntries.reduce((sum, entry, index) => {
    if (index === 0) return sum;
    return sum + Math.max(0, baselineMinutes - entry.screenMinutes);
  }, 0);
  const improvementPercent = baselineMinutes > 0
    ? Math.max(0, Math.round(((baselineMinutes - latestMinutes) / baselineMinutes) * 100))
    : 0;
  const targetHits = sortedEntries.filter((entry) => entry.screenMinutes <= entry.targetMinutes).length;
  const goal = latestEntry?.goal ?? firstEntry?.goal ?? "60 Minuten";
  const trend = improvementPercent > 0
    ? `Deine Bildschirmzeit ist gegenueber Tag 1 um ${improvementPercent}% gesunken.`
    : "Deine Bildschirmzeit ist noch nicht gesunken. Das ist kein Scheitern, sondern ein klarer Startpunkt.";
  const recommendation = latestEntry && latestEntry.screenMinutes <= latestEntry.targetMinutes
    ? "Bleib bei dem Tagesfenster, das funktioniert hat, und schuetze es morgen wieder aktiv."
    : "Waehle morgen einen konkreten Trigger: Bett, Pause oder Benachrichtigung. Nur diesen einen Moment vorher planen.";
  const reward = getReportReward(goal, savedMinutes);
  const subject = `Dein MINDSCROLL Wochenbericht: ${formatMinutes(savedMinutes)} zurueckgeholt`;
  const text = [
    `Hi ${user.name},`,
    "",
    "hier ist dein MINDSCROLL Wochenbericht.",
    "",
    `Gespeicherte Tage: ${sortedEntries.length}/7`,
    `Durchschnittliche Bildschirmzeit: ${formatMinutes(averageMinutes)}`,
    `Ersparte Zeit gegenueber Tag 1: ${formatMinutes(savedMinutes)}`,
    `Ziel erreicht: ${targetHits} von ${sortedEntries.length} Tagen`,
    "",
    trend,
    reward,
    "",
    `Naechster Schritt: ${recommendation}`,
    "",
    "Tageswerte:",
    ...sortedEntries.map((entry) => `Tag ${entry.day}: ${formatMinutes(entry.screenMinutes)} Bildschirmzeit, Ziel ${formatMinutes(entry.targetMinutes)}, Wunsch: ${entry.goal}${entry.note ? `, Notiz: ${entry.note}` : ""}`),
    "",
    "SCROLLFREI.",
  ].join("\n");
  const rows = sortedEntries.map((entry) => (
    `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #d7dfbd;">Tag ${entry.day}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #d7dfbd;font-weight:700;">${formatMinutes(entry.screenMinutes)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #d7dfbd;">${formatMinutes(entry.targetMinutes)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #d7dfbd;">${escapeHtml(entry.goal)}</td>
    </tr>`
  )).join("");
  const html = `
    <div style="margin:0;padding:0;background:#202619;font-family:Arial,sans-serif;color:#10140d;">
      <div style="max-width:680px;margin:0 auto;background:#eef3dd;padding:32px;">
        <div style="font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#596640;font-weight:700;">MINDSCROLL Wochenbericht</div>
        <h1 style="margin:10px 0 8px;font-size:38px;line-height:1;color:#10140d;">${escapeHtml(user.name)}, du hast ${formatMinutes(savedMinutes)} zurueckgeholt.</h1>
        <p style="font-size:17px;line-height:1.6;color:#526046;margin:0 0 24px;">${escapeHtml(trend)} ${escapeHtml(reward)}</p>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0;">
          <div style="background:#202619;color:#f7f2e8;padding:18px;border-radius:10px;">
            <div style="font-size:28px;font-weight:800;color:#d4f547;">${sortedEntries.length}/7</div>
            <div style="font-size:13px;color:#d8d3c3;">Tage gespeichert</div>
          </div>
          <div style="background:#202619;color:#f7f2e8;padding:18px;border-radius:10px;">
            <div style="font-size:28px;font-weight:800;color:#d4f547;">${formatMinutes(averageMinutes)}</div>
            <div style="font-size:13px;color:#d8d3c3;">Durchschnitt</div>
          </div>
          <div style="background:#202619;color:#f7f2e8;padding:18px;border-radius:10px;">
            <div style="font-size:28px;font-weight:800;color:#d4f547;">${targetHits}</div>
            <div style="font-size:13px;color:#d8d3c3;">Zieltage erreicht</div>
          </div>
        </div>
        <h2 style="font-size:20px;margin:28px 0 12px;color:#10140d;">Deine Tageswerte</h2>
        <table style="width:100%;border-collapse:collapse;background:#f7f2e8;color:#10140d;border-radius:10px;overflow:hidden;">
          <thead>
            <tr style="background:#d4f547;text-align:left;">
              <th style="padding:10px 12px;">Tag</th>
              <th style="padding:10px 12px;">Ist</th>
              <th style="padding:10px 12px;">Ziel</th>
              <th style="padding:10px 12px;">Wunsch</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:24px;padding:18px;border:1px solid #c7d5a6;background:#dfe8c7;">
          <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#596640;font-weight:800;margin-bottom:8px;">Interpretation</div>
          <p style="margin:0;font-size:16px;line-height:1.55;color:#435035;">${escapeHtml(recommendation)}</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}

async function sendReportEmail(to: string, report: ReportData) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  const from = process.env.GMAIL_FROM_EMAIL ?? (gmailUser ? `MINDSCROLL <${gmailUser}>` : "MINDSCROLL");

  if (!gmailUser || !gmailPassword) {
    throw new Error("GMAIL_USER oder GMAIL_APP_PASSWORD fehlt.");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  });

  await transporter.sendMail({
    from,
    to,
    subject: report.subject,
    html: report.html,
    text: report.text,
  });
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

    if (action === "logout") {
      const response = NextResponse.json({ success: true }, { status: 200 });

      response.cookies.set(SESSION_COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
      });

      return response;
    }

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

    if (action === "sendWeeklyReport") {
      const userId = readNumber(body.userId, 1, Number.MAX_SAFE_INTEGER);
      const sessionUserId = readSessionUserId(request);

      if (userId === null || sessionUserId !== userId) {
        return NextResponse.json(
          { error: "Bitte zuerst mit diesem Account anmelden." },
          { status: 401 },
        );
      }

      const user = await loadUser(sessionUserId);

      if (!user) {
        return NextResponse.json(
          { error: "Account nicht gefunden." },
          { status: 404 },
        );
      }

      const entries = await loadEntries(sessionUserId);

      if (entries.length === 0) {
        return NextResponse.json(
          { error: "Speichere zuerst mindestens einen Challenge-Tag." },
          { status: 400 },
        );
      }

      try {
        const report = buildWeeklyReport(user, entries);
        await sendReportEmail(user.email, report);

        return NextResponse.json(
          { sent: true, message: `Wochenbericht wurde an ${user.email} verschickt.` },
          { status: 200 },
        );
      } catch (error) {
        console.error("Failed to send weekly report", error);

        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Mailversand fehlgeschlagen." },
          { status: 503 },
        );
      }
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
