"use client";
import { useState, useEffect, useRef, useCallback, type CSSProperties, type PointerEvent } from "react";
import CreatedBy from "@/components/CreatedBy";
import { ALTS, FEED_POSTS, PARTICLES, POSTS, SCROLLED_POSTS, STORIES } from "../data/content";
import { clamp, easeInOut, easeOut, lerp, phase } from "../utils/math";
import { formatPhoneTime } from "../utils/time";
import MindscrollStyles from "./MindscrollStyles";
import SurveySection from "./SurveySection";

export default function MindscrollPage() {
  const [hours, setHours] = useState(2);
  const [activeAlt, setActiveAlt] = useState<number | null>(null);
  const [timeDebt, setTimeDebt] = useState(0);
  const [phoneTime, setPhoneTime] = useState("--:--");
  const [showBrandTagline, setShowBrandTagline] = useState(true);

  const storyRef     = useRef<HTMLDivElement>(null);
  const phoneRef     = useRef<HTMLDivElement>(null);
  const glowRef      = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const feedInnerRef = useRef<HTMLDivElement>(null);
  const layerFeedRef = useRef<HTMLDivElement>(null);
  const layerRevRef  = useRef<HTMLDivElement>(null);
  const layerCalcRef = useRef<HTMLDivElement>(null);
  const hintRef      = useRef<HTMLDivElement>(null);
  const bgWordRef    = useRef<HTMLDivElement>(null);
  const feedYRef     = useRef(0);
  const feedSpeedRef = useRef(0.6);
  const feedPausedRef = useRef(false);
  const feedDrivenByScrollRef = useRef(true);
  const rafRef       = useRef<number>(0);

  const yr = Math.round(hours * 365);
  const lostDays = yr / 24;
  const lostDaysDisplay = lostDays.toLocaleString("de-DE", { maximumFractionDigits: 1 });
  const activeDays = Math.min(365, Math.round(lostDays));
  const yearCells = Array.from({ length: 365 }, (_, index) => index < activeDays);
  const clockAngle = (hours / 12) * 360;
  const potential = [
    { label: "Bücher", value: Math.max(1, Math.floor(yr / 8)), unit: "lesen", max: 548 },
    { label: "Workouts", value: Math.max(1, Math.floor(yr)), unit: "machen", max: 4380 },
    { label: "Spaziergänge", value: Math.max(1, Math.floor(yr * 2)), unit: "30 Min", max: 8760 },
    { label: "Sprachstunden", value: Math.max(1, Math.round(yr)), unit: "üben", max: 4380 },
  ];
  const thumbKm = ((hours * 60 * 20) / 1000).toFixed(1);
  const recoveryMode = timeDebt >= 50;
  const timeAccountTitle = recoveryMode ? "Zeitkonto" : "Zeitverlust";
  const timeAccountValue = `${recoveryMode ? 60 : timeDebt} Min`;
  const timeAccountHint = recoveryMode ? "heute zurückholen" : "im Feed verloren";

  const setLayers = useCallback((feed: number, reveal: number, calc: number) => {
    if (layerFeedRef.current) { layerFeedRef.current.style.opacity = String(feed); layerFeedRef.current.style.pointerEvents = feed > 0.5 ? "auto" : "none"; }
    if (layerRevRef.current)  layerRevRef.current.style.opacity  = String(reveal);
    if (layerCalcRef.current) { layerCalcRef.current.style.opacity = String(calc);  layerCalcRef.current.style.pointerEvents = calc > 0.5 ? "auto" : "none"; }
  }, []);

  const setHoursFromClock = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = event.clientX - centerX;
    const y = event.clientY - centerY;
    const degrees = (Math.atan2(x, -y) * 180) / Math.PI;
    const normalized = (degrees + 360) % 360;
    const nextHours = Math.round((normalized / 360) * 12 * 2) / 2;

    setHours(nextHours < 0.5 ? 12 : nextHours);
  }, []);

  const onPhonePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const phone = phoneRef.current;
    if (!phone) return;

    const rect = phone.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);

    phone.style.setProperty("--tilt-x", `${lerp(7, -7, y).toFixed(2)}deg`);
    phone.style.setProperty("--tilt-y", `${lerp(-11, 11, x).toFixed(2)}deg`);
    phone.style.setProperty("--glare-x", `${(x * 100).toFixed(1)}%`);
    phone.style.setProperty("--glare-y", `${(y * 100).toFixed(1)}%`);
    phone.style.setProperty("--edge-left", `${lerp(0.46, 0.08, x).toFixed(2)}`);
    phone.style.setProperty("--edge-right", `${lerp(0.08, 0.42, x).toFixed(2)}`);
    phone.parentElement?.style.setProperty("--shadow-x", `${lerp(24, -24, x).toFixed(1)}px`);
    phone.parentElement?.style.setProperty("--shadow-y", `${lerp(18, 34, y).toFixed(1)}px`);
    phone.classList.add("is-hovered");
  }, []);

  const onPhonePointerLeave = useCallback(() => {
    const phone = phoneRef.current;
    if (!phone) return;

    phone.style.setProperty("--tilt-x", "0deg");
    phone.style.setProperty("--tilt-y", "0deg");
    phone.style.setProperty("--glare-x", "50%");
    phone.style.setProperty("--glare-y", "18%");
    phone.style.setProperty("--edge-left", "0.18");
    phone.style.setProperty("--edge-right", "0.18");
    phone.parentElement?.style.setProperty("--shadow-x", "0px");
    phone.parentElement?.style.setProperty("--shadow-y", "28px");
    phone.classList.remove("is-hovered");
    feedPausedRef.current = false;
  }, []);

  const onScroll = useCallback(() => {
    const story = storyRef.current;
    const phone = phoneRef.current;
    if (!story || !phone) return;

    const rect  = story.getBoundingClientRect();
    const total = story.offsetHeight - window.innerHeight;
    const p     = clamp(-rect.top / total, 0, 1);
    const VW    = window.innerWidth, VH = window.innerHeight;

    setShowBrandTagline(p < 0.01);
    if (hintRef.current)   hintRef.current.style.opacity   = p < 0.04 ? "1" : "0";
    if (bgWordRef.current) bgWordRef.current.style.opacity = String(lerp(1, 0, easeOut(phase(p, 0.1, 0.35))));
    if (particlesRef.current) {
      const particleIn = easeOut(phase(p, 0.22, 0.50));
      const particleOut = easeOut(phase(p, 0.72, 0.86));
      particlesRef.current.style.opacity = String(particleIn * (1 - particleOut));
      particlesRef.current.style.transform = `translate(-50%, calc(-50% - ${Math.round(particleIn * 44)}px))`;
    }
    setTimeDebt(Math.round(lerp(0, 60, easeOut(phase(p, 0.04, 0.90)))));

    const pA = phase(p, 0, 0.24);
    const pB = phase(p, 0.08, 0.68);
    const pD = phase(p, 0.78, 0.92);

    const growE  = easeInOut(pA);
    const maxW   = Math.min(VW, VH / 2.16);
    const maxH   = maxW * 2.16;
    const tgtW   = Math.min(340, VW * 0.85);
    const tgtH   = tgtW * 2.16;

    const phoneW = lerp(lerp(340, maxW, growE), tgtW, easeOut(pD));
    const phoneH = lerp(lerp(734, maxH, growE), tgtH, easeOut(pD));
    const phoneBR = lerp(lerp(44, 0, growE), 44, easeOut(pD));

    phone.style.width        = phoneW + "px";
    phone.style.height       = phoneH + "px";
    phone.style.borderRadius = phoneBR + "px";

    if (glowRef.current) {
      glowRef.current.style.opacity      = String(easeInOut(phase(p, 0.22, 0.46)) * (1 - easeOut(phase(p, 0.72, 0.86))));
      glowRef.current.style.borderRadius = (phoneBR + 6) + "px";
    }

    feedSpeedRef.current = lerp(0.6, 5, pB * (1 - phase(p, 0.55, 0.75)));

    const feedEl = feedInnerRef.current;
    if (feedEl) {
      const feedLoopHeight = feedEl.scrollHeight / 3;
      if (feedLoopHeight > 0) {
        const feedProgress = easeInOut(phase(p, 0.02, 0.68));
        const feedDistance = feedLoopHeight * 1.18;
        feedYRef.current = -feedDistance * feedProgress;
        feedEl.style.transform = `translateY(${feedYRef.current}px)`;
        feedDrivenByScrollRef.current = p < 0.94;
      }
    }

    if (p < 0.60) {
      setLayers(1, 0, 0);
    } else if (p < 0.74) {
      const t = phase(p, 0.60, 0.74);
      setLayers(lerp(1, 0.2, easeOut(t)), easeOut(t) * 0.95, 0);
    } else if (p < 0.82) {
      setLayers(0.1, 0.95, 0);
    } else if (p < 0.94) {
      const t = phase(p, 0.82, 0.94);
      setLayers(0, lerp(0.95, 0, easeOut(t)), easeOut(t));
    } else {
      setLayers(0, 0, 1);
    }
  }, [setLayers]);

  useEffect(() => {
    const tick = () => {
      const el = feedInnerRef.current;
      if (el) {
        if (!feedDrivenByScrollRef.current && !feedPausedRef.current) {
          feedYRef.current -= feedSpeedRef.current;
          const h = el.scrollHeight / 3;
          if (Math.abs(feedYRef.current) >= h) feedYRef.current = 0;
        }
        el.style.transform = `translateY(${feedYRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafRef.current); };
  }, [onScroll]);

  useEffect(() => {
    const updatePhoneTime = () => setPhoneTime(formatPhoneTime());
    updatePhoneTime();
    const interval = window.setInterval(updatePhoneTime, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const allPosts = [...FEED_POSTS, ...FEED_POSTS, ...FEED_POSTS];

  return (
    <main className="main" id="top">
      <div className="brand-lockup">
        <a className="brand-logo" href="/test" aria-label="Mindscroll">
          <span className="brand-badge">
            <span className="brand-phone" />
          </span>
          <span className="brand-word" data-text="MINDSCROLL">
            <span>MINDSCROLL</span>
            <span>SCROLLFREI</span>
          </span>
        </a>
        <div className={`brand-tagline${showBrandTagline ? "" : " is-hidden"}`}>Kampagne gegen Zeitverschwendung</div>
      </div>
      <details className="page-nav">
        <summary aria-label="Navigation öffnen">
          <span />
          <span />
          <span />
        </summary>
        <nav aria-label="Seitennavigation">
          <a href="#top">Start</a>
          <a href="#recall">Stopp</a>
          <a href="#impact">Infografik</a>
          <a href="#survey">Login</a>
        </nav>
      </details>

      {/* ═══ STORY HERO ═══ */}
      <div className="story" ref={storyRef}>
        <div className="sticky">
          <div className={`time-account${recoveryMode ? " recover" : ""}`} aria-label={`${timeAccountValue} ${timeAccountTitle}`}>
            <span>{timeAccountTitle}</span>
            <strong>{timeAccountValue}</strong>
            <small>{timeAccountHint}</small>
          </div>
          <div className="bg-word" ref={bgWordRef}>SCROLL</div>
          <div className="hero-prompt">
            <span>Scroll nach unten</span>
            <strong>und hover mit der Maus über das Smartphone</strong>
          </div>
          

          <div className="phone-wrap">
            <div className="phone-cast-shadow" />
            <div className="time-particles" ref={particlesRef} aria-hidden="true">
              {PARTICLES.map((particle, i) => (
                <span key={`${particle}-${i}`}>{particle}</span>
              ))}
            </div>
            <div
              className="phone"
              ref={phoneRef}
              onPointerMove={onPhonePointerMove}
              onPointerLeave={onPhonePointerLeave}
            >
              <div className="phone-glow" ref={glowRef} />
              <div className="phone-shine" />
              <div className="island"><div className="island-cam" /></div>
              <div className="screen">

                {/* Layer 0: Feed */}
                <div className="screen-layer" ref={layerFeedRef} style={{ opacity: 1, pointerEvents: "auto" }}>
                  <div className="status-bar">
                    <span className="status-time" suppressHydrationWarning>{phoneTime}</span>
                    <div className="status-icons"><span>●●●</span><span>WiFi</span><span className="notify-dot">3</span><span>🔋</span></div>
                  </div>
                  <div
                    className="feed-scroll"
                    onPointerEnter={() => { feedPausedRef.current = true; }}
                    onPointerLeave={() => { feedPausedRef.current = false; }}
                  >
                    <div className="feed-chrome">
                      <div className="insta-head">
                        <strong>mindscroll</strong>
                        <span>⌕</span>
                        <span className="head-heart">♡<i>9</i></span>
                      </div>
                      <div className="feed-trap-note">
                        <span>Live</span>
                        <strong>Der Feed reagiert auf jeden Scroll</strong>
                      </div>
                      <div className="story-row">
                        {STORIES.map((story) => (
                          <div className="story-chip" key={story.name}>
                            <span style={{ backgroundImage: `url(${story.photo})` }} />
                            <small>{story.name}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="feed-inner" ref={feedInnerRef}>
                      {allPosts.map((p, i) => {
                        const postNo = (i % FEED_POSTS.length) + 1;
                        const isReel = p.kind === "reel";
                        return (
                          <div key={i} className={`fpost${isReel ? " is-reel" : ""}${p.sponsored ? " is-sponsored" : ""}`}>
                            <div className="fpost-cost">
                              <span>{p.cost}</span>
                              <small>{p.note}</small>
                            </div>
                            <div className="fpost-top">
                              <div className="favatar" style={{ backgroundImage: `url(${p.photo})` }} />
                              <div className="fnames">
                                <div className="fuser">{p.user}</div>
                                <div className="fplace">{p.place}</div>
                              </div>
                              {p.sponsored && <div className="sponsored-pill">Gesponsert</div>}
                              <div className="fdots">...</div>
                            </div>
                            <div
                              className="fimg"
                              style={{ height: p.ih, backgroundImage: `url(${p.photo})` }}
                            >
                              {isReel && (
                                <>
                                  <div className="reel-play" />
                                  <div className="reel-side">
                                    <span>♡</span>
                                    <span>◌</span>
                                    <span>▱</span>
                                  </div>
                                  <div className="reel-progress"><span /></div>
                                </>
                              )}
                              {postNo > 2 && (
                                <div className="feed-pressure">
                                  <small>Algorithmus</small>
                                  <strong>{p.pressure}</strong>
                                </div>
                              )}
                            </div>
                            <div className="factions">
                              <span>♡</span>
                              <span>◌</span>
                              <span>↗</span>
                              <span className="fsave">▱</span>
                            </div>
                            <div className="fmeta-row">
                              <div className="flikes">{p.likes} Likes</div>
                              <div className="fcounts">{p.comments} Kommentare · {p.saves} Saves</div>
                            </div>
                            <div className="fcaption">
                              <strong>{p.user}</strong>
                              <span>{p.caption}</span>
                            </div>
                            <div className="fpost-index">Post {postNo}/{SCROLLED_POSTS}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="app-nav">
                    <div className="nav-dot active" /><div className="nav-dot" /><div className="nav-dot" /><div className="nav-dot" />
                  </div>
                </div>

                {/* Layer 1: Reveal */}
                <div className="screen-layer" ref={layerRevRef}>
                  <div className="reveal-layer">
                    <div className="reveal-eye">{SCROLLED_POSTS} Posts später</div>
                    <div className="reveal-big"><span className="km">{thumbKm}</span><br />km</div>
                    <div className="reveal-sub">zurückgelegt.<br />Kannst du dich an 3 Posts erinnern?</div>
                    <div className="reveal-memory">
                      <span>Gesehen: {SCROLLED_POSTS}</span>
                      <span>Behalten: ?</span>
                    </div>
                    <div className="reveal-pill">Weiter scrollen ↓</div>
                  </div>
                </div>

                {/* Layer 2: Calculator */}
                <div className="screen-layer" ref={layerCalcRef}>
                  <div className="calc-layer">
                    <div className="calc-header">
                      <div className="calc-eyebrow">{"// Rechne nach"}</div>
                      <div className="calc-title">Was hättest du<br />stattdessen getan?</div>
                    </div>
                    <div className="calc-scroll">
                      <div style={{ paddingTop: 14 }}>
                        <div className="ph-slider-row">
                          <span className="ph-val">{hours % 1 === 0 ? hours : hours.toFixed(1)}</span>
                          <span className="ph-unit">Stunden / Tag</span>
                        </div>
                        <div className="ph-clock-note">Wird über die Uhr in der Infografik eingestellt</div>

                        <div className="ph-stats">
                          {[
                            { n: yr.toLocaleString("de-DE"), l: "Stunden/Jahr", s: "verschwendet", hl: true },
                            { n: Math.floor(yr / 8),         l: "Bücher lesen", s: "möglich" },
                            { n: (yr / 4).toFixed(1),        l: "Marathons",    s: "stattdessen" },
                            { n: Math.max(1, Math.round(yr / 200)), l: "Sprachen", s: "Grundstufe" },
                          ].map((s, i) => (
                            <div key={i} className={`ph-stat${s.hl ? " hl" : ""}`}>
                              <div className="ph-sn">{s.n}</div>
                              <div className="ph-sl">{s.l}</div>
                              <div className="ph-ss">{s.s}</div>
                            </div>
                          ))}
                        </div>

                        <div className="ph-alt-title">Stattdessen möglich</div>
                        <div className="ph-alts">
                          {ALTS.map((a, i) => {
                            const earned = (yr / a.hpb).toFixed(1);
                            const isAct = activeAlt === i;
                            return (
                              <div key={i} className={`ph-alt${isAct ? " active" : ""}`} onClick={() => setActiveAlt(isAct ? null : i)}>
                                <div className="ph-alt-e">{a.e}</div>
                                <div className="ph-alt-body">
                                  <div className="ph-alt-name">{a.t}</div>
                                  <div className="ph-alt-desc">{a.d}</div>
                                  <div className="ph-alt-earned">{earned}× mit {yr}h/Jahr machbar</div>
                                </div>
                                <div className="ph-alt-arr">{isAct ? "↑" : "›"}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="calc-cta">
                      <a className="calc-cta-btn" href="#survey">Heute 60 Minuten zurückholen</a>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="scroll-hint" ref={hintRef}>
            <span>Scroll</span><div className="hint-line" />
          </div>
        </div>
      </div>

      {/* ═══ RECALL BREAK ═══ */}
      <section className="recall-break" id="recall">
        <div className="recall-inner">
          <div className="recall-strip" aria-hidden="true">
            {POSTS.slice(0, 6).map((post) => (
              <span key={post.user} style={{ backgroundImage: `url(${post.photo})` }} />
            ))}
          </div>
          <div className="recall-kicker">Stopp</div>
          <h2>Du hast gerade {SCROLLED_POSTS} Posts gesehen. Erinnerst du dich an 3?</h2>
          <p>
            Genau hier passiert der Bruch: Der Feed war laut, schnell und passend.
            Aber was davon ist wirklich bei dir geblieben?
          </p>
          <div className="recall-grid">
            <div><strong>{SCROLLED_POSTS}</strong><span>Posts gesehen</span></div>
            <div><strong>3?</strong><span>bewusst erinnert</span></div>
            <div><strong>{timeAccountValue}</strong><span>{timeAccountHint}</span></div>
          </div>
        </div>
      </section>

      {/* ═══ CHALLENGE ═══ */}
      <section className="challenge" id="impact">
        <div className="ch-inner">
          <div className="challenge-copy">
            <div className="ch-eyebrow">Bereit?</div>
            <h2 className="ch-title">Hol dir heute<br /><span className="ch-accent">60 Minuten</span><br />zurück.</h2>
            <p className="ch-body">Leg das Handy weg. Nicht für immer. Aber heute, für eine Stunde. Schau wie weit du kommst.</p>
            <div
              className="time-dial"
              role="slider"
              aria-label="Social-Media-Zeit pro Tag über Uhr einstellen"
              aria-valuemin={0.5}
              aria-valuemax={12}
              aria-valuenow={hours}
              aria-valuetext={`${hours.toLocaleString("de-DE")} Stunden pro Tag`}
              tabIndex={0}
              style={{ "--clock-angle": `${clockAngle}deg` } as CSSProperties}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                setHoursFromClock(event);
              }}
              onPointerMove={(event) => {
                if (event.buttons === 1) setHoursFromClock(event);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight" || event.key === "ArrowUp") setHours((value) => Math.min(12, value + 0.5));
                if (event.key === "ArrowLeft" || event.key === "ArrowDown") setHours((value) => Math.max(0.5, value - 0.5));
              }}
            >
              <div className="dial-face">
                {Array.from({ length: 12 }, (_, index) => (
                  <span
                    key={index}
                    className="dial-tick"
                    style={{ transform: `rotate(${index * 30}deg)` }}
                  >
                    <i style={{ transform: `translateX(-50%) rotate(${-index * 30}deg)` }}>{index === 0 ? 12 : index}</i>
                  </span>
                ))}
                <div className="dial-track" />
                <div className="dial-hand" style={{ transform: `rotate(${clockAngle}deg)` }}>
                  <span />
                </div>
                <div className="dial-center">
                  <strong>{hours.toLocaleString("de-DE")}h</strong>
                  <small>pro Tag</small>
                </div>
              </div>
              <div className="dial-hint">Zeiger aufziehen</div>
            </div>
          </div>
          <aside className="impact-graphic" aria-label="Interaktive Infografik zum Zeitverlust">
            <div className="impact-top">
              <div>
                <span className="impact-kicker">Infografik</span>
                <h3>Dein verlorenes Jahr</h3>
              </div>
              <strong>{lostDaysDisplay}<small>Tage</small></strong>
            </div>
            <div className="impact-slider" aria-live="polite">
              <span><b>{hours.toLocaleString("de-DE")}h</b> Social Media pro Tag</span>
              <em>Stelle die Zeit links an der Uhr ein</em>
            </div>
            <div className="impact-math">
              <div><strong>{yr.toLocaleString("de-DE")}</strong><span>Stunden pro Jahr</span></div>
              <div><strong>{lostDaysDisplay}</strong><span>24h-Tage weg</span></div>
            </div>
            <div className="year-map" aria-label={`${lostDaysDisplay} von 365 Jahrestagen markiert`}>
              {yearCells.map((isActive, index) => (
                <span key={index} className={isActive ? "active" : ""} />
              ))}
            </div>
            <p className="impact-caption">
              Jede helle Kachel steht für einen 24-Stunden-Tag, der im Feed verschwinden kann.
            </p>
            <div className="impact-options">
              <div className="impact-option-head">Was daraus werden könnte</div>
              {potential.map((item) => (
                <div className="impact-option" key={item.label}>
                  <div>
                    <strong>{item.value.toLocaleString("de-DE")}</strong>
                    <span>{item.label} {item.unit}</span>
                  </div>
                  <i style={{ width: `${Math.min(100, (item.value / item.max) * 100)}%` }} />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <SurveySection />

      {/* ═══ FOOTER ═══ */}
{/* ═══ FOOTER ═══ */}
<footer className="site-footer" id="footer">
  <div className="footer-inner">
    <div className="footer-logo">scrollfrei.</div>
    <div className="footer-text">
      Diese Seite hat keine App. Kein Like-Button. Kein Algorithmus.<br />
      Nur eine Frage: Was machst du mit deiner Zeit?
    </div>
    <CreatedBy />
  </div>
</footer>

      <MindscrollStyles />
    </main>
  );
}
