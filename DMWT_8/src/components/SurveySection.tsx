"use client";

import { useMemo, useState, type FormEvent } from "react";

const MAIN_APPS = ["TikTok", "Instagram", "YouTube", "WhatsApp"];
const MOMENTS = ["Morgens", "Pausen", "Abends", "Bett"];
const GOALS = ["60 Minuten", "Mehr Fokus"];

const APP_STEPS: Record<string, string> = {
  TikTok: "TikTok heute aus dem Homescreen ziehen und erst nach der Challenge wieder oeffnen.",
  Instagram: "Instagram heute in einen Ordner auf die letzte Seite verschieben.",
  YouTube: "YouTube-Autoplay ausschalten und nur eine bewusste Suche erlauben.",
  WhatsApp: "WhatsApp-Benachrichtigungen für Gruppen bis morgen stumm schalten.",
};

const MOMENT_STEPS: Record<string, string> = {
  Morgens: "Die ersten 30 Minuten nach dem Aufstehen bleiben bildschirmfrei.",
  Pausen: "In der naechsten Pause ohne Handy aufstehen, Wasser holen, kurz rausgehen.",
  Abends: "Ab 21 Uhr liegt das Handy ausser Reichweite, nicht neben dem Bett.",
  Bett: "Das Handy laedt heute ausserhalb des Schlafzimmers.",
};

const GOAL_STEPS: Record<string, string> = {
  "60 Minuten": "Einen 60-Minuten-Block im Kalender reservieren und wirklich leer lassen.",
  "Besser schlafen": "Die letzte Stunde vor dem Schlafen ohne Feed verbringen.",
  "Mehr Fokus": "Morgen mit einem 25-Minuten-Fokusblock starten, bevor Apps aufgehen.",
  "Weniger Reflex": "Bei jedem Griff zum Handy einmal laut benennen, warum du es oeffnest.",
};

type SaveState = "idle" | "saving" | "saved" | "error";

type SurveyResult = {
  id: number;
  score: number;
};

export default function SurveySection() {
  const [dailyMinutes, setDailyMinutes] = useState(150);
  const [pickups, setPickups] = useState(58);
  const [mainApp, setMainApp] = useState(MAIN_APPS[1]);
  const [hardestMoment, setHardestMoment] = useState(MOMENTS[2]);
  const [goal, setGoal] = useState(GOALS[0]);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [result, setResult] = useState<SurveyResult | null>(null);
  const [showSurveyHint, setShowSurveyHint] = useState(true);

  const dailyHours = useMemo(() => {
    const hours = dailyMinutes / 60;
    return hours >= 1 ? `${hours.toFixed(1)}h` : `${dailyMinutes} Min`;
  }, [dailyMinutes]);

  const yearlyHours = Math.round((dailyMinutes * 365) / 60);
  const yearlyDays = Math.round(yearlyHours / 16);
  const possibleBooks = Math.max(1, Math.floor(yearlyHours / 8));
  const possibleWorkouts = Math.max(1, Math.floor(yearlyHours));
  const estimatedScore = Math.max(
    1,
    Math.min(100, Math.round((dailyMinutes / 720) * 62 + (pickups / 250) * 38)),
  );
  const planSteps = useMemo(() => [
    APP_STEPS[mainApp] ?? "Die stärkste App für 24 Stunden bewusst ausbremsen.",
    MOMENT_STEPS[hardestMoment] ?? "Den schwierigsten Moment heute ohne Feed starten.",
    GOAL_STEPS[goal] ?? "Einen kleinen, messbaren Schritt für heute festlegen.",
  ], [goal, hardestMoment, mainApp]);

  function dismissSurveyHint() {
    setShowSurveyHint(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dismissSurveyHint();
    setSaveState("saving");
    setResult(null);

    try {
      const response = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyMinutes,
          pickups,
          mainApp,
          hardestMoment,
          goal,
        }),
      });

      if (!response.ok) throw new Error("Survey save failed");

      const data = (await response.json()) as SurveyResult;
      setResult(data);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  return (
    <section className="embedded-survey" id="survey">
      <div className="embedded-survey-inner">
        <div className="survey-copy">
          <div className="survey-kicker">Dein Nutzungsverhalten</div>
          <h2>Füll die Umfrage im Handy aus.</h2>
          <p>
            Nutze die Regler und Buttons auf dem Smartphone rechts. Dein Ergebnis
            wird gespeichert und macht sichtbar, wo der groesste Hebel liegt.
          </p>
          <div className="survey-direction">Rechts im Phone starten</div>
        </div>

        <div className="survey-phone-wrap">
          <div className="survey-phone-shadow" />
          <div className={`survey-phone-callout${showSurveyHint ? "" : " is-hidden"}`}>
            <span>Hier ausfüllen</span>
            <strong>Tippe und ziehe direkt im Smartphone</strong>
          </div>
          <div className="survey-phone">
            <div className="survey-phone-glare" />
            <div className="survey-island" />
            <div className="survey-screen">
              {saveState === "saved" && result ? (
                <div className="survey-result">
                  <div className="survey-small">Gespeichert</div>
                  <div className="survey-score">{result.score}</div>
                  <h3>Dein Scroll-Druck ist messbar.</h3>
                  <p>
                    Bei {dailyHours} pro Tag liegen etwa {yearlyHours} Stunden
                    pro Jahr auf dem Tisch. Das sind rund {yearlyDays} wache Tage.
                  </p>
                  <div className="survey-result-grid">
                    <div>
                      <strong>{possibleBooks}</strong>
                      <span>Bücher</span>
                    </div>
                    <div>
                      <strong>{possibleWorkouts}</strong>
                      <span>Workouts</span>
                    </div>
                  </div>
                  <div className="survey-plan">
                    <div className="survey-plan-title">Dein Plan für heute</div>
                    {planSteps.map((step, index) => (
                      <div className="survey-plan-step" key={step}>
                        <span>{index + 1}</span>
                        <p>{step}</p>
                      </div>
                    ))}
                  </div>
                  <a href="#top" className="survey-submit">
                    Zurück nach oben
                  </a>
                </div>
              ) : (
                <form
                  className="survey-form"
                  onSubmit={onSubmit}
                  onPointerDown={dismissSurveyHint}
                  onFocusCapture={dismissSurveyHint}
                  onChange={dismissSurveyHint}
                >
                  <header className="survey-form-head">
                    <div>
                      <span>Scrollprofil</span>
                      <h3>Check-in</h3>
                    </div>
                    <strong>{estimatedScore}</strong>
                  </header>

                  <label className="survey-field">
                    <span>
                      Nutzungszeit pro Tag <strong>{dailyHours}</strong>
                    </span>
                    <input
                      type="range"
                      min="15"
                      max="720"
                      step="15"
                      value={dailyMinutes}
                      onChange={(event) => setDailyMinutes(Number(event.target.value))}
                    />
                  </label>

                  <label className="survey-field">
                    <span>
                      Handy-Checks pro Tag <strong>{pickups}x</strong>
                    </span>
                    <input
                      type="range"
                      min="1"
                      max="250"
                      step="1"
                      value={pickups}
                      onChange={(event) => setPickups(Number(event.target.value))}
                    />
                  </label>

                  <fieldset className="survey-group">
                    <legend>Welche App zieht dich am stärkste?</legend>
                    <div className="survey-options two">
                      {MAIN_APPS.map((app) => (
                        <button
                          key={app}
                          type="button"
                          className={mainApp === app ? "active" : ""}
                          onClick={() => setMainApp(app)}
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="survey-group">
                    <legend>Wann passiert es am leichtesten?</legend>
                    <div className="survey-options">
                      {MOMENTS.map((moment) => (
                        <button
                          key={moment}
                          type="button"
                          className={hardestMoment === moment ? "active" : ""}
                          onClick={() => setHardestMoment(moment)}
                        >
                          {moment}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="survey-group">
                    <legend>Was willst du zurückholen?</legend>
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

                  {saveState === "error" && (
                    <p className="survey-error">Speichern hat nicht geklappt. Bitte nochmal versuchen.</p>
                  )}

                  <button className="survey-submit" type="submit" disabled={saveState === "saving"}>
                    {saveState === "saving" ? "Speichert..." : "Ergebnis speichern"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .embedded-survey{padding:6rem 2rem;background:radial-gradient(circle at 20% 18%,rgba(212,245,71,.18),transparent 30%),linear-gradient(135deg,#eef3dd 0%,#dfe8c7 48%,#cbd9ad 100%);color:#10140d;border-top:1px solid rgba(16,20,13,.14);scroll-margin-top:0;}
        .embedded-survey-inner{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:minmax(280px,520px) minmax(360px,1fr);align-items:center;gap:clamp(28px,6vw,80px);}
        .survey-kicker{font-size:14px;letter-spacing:.2em;text-transform:uppercase;color:#516039;margin-bottom:18px;font-weight:900;}
        .survey-copy h2{font-family:'Bebas Neue',Impact,sans-serif;font-size:clamp(4rem,10vw,8rem);line-height:.88;letter-spacing:0;color:#11150d;margin-bottom:22px;}
        .survey-copy p{font-size:1rem;line-height:1.75;color:#536048;max-width:460px;}
        .survey-direction{display:inline-flex;align-items:center;gap:12px;margin-top:26px;padding:13px 17px;border:2px solid #10140d;background:#d4f547;color:#10140d;border-radius:999px;font-weight:900;font-size:.9rem;letter-spacing:.08em;text-transform:uppercase;box-shadow:0 18px 38px rgba(16,20,13,.14);}
        .survey-direction::after{content:"→";font-size:1.35rem;line-height:1;}
        .survey-phone-wrap{position:relative;display:flex;align-items:center;justify-content:center;min-height:760px;perspective:1500px;}
        .survey-phone-shadow{position:absolute;width:min(430px,82vw);height:160px;border-radius:50%;background:radial-gradient(ellipse at center,rgba(70,82,46,.32),rgba(45,52,34,.18) 46%,transparent 72%);filter:blur(20px);transform:translateY(305px) rotateX(62deg);}
        .survey-phone-callout{position:absolute;left:calc(50% - 454px);top:58%;z-index:12;width:230px;padding:15px 16px;border:2px solid #d4f547;background:#10140d;color:#f7f2e8;border-radius:12px;box-shadow:0 24px 55px rgba(16,20,13,.28),0 0 34px rgba(212,245,71,.18);pointer-events:none;transition:opacity .22s ease,transform .22s ease;animation:surveyCalloutPulse 1.6s ease-in-out infinite;}
        .survey-phone-callout.is-hidden{opacity:0;transform:translateX(-12px);animation:none;}
        .survey-phone-callout::after{content:"";position:absolute;right:-40px;top:50%;width:40px;height:2px;background:#d4f547;transform:translateY(-50%);}
        .survey-phone-callout span{display:block;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#d4f547;margin-bottom:6px;font-weight:900;}
        .survey-phone-callout strong{display:block;font-size:.9rem;line-height:1.35;}
        @keyframes surveyCalloutPulse{0%,100%{transform:translateX(0);box-shadow:0 24px 55px rgba(16,20,13,.28),0 0 28px rgba(212,245,71,.14);}50%{transform:translateX(8px);box-shadow:0 28px 62px rgba(16,20,13,.3),0 0 44px rgba(212,245,71,.25);}}
        .survey-phone{position:relative;width:360px;height:740px;border-radius:46px;background:linear-gradient(115deg,#303626,#151a10 22%,#080a06 60%,#293020);border:2px solid rgba(255,255,255,.28);box-shadow:-22px 32px 52px rgba(73,83,51,.28),30px 52px 110px rgba(38,46,28,.38),inset 14px 0 22px rgba(255,255,255,.07),inset -18px 0 30px rgba(0,0,0,.58);overflow:hidden;transform:rotateX(4deg) rotateY(-7deg) translateZ(32px);transform-style:preserve-3d;}
        .survey-phone::before{content:"";position:absolute;inset:0;border-radius:inherit;z-index:4;pointer-events:none;background:linear-gradient(90deg,rgba(255,255,255,.26),transparent 11%,transparent 84%,rgba(255,255,255,.16)),linear-gradient(180deg,rgba(255,255,255,.16),transparent 16%,transparent 80%,rgba(0,0,0,.38));mix-blend-mode:screen;opacity:.52;}
        .survey-phone-glare{position:absolute;inset:2px;z-index:3;border-radius:inherit;pointer-events:none;background:radial-gradient(circle at 28% 18%,rgba(255,255,255,.3),rgba(212,245,71,.12) 18%,transparent 44%);mix-blend-mode:screen;}
        .survey-island{position:absolute;top:14px;left:50%;z-index:8;width:94px;height:28px;border-radius:999px;background:#080a06;transform:translateX(-50%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.06);}
        .survey-screen{position:absolute;inset:0;padding:58px 20px 22px;background:#202619;color:#f7f2e8;overflow:hidden;border-radius:inherit;}
        .survey-form,.survey-result{height:100%;display:flex;flex-direction:column;}
        .survey-form-head{display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,.1);margin-bottom:14px;}
        .survey-form-head span,.survey-small{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#b8b09c;}
        .survey-form-head h3{font-family:'DM Serif Display',serif;font-size:1.55rem;line-height:1.1;font-weight:400;margin-top:3px;}
        .survey-form-head strong{font-family:'Bebas Neue',sans-serif;color:#d4f547;font-size:3rem;line-height:.85;font-weight:400;}
        .survey-field{display:block;margin-bottom:16px;}
        .survey-field span{display:flex;justify-content:space-between;gap:12px;font-size:.82rem;color:#d8d3c3;margin-bottom:8px;}
        .survey-field strong{color:#d4f547;font-weight:700;}
        .survey-field input{width:100%;height:4px;-webkit-appearance:none;appearance:none;background:rgba(255,255,255,.16);border-radius:99px;outline:none;}
        .survey-field input::-webkit-slider-thumb{-webkit-appearance:none;width:19px;height:19px;border-radius:50%;background:#d4f547;box-shadow:0 0 0 5px rgba(212,245,71,.14);cursor:pointer;}
        .survey-group{border:0;margin:0 0 14px;}
        .survey-group legend{font-size:.75rem;color:#b8b09c;margin-bottom:8px;}
        .survey-options{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;}
        .survey-options.two{grid-template-columns:repeat(2,1fr);}
        .survey-options button{border:1px solid transparent;background:#343c29;color:#f7f2e8;border-radius:9px;padding:9px 7px;font:inherit;font-size:.72rem;cursor:pointer;transition:background .16s ease,border-color .16s ease,color .16s ease,transform .16s ease;}
        .survey-options button:hover,.survey-options button.active{background:#3f4931;border-color:#d4f547;color:#d4f547;transform:translateY(-1px);}
        .survey-submit{width:100%;border:0;border-radius:999px;background:#d4f547;color:#10140d;padding:14px 16px;font:inherit;font-weight:800;text-align:center;text-decoration:none;cursor:pointer;box-shadow:0 16px 38px rgba(212,245,71,.22);margin-top:auto;}
        .survey-submit:disabled{opacity:.68;cursor:wait;}
        .survey-error{font-size:.75rem;line-height:1.4;color:#ffd2d2;margin-bottom:10px;}
        .survey-result{align-items:center;text-align:center;padding:10px 4px 4px;overflow-y:auto;scrollbar-width:none;}
        .survey-result::-webkit-scrollbar{display:none;}
        .survey-score{font-family:'Bebas Neue',sans-serif;font-size:6.4rem;line-height:.82;color:#d4f547;margin:14px 0 8px;}
        .survey-result h3{font-family:'DM Serif Display',serif;font-weight:400;font-size:1.55rem;line-height:1.2;margin-bottom:10px;}
        .survey-result p{font-size:.84rem;line-height:1.55;color:#d8d3c3;margin-bottom:16px;}
        .survey-result-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;margin-bottom:16px;}
        .survey-result-grid div{background:#343c29;border:1px solid rgba(212,245,71,.18);border-radius:10px;padding:12px 8px;}
        .survey-result-grid strong{display:block;font-family:'Bebas Neue',sans-serif;font-size:2.55rem;line-height:.9;color:#d4f547;font-weight:400;}
        .survey-result-grid span{display:block;margin-top:5px;font-size:10px;color:#b8b09c;text-transform:uppercase;letter-spacing:.1em;}
        .survey-plan{width:100%;text-align:left;margin-bottom:16px;}
        .survey-plan-title{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#d4f547;font-weight:800;margin-bottom:8px;}
        .survey-plan-step{display:flex;gap:9px;align-items:flex-start;padding:10px 0;border-top:1px solid rgba(255,255,255,.08);}
        .survey-plan-step span{flex-shrink:0;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#d4f547;color:#10140d;font-size:11px;font-weight:900;}
        .survey-plan-step p{margin:0;color:#e7e2d4;font-size:.78rem;line-height:1.45;}
        @media (max-width:860px){
          .embedded-survey{padding:4rem 1.1rem;}
          .embedded-survey-inner{grid-template-columns:1fr;gap:24px;}
          .survey-copy h2{font-size:4rem;}
          .survey-phone-wrap{min-height:700px;}
          .survey-phone-callout{left:50%;top:0;width:min(320px,86vw);transform:translate(-50%,-18px);text-align:center;}
          .survey-phone-callout.is-hidden{transform:translate(-50%,-28px);}
          .survey-phone-callout::after{right:50%;top:auto;bottom:-44px;width:2px;height:44px;transform:translateX(50%);box-shadow:0 14px 0 #d4f547;}
          @keyframes surveyCalloutPulse{0%,100%{transform:translate(-50%,-18px);}50%{transform:translate(-50%,-10px);}}
          .survey-phone{width:min(350px,92vw);height:700px;transform:none;}
        }
      `}</style>
    </section>
  );
}
