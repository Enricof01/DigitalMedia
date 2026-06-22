export const MAX_SCREEN_MINUTES = 16 * 60;
export const MAX_TARGET_MINUTES = 12 * 60;

export function readText(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 120) : fallback;
}

export function readEmail(value: unknown) {
  const email = readText(value).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export function readPassword(value: unknown) {
  if (typeof value !== "string") return null;

  const password = value.trim();
  return password.length >= 6 ? password : null;
}

export function readNumber(value: unknown, min: number, max: number) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return null;

  return Math.max(min, Math.min(max, Math.round(numberValue)));
}
