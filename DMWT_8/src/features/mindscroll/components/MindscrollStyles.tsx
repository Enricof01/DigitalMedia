export default function MindscrollStyles() {
  return (
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{--bg:#202619;--bg2:#293020;--bg3:#343c29;--text:#f7f2e8;--dim:#b8b09c;--accent:#d4f547;--accent2:#d4f547;}
        html{scroll-behavior:smooth;}
        body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;overflow-x:hidden;}
        .main{width:100%;}
        #recall,#impact,#survey,#footer{scroll-margin-top:24px;}

        .story{position:relative;height:820vh;}
        .sticky{position:sticky;top:0;height:100vh;overflow:hidden;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#2c3323 0%,#22291b 58%,#1b2216 100%);}
        .brand-lockup{position:fixed;top:18px;left:20px;z-index:120;display:flex;flex-direction:column;align-items:flex-start;gap:9px;pointer-events:auto;transform:scale(1.38) translateZ(0);transform-origin:top left;}
        .brand-logo{display:inline-flex;align-items:center;height:38px;padding:3px 8px 3px 3px;background:#090907;border:1px solid rgba(255,255,255,.16);box-shadow:0 18px 40px rgba(0,0,0,.36),inset 0 1px 0 rgba(255,255,255,.08);text-decoration:none;transform:translateZ(0);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;}
        .brand-logo:hover{transform:translateY(-1px);border-color:rgba(212,245,71,.45);box-shadow:0 22px 48px rgba(0,0,0,.44),0 0 28px rgba(212,245,71,.1),inset 0 1px 0 rgba(255,255,255,.1);}
        .brand-badge{position:relative;width:34px;height:32px;background:var(--accent);display:flex;align-items:center;justify-content:center;padding:3px;box-shadow:inset 0 0 0 1px rgba(10,10,8,.2);}
        .brand-badge::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.24),transparent 42%);pointer-events:none;}
        .brand-phone{position:relative;width:19px;height:25px;border:3px solid #10100e;border-radius:4px 4px 6px 6px;transform:rotate(-10deg);box-shadow:3px 2px 0 rgba(10,10,8,.3);background:rgba(16,16,14,.04);}
        .brand-phone::before{content:"∞";position:absolute;left:50%;top:43%;transform:translate(-50%,-50%) rotate(10deg);font-family:'DM Sans',sans-serif;font-size:18px;line-height:1;color:#10100e;font-weight:900;}
        .brand-phone::after{content:"";position:absolute;left:3px;right:3px;bottom:1px;height:2px;border-radius:99px;background:#10100e;}
        .brand-word{position:relative;display:block;width:136px;height:27px;overflow:hidden;font-family:'Bebas Neue',Impact,sans-serif;font-size:2rem;line-height:.88;color:#f0ede6;letter-spacing:.02em;margin-left:7px;text-shadow:2px 0 0 rgba(255,255,255,.14),0 1px 0 rgba(0,0,0,.9);}
        .brand-word::after{content:attr(data-text);position:absolute;inset:0;color:var(--accent);opacity:0;clip-path:inset(0 0 65% 0);transform:translateX(0);pointer-events:none;}
        .brand-word span{display:block;transition:transform .22s ease,opacity .18s ease;}
        .brand-word span:nth-child(2){color:var(--accent);}
        .brand-logo:hover .brand-word span{transform:translateY(-27px);}
        .brand-logo:hover .brand-word::after{animation:brandGlitch .38s steps(2,end) 2;opacity:.82;}
        .brand-tagline{font-size:18px;line-height:1.35;letter-spacing:.2em;text-transform:uppercase;color:rgba(247,242,232,.82);text-shadow:0 10px 24px rgba(0,0,0,.45);max-width:520px;font-weight:700;transition:opacity .22s ease,transform .22s ease;}
        .brand-tagline.is-hidden{opacity:0;transform:translateY(-8px);pointer-events:none;}
        .page-nav{position:fixed;top:158px;right:24px;z-index:130;}
        .page-nav summary{width:46px;height:42px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;background:rgba(9,11,7,.78);border:1px solid rgba(255,255,255,.16);box-shadow:0 20px 52px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.08);backdrop-filter:blur(16px);cursor:pointer;list-style:none;}
        .page-nav summary::-webkit-details-marker{display:none;}
        .page-nav summary span{width:22px;height:2px;border-radius:99px;background:var(--accent);transition:transform .18s ease,opacity .18s ease;}
        .page-nav[open] summary span:nth-child(1){transform:translateY(7px) rotate(45deg);}
        .page-nav[open] summary span:nth-child(2){opacity:0;}
        .page-nav[open] summary span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}
        .page-nav nav{position:absolute;top:50px;right:0;min-width:174px;display:flex;flex-direction:column;gap:4px;padding:7px;background:rgba(9,11,7,.84);border:1px solid rgba(255,255,255,.16);box-shadow:0 24px 58px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.08);backdrop-filter:blur(16px);}
        .page-nav a{display:flex;align-items:center;justify-content:flex-start;min-height:36px;padding:0 13px;border-radius:8px;color:rgba(247,242,232,.8);font-size:.78rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;transition:background .16s ease,color .16s ease,transform .16s ease;}
        .page-nav a:hover,.page-nav a:focus-visible{background:var(--accent);color:#10140d;outline:none;transform:translateX(-2px);}
        @keyframes brandGlitch{0%{transform:translateX(0);clip-path:inset(0 0 72% 0);}35%{transform:translateX(3px);clip-path:inset(34% 0 32% 0);}70%{transform:translateX(-2px);clip-path:inset(66% 0 0 0);}100%{transform:translateX(0);clip-path:inset(0 0 65% 0);}}
        .time-account{position:absolute;top:22px;right:24px;z-index:38;min-width:190px;padding:14px 16px 13px;background:rgba(51,60,41,.88);border:1px solid rgba(255,255,255,.2);box-shadow:0 20px 46px rgba(0,0,0,.22),0 0 28px rgba(212,245,71,.08),inset 0 1px 0 rgba(255,255,255,.12);backdrop-filter:blur(14px);}
        .time-account.recover{background:rgba(212,245,71,.94);color:#10140d;border-color:rgba(255,255,255,.38);box-shadow:0 22px 58px rgba(212,245,71,.18),inset 0 1px 0 rgba(255,255,255,.34);}
        .time-account span{display:block;font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);line-height:1;}
        .time-account.recover span{color:#354112;}
        .time-account strong{display:block;font-family:'Bebas Neue',sans-serif;font-size:3.75rem;line-height:.9;color:var(--accent);font-weight:400;margin-top:7px;}
        .time-account.recover strong{color:#10140d;}
        .time-account small{display:block;font-size:14px;line-height:1.25;color:rgba(244,239,230,.78);}
        .time-account.recover small{color:#354112;}
        .bg-word{position:absolute;font-family:'Bebas Neue',sans-serif;font-size:min(62vw,640px);color:rgba(255,255,255,.055);top:51%;left:50%;transform:translate(-50%,-50%);pointer-events:none;white-space:nowrap;letter-spacing:-.035em;}
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
        .feed-scroll{position:absolute;top:48px;left:0;right:0;bottom:60px;overflow:hidden;padding-top:154px;}
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
        .ph-clock-note{margin-bottom:16px;padding:9px 10px;border:1px solid rgba(212,245,71,.24);border-radius:9px;background:rgba(212,245,71,.08);color:rgba(247,242,232,.72);font-size:.72rem;line-height:1.35;}
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
        .challenge{padding:5rem 2rem;border-top:1px solid rgba(255,255,255,.12);background:#293120;}
        .ch-inner{max-width:1220px;margin:0 auto;display:grid;grid-template-columns:minmax(360px,.85fr) minmax(420px,1.15fr);gap:clamp(2rem,5vw,4rem);align-items:center;}
        .challenge-copy{min-width:0;}
        .ch-eyebrow{font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem;font-weight:800;}
        .ch-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(3rem,8vw,6rem);line-height:.9;letter-spacing:-.02em;margin-bottom:1.5rem;}
        .ch-accent{color:var(--accent);}
        .ch-body{font-size:.95rem;color:var(--dim);line-height:1.7;margin-bottom:2rem;}
        .time-dial{width:min(360px,100%);margin:0 0 1.7rem;touch-action:none;cursor:grab;user-select:none;outline:none;}
        .time-dial:active{cursor:grabbing;}
        .time-dial:focus-visible .dial-face{box-shadow:0 0 0 3px rgba(212,245,71,.35),0 28px 70px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.14);}
        .dial-face{position:relative;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 48% 42%,#465136 0%,#313b28 47%,#202819 73%,#151b12 100%);border:1px solid rgba(212,245,71,.28);box-shadow:0 28px 70px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.14),inset 0 -18px 36px rgba(0,0,0,.28);overflow:hidden;}
        .dial-face::before{content:"";position:absolute;inset:11%;border-radius:50%;border:1px solid rgba(247,242,232,.12);box-shadow:inset 0 0 30px rgba(212,245,71,.05);}
        .dial-face::after{content:"";position:absolute;inset:22%;border-radius:50%;background:radial-gradient(circle,rgba(212,245,71,.16),transparent 64%);filter:blur(14px);}
        .dial-track{position:absolute;inset:8%;border-radius:50%;background:conic-gradient(var(--accent) 0deg, var(--accent) var(--clock-angle, 180deg), rgba(247,242,232,.12) var(--clock-angle, 180deg), rgba(247,242,232,.12) 360deg);-webkit-mask:radial-gradient(circle,transparent 60%,#000 61%);mask:radial-gradient(circle,transparent 60%,#000 61%);opacity:.95;}
        .dial-tick{position:absolute;left:50%;top:4%;width:1px;height:46%;transform-origin:50% 100%;z-index:2;}
        .dial-tick::before{content:"";position:absolute;left:-1px;top:0;width:3px;height:12px;border-radius:99px;background:rgba(247,242,232,.35);}
        .dial-tick i{position:absolute;top:18px;left:50%;font-family:'Bebas Neue',sans-serif;font-size:1.1rem;font-style:normal;color:rgba(247,242,232,.7);}
        .dial-hand{position:absolute;left:50%;top:50%;width:0;height:0;transform-origin:50% 50%;z-index:4;}
        .dial-hand span{position:absolute;left:-5px;bottom:0;width:10px;height:38vmin;max-height:136px;border-radius:99px 99px 6px 6px;background:linear-gradient(180deg,var(--accent),#f4ffc5);box-shadow:0 0 24px rgba(212,245,71,.36);}
        .dial-hand span::before{content:"";position:absolute;left:50%;bottom:-13px;width:26px;height:26px;border-radius:50%;background:var(--accent);border:3px solid #f7f2e8;transform:translateX(-50%);box-shadow:0 6px 18px rgba(0,0,0,.18);}
        .dial-center{position:absolute;left:50%;top:50%;z-index:5;width:118px;height:118px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:translate(-50%,-50%);background:#f7f2e8;color:#10140d;box-shadow:0 16px 42px rgba(0,0,0,.24),inset 0 0 0 1px rgba(16,20,13,.08);}
        .dial-center strong{font-family:'Bebas Neue',sans-serif;font-size:3rem;line-height:.85;font-weight:400;}
        .dial-center small{font-size:.68rem;letter-spacing:.15em;text-transform:uppercase;color:#5d6b40;}
        .dial-hint{display:inline-flex;align-items:center;gap:.65rem;margin-top:1rem;padding:10px 14px;border:1px solid rgba(212,245,71,.4);background:rgba(212,245,71,.1);box-shadow:0 16px 34px rgba(0,0,0,.16),0 0 28px rgba(212,245,71,.08);font-size:1rem;line-height:1;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);font-weight:800;}
        .dial-hint::before{content:"";width:12px;height:12px;border-radius:50%;background:var(--accent);box-shadow:0 0 18px rgba(212,245,71,.7);}
        .impact-graphic{position:relative;overflow:hidden;border:1px solid rgba(212,245,71,.3);border-radius:12px;padding:1.25rem;background:linear-gradient(135deg,rgba(247,242,232,.97),rgba(222,235,178,.93));color:#10140d;box-shadow:0 34px 80px rgba(0,0,0,.24),0 0 46px rgba(212,245,71,.1);}
        .impact-graphic::before{content:"";position:absolute;inset:0;background:linear-gradient(rgba(16,20,13,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(16,20,13,.05) 1px,transparent 1px);background-size:22px 22px;mask-image:linear-gradient(145deg,rgba(0,0,0,.85),transparent 72%);pointer-events:none;}
        .impact-graphic>*{position:relative;z-index:1;}
        .impact-top{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1rem;}
        .impact-kicker{display:block;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:#5d6b40;margin-bottom:.35rem;}
        .impact-top h3{font-family:'DM Serif Display',serif;font-size:clamp(1.8rem,3.5vw,3rem);line-height:1;margin:0;color:#10140d;}
        .impact-top strong{display:flex;flex-direction:column;align-items:flex-end;font-family:'Bebas Neue',sans-serif;font-size:4.5rem;line-height:.75;font-weight:400;color:#293120;text-shadow:0 10px 26px rgba(41,49,32,.12);}
        .impact-top small{font-family:'DM Sans',sans-serif;font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:#5d6b40;text-shadow:none;margin-top:.45rem;}
        .impact-slider{display:block;border:1px solid rgba(16,20,13,.12);background:rgba(255,255,255,.34);border-radius:10px;padding:.85rem;margin-bottom:.8rem;}
        .impact-slider span{display:flex;justify-content:space-between;gap:1rem;font-size:.8rem;color:#52613c;margin-bottom:.45rem;}
        .impact-slider b{font-family:'Bebas Neue',sans-serif;font-size:1.75rem;line-height:.8;color:#10140d;font-weight:400;}
        .impact-slider em{display:block;font-style:normal;font-size:.72rem;line-height:1.35;color:#5d6b40;}
        .impact-math{display:grid;grid-template-columns:1fr 1fr;gap:.7rem;margin:1rem 0;}
        .impact-math div{border-radius:10px;padding:.95rem;background:#293120;color:var(--text);box-shadow:inset 0 1px 0 rgba(255,255,255,.08);}
        .impact-math strong{display:block;font-family:'Bebas Neue',sans-serif;font-size:3rem;line-height:.85;color:var(--accent);font-weight:400;}
        .impact-math span{display:block;margin-top:.35rem;font-size:.78rem;color:rgba(247,242,232,.72);}
        .year-map{display:grid;grid-template-columns:repeat(31,1fr);gap:3px;padding:.85rem;background:rgba(16,20,13,.08);border:1px solid rgba(16,20,13,.08);border-radius:10px;}
        .year-map span{aspect-ratio:1;border-radius:2px;background:rgba(16,20,13,.16);transition:background .2s ease,box-shadow .2s ease,transform .2s ease;}
        .year-map span.active{background:#d4f547;box-shadow:0 0 10px rgba(212,245,71,.45);}
        .impact-graphic:hover .year-map span.active:nth-child(4n){transform:translateY(-1px);}
        .impact-caption{font-size:.78rem;color:#52613c;line-height:1.55;margin:.75rem 0 1rem;}
        .impact-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.65rem;}
        .impact-option-head{grid-column:1/-1;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:#5d6b40;}
        .impact-option{position:relative;overflow:hidden;border-radius:9px;background:rgba(16,20,13,.09);padding:.75rem .8rem;border:1px solid rgba(16,20,13,.08);}
        .impact-option strong{display:block;font-family:'Bebas Neue',sans-serif;font-size:2.15rem;line-height:.9;color:#10140d;font-weight:400;}
        .impact-option span{display:block;margin-top:.25rem;font-size:.73rem;color:#52613c;}
        .impact-option i{position:absolute;left:0;bottom:0;height:3px;background:#10140d;border-radius:0 99px 99px 0;}

        .site-footer{padding:3rem 2rem;border-top:1px solid rgba(255,255,255,.12);background:#202619;}
        .footer-inner{max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:.75rem;}
        .footer-logo{font-family:'Bebas Neue',sans-serif;font-size:2rem;color:var(--accent);letter-spacing:.05em;}
        .footer-text{font-size:1rem;color:var(--dim);line-height:1.75;}
        @media (max-width:980px){
          .ch-inner{grid-template-columns:1fr;align-items:start;}
          .impact-graphic{max-width:760px;width:100%;}
          .year-map{grid-template-columns:repeat(25,1fr);}
        }
        @media (max-width:700px){
          .brand-lockup{top:16px;left:16px;gap:9px;transform:scale(1.16) translateZ(0);}
          .brand-logo{height:38px;padding:3px 8px 3px 3px;}
          .brand-badge{width:34px;height:32px;padding:3px;}
          .brand-phone{width:18px;height:24px;border-width:3px;}
          .brand-phone::before{font-size:17px;}
          .brand-word{width:136px;height:27px;font-size:2rem;margin-left:7px;}
          .brand-logo:hover .brand-word span{transform:translateY(-27px);}
          .brand-tagline{font-size:12px;letter-spacing:.16em;max-width:280px;}
          .page-nav{top:170px;right:16px;}
          .page-nav summary{width:42px;height:38px;}
          .page-nav nav{top:46px;min-width:158px;}
          .page-nav a{min-height:34px;font-size:.72rem;}
          .bg-word{font-size:min(88vw,360px);opacity:.9;}
          .time-account{top:62px;right:16px;bottom:auto;min-width:150px;padding:10px 12px;}
          .time-account span{font-size:10px;}
          .time-account strong{font-size:2.55rem;}
          .time-account small{font-size:11px;}
          .hero-prompt{left:16px;right:16px;bottom:8vh;max-width:none;}
          .hero-prompt::after{display:none;}
          .time-particles{width:100vw;height:70vh;}
          .time-particles span{font-size:1rem;height:23px;}
          .recall-grid{grid-template-columns:1fr;}
          .recall-break{padding:4rem 1.1rem;}
          .challenge{padding:4rem 1.1rem;}
          .ch-inner{gap:1.5rem;}
          .impact-graphic{padding:1rem;}
          .impact-top{align-items:flex-start;}
          .impact-top strong{font-size:3.4rem;}
          .impact-math{grid-template-columns:1fr;}
          .year-map{grid-template-columns:repeat(20,1fr);gap:2px;padding:.65rem;}
          .impact-options{grid-template-columns:1fr;}
        }
      `}</style>
  );
}
