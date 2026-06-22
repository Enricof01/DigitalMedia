export type ChallengeUser = {
  id: number;
  name: string;
  email: string;
};

export type ChallengeEntry = {
  id: number;
  day: number;
  screenMinutes: number;
  targetMinutes: number;
  goal: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export const GOALS = ["60 Minuten", "Training", "Buch lesen", "Mehr Fokus"];
export const DAY_COUNT = 7;

export function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest} Min`;
  if (rest === 0) return `${hours}h`;

  return `${hours}h ${rest}m`;
}

export function getReward(goal: string, savedMinutes: number) {
  if (savedMinutes < 15) {
    return "Trage mehrere Tage ein. Dann sieht man, wie viel Zeit wirklich frei wird.";
  }

  if (goal === "Training") {
    const workouts = Math.max(1, Math.floor(savedMinutes / 45));
    return `${formatMinutes(savedMinutes)} reichen für ${workouts} kurze Workouts. Genau daraus entsteht sichtbarer Fortschritt.`;
  }

  if (goal === "Buch lesen") {
    const pages = Math.max(1, Math.floor(savedMinutes / 2));
    const bookHint = pages >= 150 ? " Das ist schon etwa ein halbes Buch." : "";
    return `${formatMinutes(savedMinutes)} reichen für ca. ${pages} Seiten Lesen.${bookHint}`;
  }

  if (goal === "Mehr Fokus") {
    const focusBlocks = Math.max(1, Math.floor(savedMinutes / 25));
    return `${formatMinutes(savedMinutes)} ergeben ${focusBlocks} konzentrierte Fokus-Blöcke ohne Feed.`;
  }

  const freeHours = Math.max(1, Math.floor(savedMinutes / 60));
  return `${formatMinutes(savedMinutes)} zurückgeholt. Das sind ${freeHours} freie Stunden für etwas, das du wirklich willst.`;
}

export function getTip(
  latest: ChallengeEntry | null,
  previous: ChallengeEntry | null,
  targetMinutes: number,
) {
  if (!latest) return "Starte mit Tag 1. Danach baut sich deine persönliche Grafik automatisch auf.";
  if (latest.screenMinutes <= targetMinutes) return "Stark: Du liegst unter deinem Tagesziel. Morgen denselben Zeitraum handyfrei blocken.";
  if (previous && latest.screenMinutes > previous.screenMinutes) return "Heute ist die Zeit gestiegen. Morgen den kritischsten Moment vorplanen: Handy weglegen, bevor der Reflex kommt.";

  return "Du bist auf Kurs. Reduziere morgen nur einen konkreten Auslöser: Benachrichtigungen, Bett oder Pausen-Scroll.";
}

export function getNextOpenDay(entries: ChallengeEntry[]) {
  return Array.from({ length: DAY_COUNT }, (_, index) => index + 1)
    .find((day) => !entries.some((entry) => entry.day === day)) ?? DAY_COUNT;
}
