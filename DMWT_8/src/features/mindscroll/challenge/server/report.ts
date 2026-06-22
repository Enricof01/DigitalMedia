import { formatMinutes } from "../shared";
import type { EntryRow, ReportData, UserRow } from "./types";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getReportReward(goal: string, savedMinutes: number) {
  if (savedMinutes < 15) {
    return "Noch ist wenig Zeit eingespart. Der wichtigste Hebel ist jetzt Regelmäßigkeit: jeden Tag einmal bewusst eintragen.";
  }

  if (goal === "Training") {
    const workouts = Math.max(1, Math.floor(savedMinutes / 45));
    return `Deine gesparte Zeit reicht für ${workouts} kurze Workouts. Wenn du das beibehältst, wird aus weniger Scrollen sichtbar mehr Energie.`;
  }

  if (goal === "Buch lesen") {
    const pages = Math.max(1, Math.floor(savedMinutes / 2));
    return `Deine gesparte Zeit reicht für ungefähr ${pages} gelesene Seiten. Ab ca. 150 Seiten bist du schon bei etwa einem halben Buch.`;
  }

  if (goal === "Mehr Fokus") {
    const focusBlocks = Math.max(1, Math.floor(savedMinutes / 25));
    return `Deine gesparte Zeit ergibt ${focusBlocks} Fokus-Blöcke. Das ist Zeit, in der kein Feed zwischen dich und deine Aufgabe kommt.`;
  }

  return `Du hast ${formatMinutes(savedMinutes)} zurückgeholt. Das ist echte freie Zeit, nicht nur eine bessere Statistik.`;
}

export function buildWeeklyReport(user: UserRow, entries: EntryRow[]): ReportData {
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
    ? `Deine Bildschirmzeit ist gegenüber Tag 1 um ${improvementPercent}% gesunken.`
    : "Deine Bildschirmzeit ist noch nicht gesunken. Das ist kein Scheitern, sondern ein klarer Startpunkt.";
  const recommendation = latestEntry && latestEntry.screenMinutes <= latestEntry.targetMinutes
    ? "Bleib bei dem Tagesfenster, das funktioniert hat, und schütze es morgen wieder aktiv."
    : "Wähle morgen einen konkreten Trigger: Bett, Pause oder Benachrichtigung. Nur diesen einen Moment vorher planen.";
  const reward = getReportReward(goal, savedMinutes);
  const subject = `Dein MINDSCROLL Wochenbericht: ${formatMinutes(savedMinutes)} zurückgeholt`;
  const text = [
    `Hi ${user.name},`,
    "",
    "hier ist dein MINDSCROLL Wochenbericht.",
    "",
    `Gespeicherte Tage: ${sortedEntries.length}/7`,
    `Durchschnittliche Bildschirmzeit: ${formatMinutes(averageMinutes)}`,
    `Ersparte Zeit gegenüber Tag 1: ${formatMinutes(savedMinutes)}`,
    `Ziel erreicht: ${targetHits} von ${sortedEntries.length} Tagen`,
    "",
    trend,
    reward,
    "",
    `Nächster Schritt: ${recommendation}`,
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
        <h1 style="margin:10px 0 8px;font-size:38px;line-height:1;color:#10140d;">${escapeHtml(user.name)}, du hast ${formatMinutes(savedMinutes)} zurückgeholt.</h1>
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
