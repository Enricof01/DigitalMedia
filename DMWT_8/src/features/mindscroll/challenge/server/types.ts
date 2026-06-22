export type ChallengePayload = {
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

export type UserRow = {
  id: number;
  name: string;
  email: string;
  password: string;
};

export type EntryRow = {
  id: number;
  day: number;
  screenMinutes: number;
  targetMinutes: number;
  goal: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ReportData = {
  subject: string;
  text: string;
  html: string;
};

export type SaveEntryInput = {
  userId: number;
  day: number;
  screenMinutes: number;
  targetMinutes: number;
  goal: string;
  note: string;
};
