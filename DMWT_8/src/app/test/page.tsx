"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import CreatedBy from "@/components/CreatedBy";

const POSTS = [
  { av: "#3a3a38", nw: 62, ih: 44, lw: 32 },
  { av: "#2e4a3e", nw: 78, ih: 68, lw: 26 },
  { av: "#4a2e2e", nw: 52, ih: 52, lw: 36 },
  { av: "#2e3a4a", nw: 70, ih: 58, lw: 22 },
  { av: "#3a4a2e", nw: 58, ih: 76, lw: 30 },
  { av: "#4a3a2e", nw: 66, ih: 48, lw: 34 },
  { av: "#2e2e4a", nw: 74, ih: 62, lw: 24 },
  { av: "#3a2e4a", nw: 48, ih: 38, lw: 40 },
];

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

export default function Home() {
  const [hours, setHours] = useState(2);
  const [activeAlt, setActiveAlt] = useState<number | null>(null);

  const storyRef     = useRef<HTMLDivElement>(null);
  const phoneRef     = useRef<HTMLDivElement>(null);
  const glowRef      = useRef<HTMLDivElement>(null);
  const feedInnerRef = useRef<HTMLDivElement>(null);
  const layerFeedRef = useRef<HTMLDivElement>(null);
  const layerRevRef  = useRef<HTMLDivElement>(null);
  const layerCalcRef = useRef<HTMLDivElement>(null);
  const hintRef      = useRef<HTMLDivElement>(null);
  const bgWordRef    = useRef<HTMLDivElement>(null);
  const feedYRef     = useRef(0);
  const feedSpeedRef = useRef(0.6);
  const rafRef       = useRef<number>(0);

  const yr = Math.round(hours * 365);
  const thumbKm = ((hours * 60 * 20) / 1000).toFixed(1);

  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp(t, 0, 1);
  const phase = (p: number, s: number, e: number) => clamp((p - s) / (e - s), 0, 1);

  const setLayers = useCallback((feed: number, reveal: number, calc: number) => {
    if (layerFeedRef.current) { layerFeedRef.current.style.opacity = String(feed); layerFeedRef.current.style.pointerEvents = feed > 0.5 ? "auto" : "none"; }
    if (layerRevRef.current)  layerRevRef.current.style.opacity  = String(reveal);
    if (layerCalcRef.current) { layerCalcRef.current.style.opacity = String(calc);  layerCalcRef.current.style.pointerEvents = calc > 0.5 ? "auto" : "none"; }
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

    const pA = phase(p, 0, 0.30);
    const pB = phase(p, 0.30, 0.50);
    const pD = phase(p, 0.65, 0.80);

    const growE  = easeInOut(pA);
    const maxW   = Math.min(VW, VH / 2.16);
    const maxH   = maxW * 2.16;
    const tgtW   = Math.min(340, VW * 0.85);
    const tgtH   = tgtW * 2.16;

    let phoneW = lerp(lerp(340, maxW, growE), tgtW, easeOut(pD));
    let phoneH = lerp(lerp(734, maxH, growE), tgtH, easeOut(pD));
    let phoneBR = lerp(lerp(44, 0, growE), 44, easeOut(pD));

    phone.style.width        = phoneW + "px";
    phone.style.height       = phoneH + "px";
    phone.style.borderRadius = phoneBR + "px";

    if (glowRef.current) {
      glowRef.current.style.opacity      = String(easeInOut(phase(p, 0.25, 0.45)) * (1 - easeOut(phase(p, 0.55, 0.70))));
      glowRef.current.style.borderRadius = (phoneBR + 6) + "px";
    }

    feedSpeedRef.current = lerp(0.6, 5, pB * (1 - phase(p, 0.55, 0.75)));

    if (p < 0.28) {
      setLayers(1, 0, 0);
    } else if (p < 0.52) {
      const t = phase(p, 0.28, 0.52);
      setLayers(lerp(1, 0.2, easeOut(t)), easeOut(t) * 0.95, 0);
    } else if (p < 0.62) {
      setLayers(0.1, 0.95, 0);
    } else if (p < 0.78) {
      const t = phase(p, 0.62, 0.78);
      setLayers(0, lerp(0.95, 0, easeOut(t)), easeOut(t));
    } else {
      setLayers(0, 0, 1);
    }
  }, [setLayers]);

  useEffect(() => {
    const tick = () => {
      const el = feedInnerRef.current;
      if (el) {
        feedYRef.current -= feedSpeedRef.current;
        const h = el.scrollHeight / 3;
        if (Math.abs(feedYRef.current) >= h) feedYRef.current = 0;
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
    <main className="main">
      

      {/* ═══ STORY HERO ═══ */}
      <div className="story" ref={storyRef}>
        <div className="sticky">
          <div className="bg-word" ref={bgWordRef}>SCROLL</div>
          <div className="eyebrow-top">Eine Kampagne gegen die stille Zeitverschwendung
            
          </div>
          

          <div className="phone-wrap">
            <div className="phone" ref={phoneRef}>
              <div className="phone-glow" ref={glowRef} />
              <div className="island"><div className="island-cam" /></div>
              <div className="screen">

                {/* Layer 0: Feed */}
                <div className="screen-layer" ref={layerFeedRef} style={{ opacity: 1, pointerEvents: "auto" }}>
                  <div className="status-bar">
                    <span className="status-time">9:41</span>
                    <div className="status-icons"><span>●●●</span><span>WiFi</span><span>🔋</span></div>
                  </div>
                  <div className="feed-scroll">
                    <div className="feed-inner" ref={feedInnerRef}>
                      {allPosts.map((p, i) => (
                        <div key={i} className="fpost">
                          <div className="fpost-top">
                            <div className="favatar" style={{ background: p.av, width: 28, height: 28, borderRadius: "50%" }} />
                            <div className="fnames">
                              <div className="fname" style={{ width: `${p.nw}%` }} />
                              <div className="fsub"  style={{ width: `${p.nw * 0.6}%` }} />
                            </div>
                          </div>
                          <div className="fimg" style={{ height: p.ih }} />
                          <div className="factions">
                            <span className="fheart">♡</span>
                            <div className="faction" style={{ width: `${p.lw}%` }} />
                            <div className="faction" style={{ width: "20%" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="app-nav">
                    <div className="nav-dot active" /><div className="nav-dot" /><div className="nav-dot" /><div className="nav-dot" />
                  </div>
                </div>

                {/* Layer 1: Reveal */}
                <div className="screen-layer" ref={layerRevRef}>
                  <div className="reveal-layer">
                    <div className="reveal-eye">Dein Daumen hat schon</div>
                    <div className="reveal-big"><span className="km">{thumbKm}</span><br />km</div>
                    <div className="reveal-sub">zurückgelegt.<br />Aber wie weit bist <em>du</em> gekommen?</div>
                    <div className="reveal-pill">Weiter scrollen ↓</div>
                  </div>
                </div>

                {/* Layer 2: Calculator */}
                <div className="screen-layer" ref={layerCalcRef}>
                  <div className="calc-layer">
                    <div className="calc-header">
                      <div className="calc-eyebrow">// Rechne nach</div>
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
                                  {isAct && <div className="ph-alt-earned">{earned}× mit {yr}h/Jahr machbar</div>}
                                </div>
                                <div className="ph-alt-arr">{isAct ? "↑" : "›"}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="calc-cta">
                      <button className="calc-cta-btn">7-Tage-Challenge starten</button>
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

      {/* ═══ TRUTH ═══ */}
      <section className="truth">
        <div className="truth-inner">
          <div className="truth-q">"Die Apps sind dafür gebaut, dich <strong>nicht loszulassen</strong>. Jedes Mal wenn du scrollst, wird ein Algorithmus klüger. Du nicht."</div>
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
          <h2 className="ch-title">Dein Daumen<br />kann warten.<br /><span className="ch-accent">Du nicht.</span></h2>
          <p className="ch-body">Leg das Handy weg. Nicht für immer. Aber heute, für eine Stunde. Schau wie weit du kommst.</p>
          <div className="ch-box">
            <div style={{ fontWeight: 500, marginBottom: "1rem", fontSize: ".95rem" }}>📵 Die 7-Tage-Challenge</div>
            <ul className="ch-list">
              <li>Handy nach 21 Uhr in eine Schublade</li>
              <li>Social-Media-Apps aus dem Homescreen</li>
              <li>Jeden Abend eine Alternative aus der Liste</li>
              <li>Am Ende: Notiere wie du dich fühlst</li>
            </ul>
          </div>
        </div>
      </section>

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
        :root{--bg:#0a0a08;--bg2:#111110;--bg3:#1a1a18;--text:#f0ede6;--dim:#6a6860;--accent:#d4f547;--accent2:#f5a623;}
        html{scroll-behavior:smooth;}
        body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;overflow-x:hidden;}
        .main{width:100%;}

        .story{position:relative;height:500vh;}
        .sticky{position:sticky;top:0;height:100vh;overflow:hidden;display:flex;align-items:center;justify-content:center;background:var(--bg);}
        .bg-word{position:absolute;font-family:'Bebas Neue',sans-serif;font-size:min(35vw,320px);color:rgba(255,255,255,.022);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;white-space:nowrap;letter-spacing:-.02em;}
        .eyebrow-top{position:absolute;top:5vh;left:50%;transform:translateX(-50%);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--dim);z-index:20;white-space:nowrap;}

        .phone-wrap{position:absolute;width:100%;height:100%;display:flex;align-items:center;justify-content:center;z-index:5;pointer-events:none;}
        .phone{position:relative;width:340px;height:734px;background:#111110;border-radius:44px;border:2px solid rgba(255,255,255,.15);box-shadow:0 0 0 1px rgba(255,255,255,.04),0 40px 120px rgba(0,0,0,.9),inset 0 0 0 1px rgba(255,255,255,.03);overflow:hidden;will-change:transform,width,height,border-radius;flex-shrink:0;}
        .phone-glow{position:absolute;inset:-5px;border-radius:49px;border:2px solid var(--accent);opacity:0;pointer-events:none;box-shadow:0 0 25px 5px rgba(212,245,71,.2);}
        .island{position:absolute;top:12px;left:50%;transform:translateX(-50%);width:90px;height:28px;background:#0a0a08;border-radius:14px;z-index:30;display:flex;align-items:center;justify-content:center;}
        .island-cam{width:8px;height:8px;border-radius:50%;background:#1a1a18;border:1px solid #2a2a28;}
        .screen{position:absolute;inset:0;overflow:hidden;border-radius:inherit;}
        .screen-layer{position:absolute;inset:0;opacity:0;pointer-events:none;will-change:opacity;}

        /* Feed */
        .status-bar{position:absolute;top:0;left:0;right:0;height:48px;display:flex;align-items:flex-end;justify-content:space-between;padding:0 20px 6px;z-index:10;background:linear-gradient(to bottom,#0d0d0b,transparent);}
        .status-time{font-size:13px;font-weight:500;}
        .status-icons{display:flex;gap:5px;align-items:center;font-size:11px;}
        .feed-scroll{position:absolute;top:48px;left:0;right:0;bottom:60px;overflow:hidden;}
        .feed-inner{will-change:transform;}
        .fpost{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.05);}
        .fpost-top{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
        .fnames{flex:1;}
        .fname{height:7px;border-radius:3px;background:rgba(255,255,255,.2);margin-bottom:4px;}
        .fsub{height:5px;border-radius:3px;background:rgba(255,255,255,.1);}
        .fimg{width:100%;border-radius:8px;background:rgba(255,255,255,.05);}
        .factions{display:flex;gap:12px;margin-top:8px;align-items:center;}
        .faction{height:5px;border-radius:3px;background:rgba(255,255,255,.1);}
        .fheart{font-size:14px;opacity:.6;}
        .app-nav{position:absolute;bottom:0;left:0;right:0;height:60px;background:rgba(13,13,11,.9);border-top:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-around;padding-bottom:8px;}
        .nav-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.3);}
        .nav-dot.active{background:var(--accent);}

        /* Reveal */
        .reveal-layer{position:absolute;inset:0;background:#0a0a08;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;text-align:center;}
        .reveal-eye{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--dim);margin-bottom:16px;}
        .reveal-big{font-family:'Bebas Neue',sans-serif;font-size:clamp(3rem,14vw,5.5rem);line-height:.9;letter-spacing:-.02em;margin-bottom:8px;}
        .km{color:var(--accent);}
        .reveal-sub{font-family:'DM Serif Display',serif;font-style:italic;font-size:clamp(.9rem,3.5vw,1.1rem);color:var(--dim);margin-bottom:28px;line-height:1.5;}
        .reveal-pill{display:inline-block;background:var(--accent);color:#0a0a08;font-weight:600;font-size:13px;border-radius:99px;padding:10px 24px;}

        /* Calc layer */
        .calc-layer{position:absolute;inset:0;background:#0a0a08;display:flex;flex-direction:column;overflow:hidden;}
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
        .ph-stat{background:#1a1a18;border-radius:10px;padding:12px 10px;}
        .ph-stat.hl{background:#1e2414;}
        .ph-stat.hl .ph-sn{color:var(--accent);}
        .ph-sn{font-family:'Bebas Neue',sans-serif;font-size:2rem;line-height:1;margin-bottom:2px;}
        .ph-sl{font-size:10px;font-weight:500;margin-bottom:1px;}
        .ph-ss{font-size:9px;color:var(--dim);}
        .ph-alt-title{font-size:11px;font-weight:500;color:var(--dim);letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px;}
        .ph-alts{display:flex;flex-direction:column;gap:6px;}
        .ph-alt{background:#1a1a18;border-radius:10px;padding:12px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:background .15s;border:1px solid transparent;}
        .ph-alt:hover,.ph-alt.active{background:#222218;border-color:var(--accent);}
        .ph-alt-e{font-size:1.4rem;flex-shrink:0;width:32px;text-align:center;}
        .ph-alt-body{flex:1;}
        .ph-alt-name{font-size:.85rem;font-weight:500;margin-bottom:2px;}
        .ph-alt-desc{font-size:.75rem;color:var(--dim);line-height:1.4;}
        .ph-alt-earned{font-size:.75rem;color:var(--accent);margin-top:4px;font-weight:500;}
        .ph-alt-arr{font-size:.9rem;color:var(--dim);flex-shrink:0;}
        .calc-cta{position:absolute;bottom:0;left:0;right:0;padding:12px 20px 24px;background:linear-gradient(to top,#0a0a08 70%,transparent);}
        .calc-cta-btn{width:100%;background:var(--accent);color:#0a0a08;border:none;border-radius:99px;padding:14px;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;}

        .scroll-hint{position:absolute;bottom:5vh;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;z-index:20;transition:opacity .4s;}
        .scroll-hint span{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--dim);}
        .hint-line{width:1px;height:38px;background:linear-gradient(to bottom,var(--dim),transparent);animation:hintAnim 1.5s ease-in-out infinite;}
        @keyframes hintAnim{0%,100%{opacity:1;transform:scaleY(1);}50%{opacity:.3;transform:scaleY(.5);}}

        /* Below sections */
        .truth{padding:5rem 2rem;border-top:1px solid rgba(255,255,255,.06);}
        .truth-inner{max-width:700px;margin:0 auto;border-left:3px solid var(--accent2);padding-left:2rem;}
        .truth-q{font-family:'DM Serif Display',serif;font-size:clamp(1.2rem,3vw,2rem);line-height:1.5;margin-bottom:2rem;}
        .truth-row{display:flex;flex-wrap:wrap;gap:2rem;}
        .truth-s{display:flex;flex-direction:column;gap:.4rem;}
        .truth-n{font-family:'Bebas Neue',sans-serif;font-size:2.5rem;color:var(--accent2);line-height:1;}
        .truth-d{font-size:.85rem;color:var(--dim);max-width:160px;line-height:1.4;}

        .challenge{padding:5rem 2rem;border-top:1px solid rgba(255,255,255,.06);}
        .ch-inner{max-width:700px;margin:0 auto;}
        .ch-eyebrow{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem;}
        .ch-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(3rem,8vw,6rem);line-height:.9;letter-spacing:-.02em;margin-bottom:1.5rem;}
        .ch-accent{color:var(--accent);}
        .ch-body{font-size:.95rem;color:var(--dim);line-height:1.7;margin-bottom:2rem;}
        .ch-box{border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:1.5rem;background:#111110;}
        .ch-list{list-style:none;display:flex;flex-direction:column;gap:.7rem;}
        .ch-list li{font-size:.9rem;color:var(--dim);padding-left:1.25rem;position:relative;}
        .ch-list li::before{content:"→";position:absolute;left:0;color:var(--accent);}

        .site-footer{padding:3rem 2rem;border-top:1px solid rgba(255,255,255,.06);}
        .footer-inner{max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:.75rem;}
        .footer-logo{font-family:'Bebas Neue',sans-serif;font-size:2rem;color:var(--accent);letter-spacing:.05em;}
        .footer-text{font-size:.8rem;color:var(--dim);line-height:1.7;}
      `}</style>
    </main>
  );
}







