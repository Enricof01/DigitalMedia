"use client";
import { useState, useEffect, useRef, useCallback, type PointerEvent } from "react";
import CreatedBy from "@/components/CreatedBy";
import SurveySection from "@/components/SurveySection";

const POSTS = [
  {
    user: "lina.daily",
    place: "Berlin, Germany",
    kind: "post",
    ih: 168,
    cost: "+3 Min",
    note: "weg",
    likes: "12.482",
    comments: "328",
    saves: "1.204",
    pressure: "Nur kurz schauen",
    caption: "kurzer Blick, langer Loop",
    photo: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=560&q=80",
  },
  {
    user: "reelpilot",
    place: "For you",
    kind: "reel",
    ih: 190,
    cost: "+8 Min",
    note: "Dopamin",
    likes: "48.201",
    comments: "1.947",
    saves: "8.320",
    pressure: "Bleib dran",
    caption: "noch ein Clip, dann wirklich Pause",
    photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=560&q=80",
  },
  {
    user: "noah.frames",
    place: "Cafe Mitte",
    kind: "post",
    ih: 176,
    cost: "+5 Min",
    note: "nichts behalten",
    likes: "9.874",
    comments: "214",
    saves: "903",
    pressure: "Der naechste Post passt besser",
    caption: "alles gesehen, nichts gespeichert",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=560&q=80",
  },
  {
    user: "studio.after",
    place: "New post",
    kind: "reel",
    ih: 184,
    cost: "+11 Min",
    note: "Autopilot",
    likes: "31.590",
    comments: "876",
    saves: "4.112",
    pressure: "Du hast langsamer gescrollt",
    caption: "der Feed merkt schneller als du, was dich haelt",
    photo: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=560&q=80",
  },
  {
    user: "slowoutdoors",
    place: "Dolomites",
    kind: "post",
    ih: 202,
    cost: "+4 Min",
    note: "Fokus weg",
    likes: "22.118",
    comments: "502",
    saves: "3.771",
    pressure: "Speichern für spaeter",
    caption: "eigentlich wolltest du nur eine Nachricht checken",
    photo: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=560&q=80",
  },
  {
    user: "citybreaks",
    place: "Lisbon",
    kind: "post",
    ih: 174,
    cost: "+6 Min",
    note: "nur noch eins",
    likes: "15.730",
    comments: "439",
    saves: "2.018",
    pressure: "Nur noch einer",
    caption: "aus einem Post wird eine halbe Stunde",
    photo: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=560&q=80",
  },
  {
    user: "night.study",
    place: "Saved reel",
    kind: "reel",
    ih: 188,
    cost: "+9 Min",
    note: "Zeit verrauscht",
    likes: "67.042",
    comments: "3.492",
    saves: "10.870",
    pressure: "Das koennte wichtig sein",
    caption: "gespeichert für spaeter, vergessen für immer",
    photo: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=560&q=80",
  },
  {
    user: "crew.room",
    place: "Campus",
    kind: "post",
    ih: 166,
    cost: "+2 Min",
    note: "Scrollreflex",
    likes: "6.318",
    comments: "118",
    saves: "609",
    pressure: "Alle schauen kurz",
    caption: "alle schauen kurz. keiner merkt wie lange",
    photo: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=560&q=80",
  },
  {
    user: "morning.fit",
    place: "Story replay",
    kind: "reel",
    ih: 196,
    cost: "+7 Min",
    note: "Daumen weiter",
    likes: "18.506",
    comments: "768",
    saves: "2.661",
    pressure: "Noch 7 Sekunden",
    caption: "du bist nicht müde, du bist überreizt",
    photo: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=560&q=80",
  },
  {
    user: "soft.news",
    place: "Explore",
    kind: "post",
    sponsored: true,
    ih: 170,
    cost: "+10 Min",
    note: "noch ein Tab",
    likes: "53.809",
    comments: "2.084",
    saves: "7.442",
    pressure: "Empfohlen, weil du geblieben bist",
    caption: "alles wichtig, nichts dringend",
    photo: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=560&q=80",
  },
];

const STORIES = [
  { name: "Du", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=70" },
  { name: "Fokus", photo: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=120&q=70" },
  { name: "Zeit", photo: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=120&q=70" },
  { name: "Pause", photo: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=120&q=70" },
];

const PARTICLES = ["+3 Min", "+8 Min", "+5 Min", "+11 Min", "+4 Min", "+6 Min", "+9 Min", "+2 Min", "+7 Min", "+10 Min"];
const SCROLLED_POSTS = POSTS.length;

const ALTS = [
  { e: "📚", t: "Bücher lesen",       d: "12 Bücher / Jahr",               hpb: 8   },
  { e: "🧘", t: "Meditieren",         d: "Fokus & Ruhe",                   hpb: 0.5 },
  { e: "🌿", t: "Spazierengehen",     d: "Frische Luft, echter Fortschritt", hpb: 1 },
  { e: "🎸", t: "Instrument",         d: "1 Jahr = spielbares Lied",        hpb: 200 },
  { e: "🍳", t: "Kochen",             d: "Gesünder & günstiger",            hpb: 2   },
  { e: "✍️", t: "Tagebuch",           d: "Gedanken klären",                 hpb: 1   },
  { e: "🏋️", t: "Sport",             d: "Mehr Energie, besser schlafen",   hpb: 1   },
  { e: "🌍", t: "Sprache lernen",     d: "Grundkenntnisse in 6 Mon.",       hpb: 150 },
];

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp(t, 0, 1);
const phase = (p: number, s: number, e: number) => clamp((p - s) / (e - s), 0, 1);

export default function Home() {
  const [hours, setHours] = useState(2);
  const [activeAlt, setActiveAlt] = useState<number | null>(null);
  const [timeDebt, setTimeDebt] = useState(0);

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

  const allPosts = [...POSTS, ...POSTS, ...POSTS];

  return (
    <main className="main" id="top">
      

      {/* ═══ STORY HERO ═══ */}
      <div className="story" ref={storyRef}>
        <div className="sticky">
          <a className="brand-logo" href="/test" aria-label="Mindscroll">
            <span className="brand-badge">
              <span className="brand-phone" />
            </span>
            <span className="brand-word" data-text="MINDSCROLL">
              <span>MINDSCROLL</span>
              <span>SCROLLFREI</span>
            </span>
          </a>
          <div className={`time-account${recoveryMode ? " recover" : ""}`} aria-label={`${timeAccountValue} ${timeAccountTitle}`}>
            <span>{timeAccountTitle}</span>
            <strong>{timeAccountValue}</strong>
            <small>{timeAccountHint}</small>
          </div>
          <div className="bg-word" ref={bgWordRef}>SCROLL</div>
          <div className="eyebrow-top">Eine Kampagne gegen die stille Zeitverschwendung
            
          </div>
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
                    <span className="status-time">9:41</span>
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
                        const postNo = (i % POSTS.length) + 1;
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
                    <div className="reveal-eye">{SCROLLED_POSTS} Posts spaeter</div>
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
                        <input type="range" className="ph-range" min={0.5} max={8} step={0.5} value={hours}
                          onChange={e => setHours(Number(e.target.value))} />
                        <div className="range-ends"><span>30 Min</span><span>8 Std</span></div>

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
      <section className="recall-break">
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

      {/* ═══ TRUTH ═══ */}
      <section className="truth">
        <div className="truth-inner">
          <div className="truth-q">&quot;Die Apps sind dafür gebaut, dich <strong>nicht loszulassen</strong>. Jedes Mal wenn du scrollst, wird ein Algorithmus klüger. Du nicht.&quot;</div>
          <div className="truth-row">
            <div className="truth-s"><span className="truth-n">2,5h</span><span className="truth-d">Deutsche scrollen täglich auf Social Media</span></div>
            <div className="truth-s"><span className="truth-n">38 Tage</span><span className="truth-d">pro Jahr wach, bewusst, weggescrollt</span></div>
            <div className="truth-s"><span className="truth-n">0</span><span className="truth-d">Erinnerungen die du wirklich behalten wirst</span></div>
          </div>
        </div>
      </section>

      {/* ═══ CHALLENGE ═══ */}
      <section className="challenge">
        <div className="ch-inner">
          <div className="ch-eyebrow">Bereit?</div>
          <h2 className="ch-title">Hol dir heute<br /><span className="ch-accent">60 Minuten</span><br />zurück.</h2>
          <p className="ch-body">Leg das Handy weg. Nicht für immer. Aber heute, für eine Stunde. Schau wie weit du kommst.</p>
          <div className="ch-box">
            <div style={{ fontWeight: 500, marginBottom: "1rem", fontSize: ".95rem" }}>Heute 60 Minuten zurückholen</div>
            <ul className="ch-list">
              <li>Handy nach 21 Uhr in eine Schublade</li>
              <li>Social-Media-Apps aus dem Homescreen</li>
              <li>Jeden Abend eine Alternative aus der Liste</li>
              <li>Am Ende: Notiere wie du dich fühlst</li>
            </ul>
            <a className="ch-cta" href="#survey">Umfrage starten</a>
          </div>
        </div>
      </section>

      <SurveySection />

      {/* ═══ FOOTER ═══ */}
{/* ═══ FOOTER ═══ */}
<footer className="site-footer">
  <div className="footer-inner">
    <div className="footer-logo">scrollfrei.</div>
    <div className="footer-text">
      Diese Seite hat keine App. Kein Like-Button. Kein Algorithmus.<br />
      Nur eine Frage: Was machst du mit deiner Zeit?
    </div>
    <CreatedBy />
  </div>
</footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{--bg:#202619;--bg2:#293020;--bg3:#343c29;--text:#f7f2e8;--dim:#b8b09c;--accent:#d4f547;--accent2:#d4f547;}
        html{scroll-behavior:smooth;}
        body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;overflow-x:hidden;}
        .main{width:100%;}

        .story{position:relative;height:820vh;}
        .sticky{position:sticky;top:0;height:100vh;overflow:hidden;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#2c3323 0%,#22291b 58%,#1b2216 100%);}
        .brand-logo{position:absolute;top:22px;left:24px;z-index:40;display:inline-flex;align-items:center;height:46px;padding:4px 10px 4px 4px;background:#090907;border:1px solid rgba(255,255,255,.16);box-shadow:0 18px 40px rgba(0,0,0,.36),inset 0 1px 0 rgba(255,255,255,.08);text-decoration:none;transform:translateZ(0);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;}
        .brand-logo:hover{transform:translateY(-1px);border-color:rgba(212,245,71,.45);box-shadow:0 22px 48px rgba(0,0,0,.44),0 0 28px rgba(212,245,71,.1),inset 0 1px 0 rgba(255,255,255,.1);}
        .brand-badge{position:relative;width:34px;height:38px;background:var(--accent);display:flex;align-items:flex-end;justify-content:flex-start;padding:5px;box-shadow:inset 0 0 0 1px rgba(10,10,8,.2);}
        .brand-badge::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.24),transparent 42%);pointer-events:none;}
        .brand-phone{position:relative;width:12px;height:17px;border:2px solid #10100e;border-radius:2px 2px 4px 4px;transform:rotate(-14deg);box-shadow:3px 2px 0 rgba(10,10,8,.3);}
        .brand-phone::after{content:"";position:absolute;left:3px;right:3px;bottom:1px;height:2px;border-radius:99px;background:#10100e;}
        .brand-word{position:relative;display:block;width:172px;height:34px;overflow:hidden;font-family:'Bebas Neue',Impact,sans-serif;font-size:2.55rem;line-height:.88;color:#f0ede6;letter-spacing:.02em;margin-left:9px;text-shadow:2px 0 0 rgba(255,255,255,.14),0 1px 0 rgba(0,0,0,.9);}
        .brand-word::after{content:attr(data-text);position:absolute;inset:0;color:var(--accent);opacity:0;clip-path:inset(0 0 65% 0);transform:translateX(0);pointer-events:none;}
        .brand-word span{display:block;transition:transform .22s ease,opacity .18s ease;}
        .brand-word span:nth-child(2){color:var(--accent);}
        .brand-logo:hover .brand-word span{transform:translateY(-34px);}
        .brand-logo:hover .brand-word::after{animation:brandGlitch .38s steps(2,end) 2;opacity:.82;}
        @keyframes brandGlitch{0%{transform:translateX(0);clip-path:inset(0 0 72% 0);}35%{transform:translateX(3px);clip-path:inset(34% 0 32% 0);}70%{transform:translateX(-2px);clip-path:inset(66% 0 0 0);}100%{transform:translateX(0);clip-path:inset(0 0 65% 0);}}
        .time-account{position:absolute;top:22px;right:24px;z-index:38;min-width:190px;padding:14px 16px 13px;background:rgba(51,60,41,.88);border:1px solid rgba(255,255,255,.2);box-shadow:0 20px 46px rgba(0,0,0,.22),0 0 28px rgba(212,245,71,.08),inset 0 1px 0 rgba(255,255,255,.12);backdrop-filter:blur(14px);}
        .time-account.recover{background:rgba(212,245,71,.94);color:#10140d;border-color:rgba(255,255,255,.38);box-shadow:0 22px 58px rgba(212,245,71,.18),inset 0 1px 0 rgba(255,255,255,.34);}
        .time-account span{display:block;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);line-height:1;}
        .time-account.recover span{color:#354112;}
        .time-account strong{display:block;font-family:'Bebas Neue',sans-serif;font-size:3.15rem;line-height:.9;color:var(--accent);font-weight:400;margin-top:6px;}
        .time-account.recover strong{color:#10140d;}
        .time-account small{display:block;font-size:11px;line-height:1.2;color:rgba(244,239,230,.78);}
        .time-account.recover small{color:#354112;}
        .bg-word{position:absolute;font-family:'Bebas Neue',sans-serif;font-size:min(35vw,320px);color:rgba(255,255,255,.07);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;white-space:nowrap;letter-spacing:-.02em;}
        .eyebrow-top{position:absolute;top:5vh;left:50%;transform:translateX(-50%);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--dim);z-index:20;white-space:nowrap;}
        .hero-prompt{position:absolute;left:clamp(20px,7vw,120px);bottom:9vh;z-index:24;max-width:260px;padding:14px 16px;background:rgba(51,60,41,.78);border:1px solid rgba(212,245,71,.34);box-shadow:0 18px 42px rgba(0,0,0,.22);backdrop-filter:blur(12px);}
        .hero-prompt::after{content:"";position:absolute;right:-54px;top:50%;width:42px;height:1px;background:var(--accent);box-shadow:10px 0 0 var(--accent);animation:promptPulse 1.4s ease-in-out infinite;}
        .hero-prompt span{display:block;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:6px;}
        .hero-prompt strong{display:block;font-size:.88rem;line-height:1.45;color:var(--text);font-weight:700;}
        @keyframes promptPulse{0%,100%{opacity:.45;transform:translateX(0);}50%{opacity:1;transform:translateX(8px);}}

        .phone-wrap{position:absolute;width:100%;height:100%;display:flex;align-items:center;justify-content:center;z-index:5;pointer-events:none;perspective:1500px;perspective-origin:center;--shadow-x:0px;--shadow-y:28px;}
        .phone-cast-shadow{position:absolute;width:min(390px,88vw);height:min(150px,28vh);border-radius:50%;background:radial-gradient(ellipse at center,rgba(0,0,0,.78),rgba(0,0,0,.34) 42%,transparent 72%);filter:blur(18px);transform:translate3d(var(--shadow-x),var(--shadow-y),-130px) rotateX(64deg) scale(.9);opacity:.82;transition:transform .2s ease,opacity .2s ease;}
        .time-particles{position:absolute;top:48%;left:50%;z-index:3;width:min(560px,92vw);height:min(520px,78vh);opacity:0;transform:translate(-50%,-50%);pointer-events:none;transition:opacity .18s ease,transform .18s ease;}
        .time-particles span{position:absolute;display:inline-flex;align-items:center;height:26px;padding:0 10px;background:rgba(212,245,71,.13);border:1px solid rgba(212,245,71,.38);color:var(--accent);font-family:'Bebas Neue',sans-serif;font-size:1.18rem;line-height:1;box-shadow:0 14px 30px rgba(0,0,0,.24);backdrop-filter:blur(10px);animation:floatMinute 2.8s ease-in-out infinite;}
        .time-particles span:nth-child(1){left:12%;top:52%;animation-delay:0s;}
        .time-particles span:nth-child(2){right:14%;top:42%;animation-delay:.2s;}
        .time-particles span:nth-child(3){left:20%;top:24%;animation-delay:.42s;}
        .time-particles span:nth-child(4){right:20%;top:62%;animation-delay:.65s;}
        .time-particles span:nth-child(5){left:7%;top:70%;animation-delay:.85s;}
        .time-particles span:nth-child(6){right:8%;top:22%;animation-delay:1.05s;}
        .time-particles span:nth-child(7){left:38%;top:12%;animation-delay:1.25s;}
        .time-particles span:nth-child(8){right:37%;bottom:8%;animation-delay:1.45s;}
        @keyframes floatMinute{0%,100%{transform:translateY(0) rotate(-2deg);opacity:.72;}50%{transform:translateY(-16px) rotate(3deg);opacity:1;}}
        .phone{position:relative;width:340px;height:734px;background:linear-gradient(115deg,#303226,#171a12 18%,#0b0d08 58%,#25281d);border-radius:44px;border:2px solid rgba(255,255,255,.2);box-shadow:0 0 0 1px rgba(255,255,255,.08),-18px 28px 42px rgba(0,0,0,.34),24px 46px 92px rgba(0,0,0,.74),0 70px 150px rgba(0,0,0,.58),inset 10px 0 18px rgba(255,255,255,.06),inset -14px 0 22px rgba(0,0,0,.5),inset 0 0 0 1px rgba(255,255,255,.05);overflow:hidden;will-change:transform,width,height,border-radius;flex-shrink:0;pointer-events:auto;transform:rotateX(var(--tilt-x,0deg)) rotateY(var(--tilt-y,0deg)) translateZ(32px);transform-style:preserve-3d;transition:transform .2s ease,box-shadow .2s ease,filter .2s ease;}
        .phone::before{content:"";position:absolute;inset:0;border-radius:inherit;z-index:26;pointer-events:none;background:linear-gradient(90deg,rgba(255,255,255,var(--edge-left,.18)),transparent 11%,transparent 84%,rgba(255,255,255,var(--edge-right,.18))),linear-gradient(180deg,rgba(255,255,255,.18),transparent 12%,transparent 84%,rgba(0,0,0,.48));mix-blend-mode:screen;opacity:.42;}
        .phone::after{content:"";position:absolute;inset:10px;border-radius:34px;z-index:25;pointer-events:none;box-shadow:inset 12px 0 18px rgba(255,255,255,.05),inset -18px 0 32px rgba(0,0,0,.62),inset 0 22px 28px rgba(255,255,255,.03),inset 0 -22px 34px rgba(0,0,0,.42);}
        .phone.is-hovered{filter:saturate(1.05) contrast(1.03);box-shadow:0 0 0 1px rgba(255,255,255,.12),-24px 34px 54px rgba(0,0,0,.5),32px 54px 112px rgba(0,0,0,.92),0 85px 170px rgba(0,0,0,.8),0 0 52px rgba(212,245,71,.11),inset 13px 0 20px rgba(255,255,255,.07),inset -18px 0 26px rgba(0,0,0,.62),inset 0 0 0 1px rgba(255,255,255,.06);}
        .phone-glow{position:absolute;inset:-5px;border-radius:49px;border:2px solid var(--accent);opacity:0;pointer-events:none;box-shadow:0 0 25px 5px rgba(212,245,71,.2);}
        .phone-shine{position:absolute;inset:1px;border-radius:inherit;z-index:24;pointer-events:none;opacity:0;background:radial-gradient(circle at var(--glare-x,50%) var(--glare-y,18%),rgba(255,255,255,.28),rgba(212,245,71,.11) 16%,rgba(255,255,255,.04) 31%,transparent 48%);mix-blend-mode:screen;transition:opacity .18s ease;}
        .phone.is-hovered .phone-shine{opacity:.9;}
        .island{position:absolute;top:12px;left:50%;transform:translateX(-50%);width:90px;height:28px;background:#0a0a08;border-radius:14px;z-index:30;display:flex;align-items:center;justify-content:center;}
        .island-cam{width:8px;height:8px;border-radius:50%;background:#1a1a18;border:1px solid #2a2a28;}
        .screen{position:absolute;inset:0;overflow:hidden;border-radius:inherit;}
        .screen-layer{position:absolute;inset:0;opacity:0;pointer-events:none;will-change:opacity;}

        /* Feed */
        .status-bar{position:absolute;top:0;left:0;right:0;height:48px;display:flex;align-items:flex-end;justify-content:space-between;padding:0 20px 6px;z-index:10;background:linear-gradient(to bottom,#202619,transparent);}
        .status-time{font-size:13px;font-weight:500;}
        .status-icons{display:flex;gap:5px;align-items:center;font-size:11px;}
        .notify-dot{display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:50%;background:var(--accent);color:#10140d;font-size:9px;font-weight:800;}
        .feed-scroll{position:absolute;top:48px;left:0;right:0;bottom:60px;overflow:hidden;padding-top:122px;}
        .feed-chrome{position:absolute;top:0;left:0;right:0;z-index:8;background:linear-gradient(to bottom,#202619 78%,rgba(32,38,25,.86));border-bottom:1px solid rgba(255,255,255,.07);}
        .insta-head{height:36px;display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:12px;padding:0 14px;font-size:14px;}
        .insta-head strong{font-family:'Bebas Neue',sans-serif;font-size:1.55rem;letter-spacing:.02em;color:var(--text);font-weight:400;}
        .insta-head span{font-size:14px;color:var(--text);opacity:.86;}
        .head-heart{position:relative;display:inline-flex;}
        .head-heart i{position:absolute;right:-8px;top:-8px;display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;background:#d4f547;color:#10140d;font-style:normal;font-size:8px;font-weight:900;}
        .feed-trap-note{margin:0 10px 6px;padding:7px 9px;display:flex;align-items:center;gap:8px;border:1px solid rgba(212,245,71,.22);background:rgba(212,245,71,.08);border-radius:8px;}
        .feed-trap-note span{font-size:8px;text-transform:uppercase;letter-spacing:.12em;color:#10140d;background:var(--accent);border-radius:99px;padding:3px 6px;font-weight:900;}
        .feed-trap-note strong{font-size:10px;color:rgba(247,242,232,.8);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .story-row{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;padding:8px 10px 10px;}
        .story-chip{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0;}
        .story-chip span{width:38px;height:38px;border-radius:50%;background-size:cover;background-position:center;box-shadow:inset 0 0 0 3px #202619,0 0 0 1px rgba(212,245,71,.7);}
        .story-chip small{font-size:9px;color:var(--dim);max-width:48px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .feed-inner{will-change:transform;}
        .fpost{position:relative;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.05);overflow:hidden;transition:background .18s ease,transform .18s ease,border-color .18s ease;}
        .fpost::before{content:"";position:absolute;inset:0;background:linear-gradient(115deg,rgba(212,245,71,.12),transparent 42%);opacity:0;pointer-events:none;transition:opacity .18s ease;}
        .fpost.is-sponsored{background:rgba(212,245,71,.035);}
        .fpost:hover{background:rgba(255,255,255,.035);border-color:rgba(212,245,71,.22);transform:translateY(-1px);}
        .fpost:hover::before{opacity:1;}
        .fpost-cost{position:absolute;top:10px;right:12px;z-index:3;display:flex;flex-direction:column;align-items:flex-end;gap:1px;padding:7px 8px;border-radius:8px;background:rgba(10,10,8,.76);border:1px solid rgba(212,245,71,.3);box-shadow:0 10px 24px rgba(0,0,0,.35);opacity:0;transform:translateY(-6px) scale(.96);transition:opacity .18s ease,transform .18s ease;backdrop-filter:blur(10px);}
        .fpost:hover .fpost-cost{opacity:1;transform:translateY(0) scale(1);}
        .fpost-cost span{font-family:'Bebas Neue',sans-serif;font-size:1.15rem;line-height:1;color:var(--accent);}
        .fpost-cost small{font-size:9px;line-height:1.15;color:var(--dim);white-space:nowrap;}
        .fpost-top{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
        .favatar{width:30px;height:30px;border-radius:50%;flex-shrink:0;background-size:cover;background-position:center;box-shadow:0 0 0 2px rgba(32,38,25,.92),0 0 0 3px rgba(212,245,71,.65);}
        .fnames{flex:1;}
        .fuser{font-size:11px;font-weight:700;color:var(--text);line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .fplace{margin-top:2px;font-size:9px;color:rgba(247,242,232,.56);line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .sponsored-pill{font-size:8px;line-height:1;text-transform:uppercase;letter-spacing:.08em;padding:5px 6px;border-radius:99px;background:rgba(212,245,71,.14);border:1px solid rgba(212,245,71,.34);color:var(--accent);font-weight:900;}
        .fdots{font-size:14px;line-height:1;color:rgba(247,242,232,.72);letter-spacing:1px;transform:translateY(-3px);}
        .fimg{position:relative;width:100%;border-radius:9px;overflow:hidden;background-color:#25271f;background-size:cover;background-position:center;box-shadow:0 14px 28px rgba(0,0,0,.24),inset 0 0 0 1px rgba(255,255,255,.08);transition:transform .18s ease,filter .18s ease,box-shadow .18s ease;}
        .fimg::before{content:"";position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,.16),transparent 34%),linear-gradient(to top,rgba(0,0,0,.42),transparent 48%);pointer-events:none;}
        .fimg::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 22% 12%,rgba(255,255,255,.24),transparent 22%);mix-blend-mode:screen;opacity:.42;pointer-events:none;}
        .fpost:hover .fimg{transform:scale(1.015);filter:saturate(1.08) contrast(1.04);box-shadow:0 18px 34px rgba(0,0,0,.28),0 0 24px rgba(212,245,71,.08),inset 0 0 0 1px rgba(255,255,255,.1);}
        .feed-pressure{position:absolute;left:9px;right:9px;bottom:9px;z-index:3;padding:8px 9px;border-radius:8px;background:rgba(8,10,6,.76);border:1px solid rgba(212,245,71,.28);backdrop-filter:blur(10px);box-shadow:0 12px 28px rgba(0,0,0,.26);}
        .feed-pressure small{display:block;font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:2px;}
        .feed-pressure strong{display:block;font-size:11px;line-height:1.2;color:var(--text);font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .reel-play{position:absolute;left:50%;top:50%;z-index:3;width:46px;height:46px;border-radius:50%;transform:translate(-50%,-50%);background:rgba(8,10,6,.52);border:1px solid rgba(255,255,255,.28);box-shadow:0 16px 34px rgba(0,0,0,.34);backdrop-filter:blur(9px);}
        .reel-play::before{content:"";position:absolute;left:19px;top:14px;width:0;height:0;border-top:9px solid transparent;border-bottom:9px solid transparent;border-left:14px solid rgba(247,242,232,.9);}
        .reel-side{position:absolute;right:9px;top:50%;z-index:3;display:flex;flex-direction:column;gap:9px;transform:translateY(-50%);}
        .reel-side span{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(8,10,6,.52);border:1px solid rgba(255,255,255,.18);font-size:13px;}
        .reel-progress{position:absolute;left:9px;right:9px;bottom:5px;z-index:4;height:2px;border-radius:99px;background:rgba(255,255,255,.22);overflow:hidden;}
        .reel-progress span{display:block;width:58%;height:100%;background:var(--accent);animation:reelProgress 2.2s linear infinite;}
        @keyframes reelProgress{0%{transform:translateX(-110%);}100%{transform:translateX(180%);}}
        .factions{display:grid;grid-template-columns:auto auto auto 1fr;gap:11px;margin-top:9px;align-items:center;font-size:15px;line-height:1;color:rgba(247,242,232,.9);}
        .fsave{justify-self:end;}
        .fmeta-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:7px;}
        .flikes{font-size:10px;font-weight:700;color:var(--text);line-height:1;}
        .fcounts{font-size:9px;color:rgba(247,242,232,.48);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .fcaption{display:flex;gap:5px;align-items:baseline;margin-top:7px;font-size:10px;line-height:1.35;color:rgba(247,242,232,.72);}
        .fcaption strong{color:var(--text);font-size:10px;}
        .fcaption span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .fpost-index{margin-top:6px;font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:rgba(212,245,71,.62);}
        .app-nav{position:absolute;bottom:0;left:0;right:0;height:60px;background:rgba(32,38,25,.92);border-top:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:space-around;padding-bottom:8px;}
        .nav-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.3);}
        .nav-dot.active{background:var(--accent);}

        /* Reveal */
        .reveal-layer{position:absolute;inset:0;background:#202619;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;text-align:center;overflow:hidden;}
        .reveal-layer::before{content:"";position:absolute;inset:-20%;background:linear-gradient(rgba(212,245,71,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(212,245,71,.05) 1px,transparent 1px);background-size:12px 12px;opacity:.65;transform:rotate(-8deg) scale(1.1);animation:screenFreeze 1.6s steps(3,end) infinite;}
        .reveal-layer::after{content:"";position:absolute;inset:0;background:linear-gradient(to bottom,transparent,rgba(0,0,0,.22) 48%,transparent 52%),radial-gradient(circle at 50% 44%,rgba(212,245,71,.15),transparent 38%);opacity:.82;pointer-events:none;}
        @keyframes screenFreeze{0%,100%{transform:rotate(-8deg) translateY(0) scale(1.1);}50%{transform:rotate(-8deg) translateY(10px) scale(1.1);}}
        .reveal-eye,.reveal-big,.reveal-sub,.reveal-memory,.reveal-pill{position:relative;z-index:2;}
        .reveal-eye{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--dim);margin-bottom:16px;}
        .reveal-big{font-family:'Bebas Neue',sans-serif;font-size:clamp(3rem,14vw,5.5rem);line-height:.9;letter-spacing:-.02em;margin-bottom:8px;}
        .km{color:var(--accent);}
        .reveal-sub{font-family:'DM Serif Display',serif;font-style:italic;font-size:clamp(.9rem,3.5vw,1.1rem);color:var(--dim);margin-bottom:28px;line-height:1.5;}
        .reveal-memory{display:grid;grid-template-columns:1fr 1fr;gap:6px;width:100%;margin-bottom:18px;}
        .reveal-memory span{border:1px solid rgba(212,245,71,.22);background:rgba(212,245,71,.08);border-radius:8px;padding:9px 6px;font-size:10px;color:rgba(247,242,232,.8);}
        .reveal-pill{display:inline-block;background:var(--accent);color:#0a0a08;font-weight:600;font-size:13px;border-radius:99px;padding:10px 24px;}

        /* Calc layer */
        .calc-layer{position:absolute;inset:0;background:#202619;display:flex;flex-direction:column;overflow:hidden;}
        .calc-header{padding:56px 20px 16px;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0;}
        .calc-eyebrow{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:6px;}
        .calc-title{font-family:'DM Serif Display',serif;font-size:1.3rem;line-height:1.3;}
        .calc-scroll{flex:1;overflow-y:auto;padding:16px 20px 80px;scrollbar-width:none;}
        .calc-scroll::-webkit-scrollbar{display:none;}
        .ph-slider-row{display:flex;align-items:baseline;gap:8px;margin-bottom:8px;}
        .ph-val{font-family:'Bebas Neue',sans-serif;font-size:3.5rem;color:var(--accent);line-height:1;}
        .ph-unit{font-size:.8rem;color:var(--dim);}
        .ph-range{width:100%;height:3px;-webkit-appearance:none;background:rgba(255,255,255,.1);border-radius:2px;outline:none;cursor:pointer;margin-bottom:4px;display:block;}
        .ph-range::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;background:var(--accent);border-radius:50%;}
        .range-ends{display:flex;justify-content:space-between;font-size:10px;color:var(--dim);margin-bottom:16px;}
        .ph-stats{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:16px;}
        .ph-stat{background:#343c29;border-radius:10px;padding:12px 10px;}
        .ph-stat.hl{background:#3a4824;}
        .ph-stat.hl .ph-sn{color:var(--accent);}
        .ph-sn{font-family:'Bebas Neue',sans-serif;font-size:2rem;line-height:1;margin-bottom:2px;}
        .ph-sl{font-size:10px;font-weight:500;margin-bottom:1px;}
        .ph-ss{font-size:9px;color:var(--dim);}
        .ph-alt-title{font-size:11px;font-weight:500;color:var(--dim);letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px;}
        .ph-alts{display:flex;flex-direction:column;gap:6px;}
        .ph-alt{background:#343c29;border-radius:10px;padding:12px;display:flex;align-items:flex-start;gap:10px;cursor:pointer;transition:background .18s ease,border-color .18s ease,transform .18s ease,box-shadow .18s ease;border:1px solid transparent;}
        .ph-alt:hover,.ph-alt.active{background:#3f4931;border-color:var(--accent);transform:translateX(3px);box-shadow:0 14px 30px rgba(0,0,0,.2);}
        .ph-alt-e{font-size:1.4rem;flex-shrink:0;width:32px;text-align:center;line-height:1.2;transition:transform .18s ease;}
        .ph-alt:hover .ph-alt-e,.ph-alt.active .ph-alt-e{transform:scale(1.12);}
        .ph-alt-body{flex:1;}
        .ph-alt-name{font-size:.85rem;font-weight:500;margin-bottom:2px;}
        .ph-alt-desc{font-size:.75rem;color:var(--dim);line-height:1.4;}
        .ph-alt-earned{max-height:0;overflow:hidden;opacity:0;transform:translateY(-4px);font-size:.75rem;color:var(--accent);margin-top:0;font-weight:500;line-height:1.35;transition:max-height .2s ease,opacity .18s ease,transform .18s ease,margin-top .18s ease;}
        .ph-alt:hover .ph-alt-earned,.ph-alt.active .ph-alt-earned{max-height:36px;opacity:1;transform:translateY(0);margin-top:4px;}
        .ph-alt-arr{font-size:.9rem;color:var(--dim);flex-shrink:0;transition:color .18s ease,transform .18s ease;}
        .ph-alt:hover .ph-alt-arr,.ph-alt.active .ph-alt-arr{color:var(--accent);transform:rotate(-45deg);}
        .calc-cta{position:absolute;bottom:0;left:0;right:0;padding:12px 20px 24px;background:linear-gradient(to top,#202619 70%,transparent);}
        .calc-cta-btn{display:block;width:100%;background:var(--accent);color:#10120d;border:none;border-radius:99px;padding:14px;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;text-align:center;text-decoration:none;box-shadow:0 14px 34px rgba(212,245,71,.22);transition:transform .18s ease,box-shadow .18s ease;}
        .calc-cta-btn:hover{transform:translateY(-1px);box-shadow:0 18px 44px rgba(212,245,71,.3);}

        .scroll-hint{position:absolute;bottom:5vh;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;z-index:20;transition:opacity .4s;}
        .scroll-hint span{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--dim);}
        .hint-line{width:1px;height:38px;background:linear-gradient(to bottom,var(--dim),transparent);animation:hintAnim 1.5s ease-in-out infinite;}
        @keyframes hintAnim{0%,100%{opacity:1;transform:scaleY(1);}50%{opacity:.3;transform:scaleY(.5);}}

        /* Below sections */
        .recall-break{position:relative;padding:5.5rem 2rem;background:linear-gradient(135deg,#dfe8c7 0%,#edf3dc 48%,#cddcad 100%);color:#10140d;overflow:hidden;border-top:1px solid rgba(16,20,13,.12);}
        .recall-break::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(16,20,13,.05) 1px,transparent 1px),linear-gradient(rgba(16,20,13,.04) 1px,transparent 1px);background-size:22px 22px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.65),transparent 72%);}
        .recall-inner{position:relative;z-index:1;max-width:920px;margin:0 auto;}
        .recall-strip{display:flex;gap:8px;margin-bottom:2rem;transform:rotate(-1.5deg);}
        .recall-strip span{width:clamp(44px,8vw,74px);aspect-ratio:1;border-radius:8px;background-size:cover;background-position:center;box-shadow:0 10px 26px rgba(35,43,26,.18);filter:saturate(.55) contrast(.96);}
        .recall-strip span:nth-child(even){transform:translateY(18px) rotate(3deg);}
        .recall-kicker{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#4d5c34;font-weight:900;margin-bottom:14px;}
        .recall-break h2{font-family:'DM Serif Display',serif;font-size:clamp(2.2rem,6vw,5.4rem);line-height:1.02;letter-spacing:0;max-width:900px;margin-bottom:20px;}
        .recall-break p{max-width:620px;font-size:1rem;line-height:1.75;color:#4d5b39;margin-bottom:28px;}
        .recall-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;max-width:720px;}
        .recall-grid div{border:1px solid rgba(16,20,13,.12);background:rgba(255,255,255,.34);border-radius:10px;padding:18px 16px;box-shadow:0 18px 46px rgba(40,50,30,.1);}
        .recall-grid strong{display:block;font-family:'Bebas Neue',sans-serif;font-size:3.2rem;line-height:.9;color:#10140d;font-weight:400;}
        .recall-grid span{display:block;margin-top:8px;font-size:.82rem;color:#52613c;}
        .truth{padding:5rem 2rem;border-top:1px solid rgba(255,255,255,.12);background:#252c1d;}
        .truth-inner{max-width:700px;margin:0 auto;border-left:3px solid var(--accent2);padding-left:2rem;}
        .truth-q{font-family:'DM Serif Display',serif;font-size:clamp(1.2rem,3vw,2rem);line-height:1.5;margin-bottom:2rem;}
        .truth-row{display:flex;flex-wrap:wrap;gap:2rem;}
        .truth-s{display:flex;flex-direction:column;gap:.4rem;}
        .truth-n{font-family:'Bebas Neue',sans-serif;font-size:2.5rem;color:var(--accent2);line-height:1;}
        .truth-d{font-size:.85rem;color:var(--dim);max-width:160px;line-height:1.4;}

        .challenge{padding:5rem 2rem;border-top:1px solid rgba(255,255,255,.12);background:#293120;}
        .ch-inner{max-width:700px;margin:0 auto;}
        .ch-eyebrow{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem;}
        .ch-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(3rem,8vw,6rem);line-height:.9;letter-spacing:-.02em;margin-bottom:1.5rem;}
        .ch-accent{color:var(--accent);}
        .ch-body{font-size:.95rem;color:var(--dim);line-height:1.7;margin-bottom:2rem;}
        .ch-box{border:1px solid rgba(255,255,255,.16);border-radius:12px;padding:1.5rem;background:#343c29;}
        .ch-list{list-style:none;display:flex;flex-direction:column;gap:.7rem;}
        .ch-list li{font-size:.9rem;color:var(--dim);padding-left:1.25rem;position:relative;}
        .ch-list li::before{content:"→";position:absolute;left:0;color:var(--accent);}
        .ch-cta{display:inline-flex;align-items:center;justify-content:center;margin-top:1.25rem;background:var(--accent);color:#10120d;text-decoration:none;border-radius:99px;padding:12px 20px;font-size:.9rem;font-weight:700;box-shadow:0 14px 34px rgba(212,245,71,.2);transition:transform .18s ease,box-shadow .18s ease;}
        .ch-cta:hover{transform:translateY(-1px);box-shadow:0 18px 44px rgba(212,245,71,.28);}

        .site-footer{padding:3rem 2rem;border-top:1px solid rgba(255,255,255,.12);background:#202619;}
        .footer-inner{max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:.75rem;}
        .footer-logo{font-family:'Bebas Neue',sans-serif;font-size:2rem;color:var(--accent);letter-spacing:.05em;}
        .footer-text{font-size:.8rem;color:var(--dim);line-height:1.7;}
        @media (max-width:700px){
          .brand-logo{top:16px;left:16px;height:38px;padding:3px 8px 3px 3px;}
          .brand-badge{width:28px;height:32px;padding:4px;}
          .brand-phone{width:10px;height:15px;}
          .brand-word{width:136px;height:27px;font-size:2rem;margin-left:7px;}
          .brand-logo:hover .brand-word span{transform:translateY(-27px);}
          .time-account{top:62px;right:16px;bottom:auto;min-width:150px;padding:10px 12px;}
          .time-account strong{font-size:2.25rem;}
          .time-account small{font-size:9px;}
          .hero-prompt{left:16px;right:16px;bottom:8vh;max-width:none;}
          .hero-prompt::after{display:none;}
          .time-particles{width:100vw;height:70vh;}
          .time-particles span{font-size:1rem;height:23px;}
          .eyebrow-top{top:112px;width:100%;padding:0 16px;text-align:center;white-space:normal;line-height:1.5;}
          .recall-grid{grid-template-columns:1fr;}
          .recall-break{padding:4rem 1.1rem;}
        }
      `}</style>
    </main>
  );
}
