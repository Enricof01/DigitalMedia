export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp(t, 0, 1);

export const phase = (p: number, start: number, end: number) => clamp((p - start) / (end - start), 0, 1);
