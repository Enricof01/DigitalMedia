"use client";

import { useMemo, useState, type FormEvent } from "react";

type SaveState = "idle" | "saving" | "saved" | "error";
type LoginState = "idle" | "loading" | "ready" | "error";
type AuthMode = "login" | "register";

type ChallengeUser = {
  id: number;
  name: string;
  email: string;
};

type ChallengeEntry = {
  id: number;
  day: number;
  screenMinutes: number;
  targetMinutes: number;
  goal: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

const GOALS = ["60 Minuten", "Training", "Buch lesen", "Mehr Fokus"];
const DAY_COUNT = 7;

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest} Min`;
  if (rest === 0) return `${hours}h`;

  return `${hours}h ${rest}m`;
}

function getReward(goal: string, savedMinutes: number) {
  if (savedMinutes < 15) {
    return "Trage mehrere Tage ein. Dann sieht man, wie viel Zeit wirklich frei wird.";
  }

  if (goal === "Training") {
    const workouts = Math.max(1, Math.floor(savedMinutes / 45));
    return `${formatMinutes(savedMinutes)} reichen fuer ${workouts} kurze Workouts. Genau daraus entsteht sichtbarer Fortschritt.`;
  }

  if (goal === "Buch lesen") {
    const pages = Math.max(1, Math.floor(savedMinutes / 2));
    const bookHint = pages >= 150 ? " Das ist schon etwa ein halbes Buch." : "";
    return `${formatMinutes(savedMinutes)} reichen fuer ca. ${pages} Seiten Lesen.${bookHint}`;
  }

  if (goal === "Mehr Fokus") {
    const focusBlocks = Math.max(1, Math.floor(savedMinutes / 25));
    return `${formatMinutes(savedMinutes)} ergeben ${focusBlocks} konzentrierte Fokus-Bloecke ohne Feed.`;
  }

  const freeHours = Math.max(1, Math.floor(savedMinutes / 60));
  return `${formatMinutes(savedMinutes)} zurueckgeholt. Das sind ${freeHours} freie Stunden fuer etwas, das du wirklich willst.`;
}

function getTip(latest: ChallengeEntry | null, previous: ChallengeEntry | null, targetMinutes: number) {
  if (!latest) return "Starte mit Tag 1. Danach baut sich deine persoenliche Grafik automatisch auf.";
  if (latest.screenMinutes <= targetMinutes) return "Stark: Du liegst unter deinem Tagesziel. Morgen denselben Zeitraum handyfrei blocken.";
  if (previous && latest.screenMinutes > previous.screenMinutes) return "Heute ist die Zeit gestiegen. Morgen den kritischsten Moment vorplanen: Handy weglegen, bevor der Reflex kommt.";

  return "Du bist auf Kurs. Reduziere morgen nur einen konkreten Ausloeser: Benachrichtigungen, Bett oder Pausen-Scroll.";
}

function getNextOpenDay(entries: ChallengeEntry[]) {
  return Array.from({ length: DAY_COUNT }, (_, index) => index + 1)
    .find((day) => !entries.some((entry) => entry.day === day)) ?? DAY_COUNT;
}

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
  const [message, setMessage] = useState("");

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

  return (
    <section className="embedded-survey" id="survey">
      <div className="embedded-survey-inner">
        <div className="survey-copy">
          <div className="survey-kicker">7 Tage Challenge</div>
          <h2>Login für deinen Selbsttest.</h2>
          <p>
            Melde dich an, trage sieben Tage lang deine Bildschirmzeit ein und sieh,
            wie viel Zeit du gegenüber Tag 1 zurueckholst.
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
                  <form className="challenge-form" onSubmit={onLogin}>
                    <header className="survey-form-head">
                      <div>
                        <span>{authMode === "login" ? "Einloggen" : "Neu erstellen"}</span>
                        <h3>{authMode === "login" ? "Account Login" : "Challenge starten"}</h3>
                      </div>
                      <strong>7</strong>
                    </header>

                    <div className="auth-mode-switch" aria-label="Login Modus">
                      <button
                        type="button"
                        className={authMode === "login" ? "active" : ""}
                        onClick={() => {
                          setAuthMode("login");
                          setMessage("");
                        }}
                      >
                        Einloggen
                      </button>
                      <button
                        type="button"
                        className={authMode === "register" ? "active" : ""}
                        onClick={() => {
                          setAuthMode("register");
                          setMessage("");
                        }}
                      >
                        Neu erstellen
                      </button>
                    </div>

                    {authMode === "register" && (
                      <label className="challenge-text-field">
                        <span>Name</span>
                        <input
                          type="text"
                          value={loginName}
                          onChange={(event) => setLoginName(event.target.value)}
                          placeholder="Dein Name"
                          required
                        />
                      </label>
                    )}

                    <label className="challenge-text-field">
                      <span>E-Mail</span>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                        placeholder="name@mail.de"
                        required
                      />
                    </label>

                    <label className="challenge-text-field">
                      <span>Passwort</span>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                        placeholder="Mindestens 6 Zeichen"
                        minLength={6}
                        required
                      />
                    </label>

                    <p className="challenge-login-note">Dein Passwort wird nur als Hash in der Datenbank gespeichert.</p>

                    <fieldset className="survey-group">
                      <legend>Was willst du mit der Zeit machen?</legend>
                      <div className="survey-options two">
                        {GOALS.map((item) => (
                          <button
                            key={item}
                            type="button"
                            className={goal === item ? "active" : ""}
                            onClick={() => setGoal(item)}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    {loginState === "error" && <p className="survey-error">{message}</p>}

                    <button className="survey-submit" type="submit" disabled={loginState === "loading"}>
                      {loginState === "loading" ? "Prüft..." : authMode === "login" ? "Einloggen" : "Account erstellen"}
                    </button>
                  </form>
                ) : (
                  <form className="challenge-form" onSubmit={onSaveDay}>
                    <header className="survey-form-head">
                      <div>
                        <span>{user.name}</span>
                        <h3>Tag {activeDay}</h3>
                      </div>
                      <strong>{progressText}</strong>
                    </header>

                    <div className="challenge-days" aria-label="Challenge Tage">
                      {Array.from({ length: DAY_COUNT }, (_, index) => {
                        const day = index + 1;
                        const done = entriesByDay.has(day);

                        return (
                          <button
                            key={day}
                            type="button"
                            className={`${activeDay === day ? "active" : ""}${done ? " done" : ""}`}
                            onClick={() => syncDayForm(day)}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>

                    <label className="survey-field">
                      <span>
                        Bildschirmzeit heute <strong>{formatMinutes(screenMinutes)}</strong>
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="960"
                        step="15"
                        value={screenMinutes}
                        onChange={(event) => setScreenMinutes(Number(event.target.value))}
                      />
                    </label>

                    <label className="survey-field">
                      <span>
                        Tagesziel <strong>{formatMinutes(targetMinutes)}</strong>
                      </span>
                      <input
                        type="range"
                        min="15"
                        max="720"
                        step="15"
                        value={targetMinutes}
                        onChange={(event) => setTargetMinutes(Number(event.target.value))}
                      />
                    </label>

                    <fieldset className="survey-group">
                      <legend>Wunsch fuer die freie Zeit</legend>
                      <div className="survey-options two">
                        {GOALS.map((item) => (
                          <button
                            key={item}
                            type="button"
                            className={goal === item ? "active" : ""}
                            onClick={() => setGoal(item)}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <label className="challenge-note">
                      <span>Kurznotiz</span>
                      <textarea
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Was hat heute geholfen?"
                        rows={2}
                      />
                    </label>

                    {message && <p className={saveState === "error" ? "survey-error" : "survey-success"}>{message}</p>}

                    <button className="survey-submit" type="submit" disabled={saveState === "saving"}>
                      {saveState === "saving" ? "Speichert..." : `Tag ${activeDay} speichern`}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          <aside className="challenge-dashboard" aria-label="Personalisierte Challenge Grafik">
            <div className="dashboard-head">
              <span>Deine Grafik</span>
              <strong>{savedMinutes > 0 ? formatMinutes(savedMinutes) : "0 Min"}</strong>
              <small>gegenüber Tag 1 gespart</small>
            </div>

            <div className="challenge-chart">
              {Array.from({ length: DAY_COUNT }, (_, index) => {
                const day = index + 1;
                const entry = entriesByDay.get(day);
                const height = entry ? Math.max(8, Math.round((entry.screenMinutes / chartMax) * 100)) : 8;
                const isLower = entry ? entry.screenMinutes <= targetMinutes : false;

                return (
                  <div className="chart-day" key={day}>
                    <div className="chart-track">
                      <span
                        className={entry ? (isLower ? "is-good" : "is-high") : ""}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <small>{day}</small>
                  </div>
                );
              })}
            </div>

            <div className="challenge-stats">
              <div>
                <strong>{averageMinutes ? formatMinutes(averageMinutes) : "--"}</strong>
                <span>Durchschnitt</span>
              </div>
              <div>
                <strong>{improvementPercent}%</strong>
                <span>weniger als Tag 1</span>
              </div>
            </div>

            <div className="challenge-reward">
              <span>Anreiz</span>
              <p>{rewardText}</p>
            </div>

            <div className="challenge-tip">
              <span>Naechster Schritt</span>
              <p>{tipText}</p>
            </div>
          </aside>
        </div>
      </div>

      <style jsx global>{`
        .embedded-survey{padding:6rem 2rem;background:radial-gradient(circle at 20% 18%,rgba(212,245,71,.18),transparent 30%),linear-gradient(135deg,#eef3dd 0%,#dfe8c7 48%,#cbd9ad 100%);color:#10140d;border-top:1px solid rgba(16,20,13,.14);scroll-margin-top:0;}
        .embedded-survey-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:minmax(280px,430px) minmax(640px,1fr);align-items:center;gap:clamp(28px,5vw,72px);}
        .survey-kicker{font-size:17px;letter-spacing:.22em;text-transform:uppercase;color:#516039;margin-bottom:18px;font-weight:900;}
        .survey-copy h2{font-family:'Bebas Neue',Impact,sans-serif;font-size:clamp(4.2rem,8vw,7.8rem);line-height:.88;letter-spacing:0;color:#11150d;margin-bottom:22px;}
        .survey-copy p{font-size:1.08rem;line-height:1.75;color:#536048;max-width:460px;}
        .challenge-proof{display:inline-flex;flex-direction:column;gap:2px;margin-top:28px;padding:16px 20px;border:2px solid rgba(16,20,13,.16);background:rgba(255,255,255,.28);box-shadow:0 18px 38px rgba(16,20,13,.08);}
        .challenge-proof span{font-family:'Bebas Neue',sans-serif;font-size:3rem;line-height:.9;color:#10140d;}
        .challenge-proof strong{font-size:.78rem;letter-spacing:.16em;text-transform:uppercase;color:#516039;}
        .challenge-panel{display:grid;grid-template-columns:390px minmax(260px,1fr);gap:28px;align-items:center;}
        .challenge-phone-wrap{position:relative;display:flex;align-items:center;justify-content:center;min-height:760px;perspective:1500px;}
        .survey-phone-shadow{position:absolute;width:min(430px,82vw);height:160px;border-radius:50%;background:radial-gradient(ellipse at center,rgba(70,82,46,.32),rgba(45,52,34,.18) 46%,transparent 72%);filter:blur(20px);transform:translateY(305px) rotateX(62deg);}
        .survey-phone{position:relative;width:360px;height:740px;border-radius:46px;background:linear-gradient(115deg,#303626,#151a10 22%,#080a06 60%,#293020);border:2px solid rgba(255,255,255,.28);box-shadow:-22px 32px 52px rgba(73,83,51,.28),30px 52px 110px rgba(38,46,28,.38),inset 14px 0 22px rgba(255,255,255,.07),inset -18px 0 30px rgba(0,0,0,.58);overflow:hidden;transform:rotateX(4deg) rotateY(-7deg) translateZ(32px);transform-style:preserve-3d;}
        .survey-phone::before{content:"";position:absolute;inset:0;border-radius:inherit;z-index:4;pointer-events:none;background:linear-gradient(90deg,rgba(255,255,255,.26),transparent 11%,transparent 84%,rgba(255,255,255,.16)),linear-gradient(180deg,rgba(255,255,255,.16),transparent 16%,transparent 80%,rgba(0,0,0,.38));mix-blend-mode:screen;opacity:.52;}
        .survey-phone-glare{position:absolute;inset:2px;z-index:3;border-radius:inherit;pointer-events:none;background:radial-gradient(circle at 28% 18%,rgba(255,255,255,.3),rgba(212,245,71,.12) 18%,transparent 44%);mix-blend-mode:screen;}
        .survey-island{position:absolute;top:14px;left:50%;z-index:8;width:94px;height:28px;border-radius:999px;background:#080a06;transform:translateX(-50%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);}
        .survey-screen{position:absolute;inset:0;padding:58px 20px 22px;background:#202619;color:#f7f2e8;overflow:hidden;border-radius:inherit;}
        .challenge-form{height:100%;display:flex;flex-direction:column;overflow-y:auto;padding-bottom:18px;scrollbar-width:none;}
        .challenge-form::-webkit-scrollbar{display:none;}
        .survey-form-head{display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,.1);margin-bottom:14px;}
        .survey-form-head span{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#b8b09c;}
        .survey-form-head h3{font-family:'DM Serif Display',serif;font-size:1.55rem;line-height:1.1;font-weight:400;margin-top:3px;}
        .survey-form-head strong{font-family:'Bebas Neue',sans-serif;color:#d4f547;font-size:3rem;line-height:.85;font-weight:400;}
        .auth-mode-switch{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:15px;padding:4px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(8,10,6,.28);}
        .auth-mode-switch button{border:0;border-radius:10px;background:transparent;color:#b8b09c;padding:10px 8px;font:inherit;font-size:.74rem;font-weight:900;letter-spacing:.04em;cursor:pointer;transition:background .16s ease,color .16s ease,transform .16s ease;}
        .auth-mode-switch button:hover,.auth-mode-switch button.active{background:#d4f547;color:#10140d;transform:translateY(-1px);}
        .challenge-text-field,.survey-field,.challenge-note{display:block;margin-bottom:15px;}
        .challenge-text-field span,.challenge-note span,.survey-field span{display:flex;justify-content:space-between;gap:12px;font-size:.82rem;color:#d8d3c3;margin-bottom:8px;}
        .survey-field strong{color:#d4f547;font-weight:700;}
        .challenge-text-field input,.challenge-note textarea{width:100%;border:1px solid rgba(255,255,255,.12);border-radius:11px;background:#343c29;color:#f7f2e8;padding:12px 13px;font:inherit;font-size:.82rem;outline:none;}
        .challenge-text-field input:focus,.challenge-note textarea:focus{border-color:#d4f547;box-shadow:0 0 0 4px rgba(212,245,71,.1);}
        .challenge-note textarea{resize:none;line-height:1.35;}
        .challenge-login-note{margin:-2px 0 13px;color:#b8b09c;font-size:.72rem;line-height:1.4;}
        .survey-field input{width:100%;height:4px;-webkit-appearance:none;appearance:none;background:rgba(255,255,255,.16);border-radius:99px;outline:none;}
        .survey-field input::-webkit-slider-thumb{-webkit-appearance:none;width:19px;height:19px;border-radius:50%;background:#d4f547;box-shadow:0 0 0 5px rgba(212,245,71,.14);cursor:pointer;}
        .survey-group{border:0;margin:0 0 14px;}
        .survey-group legend{font-size:.75rem;color:#b8b09c;margin-bottom:8px;}
        .survey-options{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}
        .survey-options.two{grid-template-columns:repeat(2,1fr);}
        .survey-options button,.challenge-days button{border:1px solid transparent;background:#343c29;color:#f7f2e8;border-radius:9px;padding:9px 7px;font:inherit;font-size:.72rem;cursor:pointer;transition:background .16s ease,border-color .16s ease,color .16s ease,transform .16s ease;}
        .survey-options button:hover,.survey-options button.active,.challenge-days button:hover,.challenge-days button.active{background:#3f4931;border-color:#d4f547;color:#d4f547;transform:translateY(-1px);}
        .challenge-days{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-bottom:15px;}
        .challenge-days button{min-height:34px;padding:0;font-weight:800;}
        .challenge-days button.done{background:#d4f547;color:#10140d;border-color:#d4f547;}
        .challenge-days button.done.active{box-shadow:0 0 0 3px rgba(212,245,71,.16);}
        .survey-submit{width:100%;border:0;border-radius:999px;background:#d4f547;color:#10140d;padding:14px 16px;font:inherit;font-weight:800;text-align:center;text-decoration:none;cursor:pointer;box-shadow:0 16px 38px rgba(212,245,71,.22);margin-top:14px;}
        .survey-submit:disabled{opacity:.68;cursor:wait;}
        .survey-error,.survey-success{font-size:.75rem;line-height:1.4;margin-bottom:10px;}
        .survey-error{color:#ffd2d2;}
        .survey-success{color:#d4f547;}
        .challenge-dashboard{align-self:stretch;min-height:620px;border:1px solid rgba(16,20,13,.14);background:linear-gradient(180deg,rgba(255,255,255,.46),rgba(255,255,255,.18));box-shadow:0 26px 70px rgba(61,72,42,.16);padding:26px;display:flex;flex-direction:column;gap:20px;}
        .dashboard-head span,.challenge-reward span,.challenge-tip span{display:block;font-size:.78rem;letter-spacing:.18em;text-transform:uppercase;color:#5b6845;font-weight:900;margin-bottom:8px;}
        .dashboard-head strong{display:block;font-family:'Bebas Neue',sans-serif;font-size:5rem;line-height:.85;color:#10140d;font-weight:400;}
        .dashboard-head small{font-size:1rem;color:#536048;}
        .challenge-chart{height:190px;display:grid;grid-template-columns:repeat(7,1fr);gap:10px;align-items:end;padding:18px;border:1px solid rgba(16,20,13,.12);background:rgba(255,255,255,.28);}
        .chart-day{height:100%;display:flex;flex-direction:column;align-items:center;gap:8px;}
        .chart-track{width:100%;height:100%;display:flex;align-items:flex-end;background:rgba(16,20,13,.1);border-radius:999px;overflow:hidden;}
        .chart-track span{display:block;width:100%;min-height:8%;border-radius:999px 999px 0 0;background:rgba(16,20,13,.22);transition:height .25s ease,background .2s ease;}
        .chart-track span.is-good{background:#d4f547;}
        .chart-track span.is-high{background:#6f7a55;}
        .chart-day small{font-weight:900;color:#516039;}
        .challenge-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
        .challenge-stats div{background:#202619;color:#f7f2e8;padding:18px;border-radius:10px;}
        .challenge-stats strong{display:block;font-family:'Bebas Neue',sans-serif;font-size:3.4rem;line-height:.88;color:#d4f547;font-weight:400;}
        .challenge-stats span{display:block;color:#d8d3c3;font-size:.85rem;margin-top:5px;}
        .challenge-reward,.challenge-tip{padding:18px;border:1px solid rgba(16,20,13,.13);background:rgba(255,255,255,.3);}
        .challenge-reward p,.challenge-tip p{margin:0;color:#435035;line-height:1.55;font-size:.98rem;}
        @media (max-width:1100px){
          .embedded-survey-inner{grid-template-columns:1fr;}
          .challenge-panel{grid-template-columns:1fr;}
          .challenge-dashboard{min-height:auto;}
        }
        @media (max-width:860px){
          .embedded-survey{padding:4rem 1.1rem;}
          .survey-copy h2{font-size:4rem;}
          .challenge-phone-wrap{min-height:700px;}
          .survey-phone{width:min(350px,92vw);height:700px;transform:none;}
          .challenge-dashboard{padding:18px;}
          .dashboard-head strong{font-size:4rem;}
          .challenge-stats{grid-template-columns:1fr;}
        }
      `}</style>
    </section>
  );
}
