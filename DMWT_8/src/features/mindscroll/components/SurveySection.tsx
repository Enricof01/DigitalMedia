"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  DAY_COUNT,
  GOALS,
  getNextOpenDay,
  getReward,
  getTip,
  type ChallengeEntry,
  type ChallengeUser,
} from "../challenge/shared";
import AuthForm from "./challenge/AuthForm";
import ChallengeDashboard from "./challenge/ChallengeDashboard";
import DailyEntryForm from "./challenge/DailyEntryForm";
import SurveySectionStyles from "./SurveySectionStyles";
import type { AuthMode, LoginState, ReportState, SaveState } from "./challenge/types";

export default function SurveySection() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [loginName, setLoginName] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [goal, setGoal] = useState(GOALS[0]);
  const [targetMinutes, setTargetMinutes] = useState(120);
  const [screenMinutes, setScreenMinutes] = useState(180);
  const [note, setNote] = useState("");
  const [activeDay, setActiveDay] = useState(1);
  const [user, setUser] = useState<ChallengeUser | null>(null);
  const [entries, setEntries] = useState<ChallengeEntry[]>([]);
  const [loginState, setLoginState] = useState<LoginState>("idle");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [reportState, setReportState] = useState<ReportState>("idle");
  const [message, setMessage] = useState("");
  const [reportMessage, setReportMessage] = useState("");

  const entriesByDay = useMemo(() => {
    const map = new Map<number, ChallengeEntry>();
    entries.forEach((entry) => map.set(entry.day, entry));
    return map;
  }, [entries]);

  const orderedEntries = useMemo(
    () => [...entries].sort((a, b) => a.day - b.day),
    [entries],
  );

  const latestEntry = orderedEntries[orderedEntries.length - 1] ?? null;
  const previousEntry = orderedEntries[orderedEntries.length - 2] ?? null;
  const baselineMinutes = orderedEntries[0]?.screenMinutes ?? screenMinutes;
  const savedMinutes = orderedEntries.reduce((sum, entry, index) => {
    if (index === 0) return sum;
    return sum + Math.max(0, baselineMinutes - entry.screenMinutes);
  }, 0);
  const averageMinutes = orderedEntries.length > 0
    ? Math.round(orderedEntries.reduce((sum, entry) => sum + entry.screenMinutes, 0) / orderedEntries.length)
    : 0;
  const improvementPercent = latestEntry && baselineMinutes > 0
    ? Math.max(0, Math.round(((baselineMinutes - latestEntry.screenMinutes) / baselineMinutes) * 100))
    : 0;
  const chartMax = Math.max(240, baselineMinutes, ...orderedEntries.map((entry) => entry.screenMinutes));
  const rewardText = getReward(goal, savedMinutes);
  const tipText = getTip(latestEntry, previousEntry, targetMinutes);
  const progressText = `${entries.length}/${DAY_COUNT}`;

  function syncDayForm(day: number, nextEntries = entries) {
    const entry = nextEntries.find((item) => item.day === day);
    setActiveDay(day);

    if (entry) {
      setScreenMinutes(entry.screenMinutes);
      setTargetMinutes(entry.targetMinutes);
      setGoal(entry.goal);
      setNote(entry.note ?? "");
    } else {
      const lastEntry = [...nextEntries].sort((a, b) => a.day - b.day).at(-1);
      setScreenMinutes(lastEntry?.screenMinutes ?? 180);
      setNote("");
    }
  }

  async function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: authMode,
          name: loginName,
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Login failed");

      const loadedEntries = (data.entries ?? []) as ChallengeEntry[];
      setUser(data.user as ChallengeUser);
      setEntries(loadedEntries);
      setLoginState("ready");
      setLoginPassword("");
      syncDayForm(getNextOpenDay(loadedEntries), loadedEntries);
    } catch (error) {
      setLoginState("error");
      setMessage(error instanceof Error ? error.message : "Anmeldung fehlgeschlagen.");
    }
  }

  async function onSaveDay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setSaveState("saving");
    setMessage("");

    try {
      const response = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          day: activeDay,
          screenMinutes,
          targetMinutes,
          goal,
          note,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Save failed");

      const nextEntries = (data.entries ?? []) as ChallengeEntry[];
      setEntries(nextEntries);
      setSaveState("saved");
      setMessage(`Tag ${activeDay} gespeichert.`);

      syncDayForm(getNextOpenDay(nextEntries), nextEntries);
    } catch (error) {
      setSaveState("error");
      setMessage(error instanceof Error ? error.message : "Speichern fehlgeschlagen.");
    }
  }

  async function onLogout() {
    try {
      await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } finally {
      setUser(null);
      setEntries([]);
      setActiveDay(1);
      setScreenMinutes(180);
      setTargetMinutes(120);
      setGoal(GOALS[0]);
      setNote("");
      setSaveState("idle");
      setReportState("idle");
      setLoginState("idle");
      setMessage("");
      setReportMessage("");
    }
  }

  async function onSendWeeklyReport() {
    if (!user) {
      setReportState("error");
      setReportMessage("Bitte erst einloggen.");
      return;
    }

    if (entries.length === 0) {
      setReportState("error");
      setReportMessage("Speichere zuerst mindestens einen Challenge-Tag.");
      return;
    }

    setReportState("sending");
    setReportMessage("");

    try {
      const response = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sendWeeklyReport",
          userId: user.id,
        }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error ?? "Mailversand fehlgeschlagen.");

      setReportState("sent");
      setReportMessage(data.message ?? "Wochenbericht wurde per E-Mail verschickt.");
    } catch (error) {
      setReportState("error");
      setReportMessage(error instanceof Error ? error.message : "Mailversand fehlgeschlagen.");
    }
  }

  return (
    <section className="embedded-survey" id="survey">
      <div className="embedded-survey-inner">
        <div className="survey-copy">
          <div className="survey-kicker">7 Tage Challenge</div>
          <h2>Login für deinen Selbsttest.</h2>
          <p>
            Melde dich an, trage sieben Tage lang deine Bildschirmzeit ein und sieh,
            wie viel Zeit du gegenüber Tag 1 zurückholst.
          </p>
          <div className="challenge-proof">
            <span>{progressText}</span>
            <strong>Tage gespeichert</strong>
          </div>
        </div>

        <div className="challenge-panel">
          <div className="challenge-phone-wrap">
            <div className="survey-phone-shadow" />
            <div className="survey-phone">
              <div className="survey-phone-glare" />
              <div className="survey-island" />
              <div className="survey-screen">
                {!user ? (
                  <AuthForm
                    authMode={authMode}
                    goal={goal}
                    loginEmail={loginEmail}
                    loginName={loginName}
                    loginPassword={loginPassword}
                    loginState={loginState}
                    message={message}
                    onAuthModeChange={(mode) => {
                      setAuthMode(mode);
                      setMessage("");
                    }}
                    onEmailChange={setLoginEmail}
                    onGoalChange={setGoal}
                    onNameChange={setLoginName}
                    onPasswordChange={setLoginPassword}
                    onSubmit={onLogin}
                  />
                ) : (
                  <DailyEntryForm
                    activeDay={activeDay}
                    entriesByDay={entriesByDay}
                    goal={goal}
                    message={message}
                    note={note}
                    progressText={progressText}
                    saveState={saveState}
                    screenMinutes={screenMinutes}
                    targetMinutes={targetMinutes}
                    user={user}
                    onDaySelect={syncDayForm}
                    onGoalChange={setGoal}
                    onLogout={onLogout}
                    onNoteChange={setNote}
                    onScreenMinutesChange={setScreenMinutes}
                    onSubmit={onSaveDay}
                    onTargetMinutesChange={setTargetMinutes}
                  />
                )}
              </div>
            </div>
          </div>

          <ChallengeDashboard
            averageMinutes={averageMinutes}
            chartMax={chartMax}
            entriesByDay={entriesByDay}
            entriesCount={entries.length}
            improvementPercent={improvementPercent}
            reportMessage={reportMessage}
            reportState={reportState}
            rewardText={rewardText}
            savedMinutes={savedMinutes}
            targetMinutes={targetMinutes}
            tipText={tipText}
            user={user}
            onSendWeeklyReport={onSendWeeklyReport}
          />
        </div>
      </div>

      <SurveySectionStyles />
    </section>
  );
}
