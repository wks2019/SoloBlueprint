import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

/* ═══════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════ */
const C = {
  bg:         "#FFFFFF",
  bgWarm:     "#FAF8F3",
  surface:    "#F5F2EA",
  surfaceUp:  "#EFEBE0",
  card:       "#FFFFFF",
  border:     "#E5E0D2",
  borderUp:   "#D4CDB8",
  amber:      "#B8731A",
  amberSoft:  "#C8861E",
  amberGlow:  "rgba(184,115,26,0.10)",
  amberDim:   "rgba(184,115,26,0.05)",
  cream:      "#1A1814",
  creamMid:   "#4A463C",
  creamDim:   "#807A6A",
  creamGhost: "#C8C2B0",
  green:      "#2F7A4A",
  greenSoft:  "#3D8F5F",
  blue:       "#2A5F9E",
  blueSoft:   "#3A7ABF",
  red:        "#A04030",
};

const F = {
  display: "'Cormorant Garamond', Georgia, serif",
  mono:    "'JetBrains Mono', monospace",
  body:    "'DM Sans', sans-serif",
};

/* ═══════════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════════ */
const PROFESSIONS = [
  "Hospitality & Hotels", "Healthcare & Nursing",
  "Teaching & Education", "Finance & Accounting",
  "Legal & Law",          "Engineering",
  "Retail & Sales",       "Creative & Design", "Other",
];

const GOALS = [
  "Build a digital product",   "Start a freelance service",
  "Launch an online course",   "Create a content brand",
  "Build a physical business", "Something else",
];

const TIME_OPTS = [
  { v:"low",    l:"1–3 hrs / week",  n:"Slow & steady" },
  { v:"medium", l:"4–7 hrs / week",  n:"Good momentum" },
  { v:"high",   l:"8–15 hrs / week", n:"Serious pace"  },
  { v:"full",   l:"15+ hrs / week",  n:"All in"        },
];

const BLUEPRINT_KEYS = [
  { index:"01", title:"Business Idea Diagnosis",    key:"diagnosis"     },
  { index:"02", title:"Real Problem & Demand",      key:"problem"       },
  { index:"03", title:"Target Audience",            key:"audience"      },
  { index:"04", title:"Your Clear Offer",           key:"offer"         },
  { index:"05", title:"Tools You Need",             key:"tools"         },
  { index:"06", title:"AI & No-Code Stack",         key:"stack"         },
  { index:"07", title:"Step-by-Step Launch Plan",   key:"launch"        },
  { index:"08", title:"Pricing Strategy",           key:"pricing"       },
  { index:"09", title:"Distribution Channels",      key:"distribution"  },
  { index:"10", title:"Outreach Script",            key:"outreach"      },
  { index:"11", title:"Proof & Demo to Create",     key:"proof"         },
  { index:"12", title:"Honest Risks",               key:"risks"         },
  { index:"13", title:"Your First 7-Day Plan",      key:"action"        },
  { index:"14", title:"How to Scale Later",         key:"scale"         },
];

const ROADMAP_PHASE1 = [
  {
    index:"01", week:"Week 1–2",
    title:"Understand Before You Build",
    fallback_action:"Have 5 real conversations with people who would pay for your idea. Not Google. Real people. Ask what they struggle with and what they'd pay to fix it.",
    fallback_why:"Most founders skip this and build the wrong thing. Your profession gives you access to real customers most builders never meet.",
    resource:{ type:"BOOK", title:"The Mom Test — Rob Fitzpatrick", why:"The clearest guide on getting honest answers from potential customers. Read in one afternoon." },
    time:"3–4 hrs",
  },
  {
    index:"02", week:"Week 3–4",
    title:"Define Your Offer in One Sentence",
    fallback_action:"Write exactly: 'I help [who] to [do what] so they can [result].' Test it on 3 people. If they don't say 'I need that', rewrite it.",
    fallback_why:"Clarity is your competitive advantage. A sharp offer closes faster than any sales tactic.",
    resource:{ type:"VIDEO", title:"Alex Hormozi — Craft An Irresistible Offer (YouTube)", why:"No fluff. Breaks down offer creation for people with zero audience and zero budget." },
    time:"2–3 hrs",
  },
  {
    index:"03", week:"Week 5–6",
    title:"Build the Simplest Version",
    fallback_action:"One-page site or a single PDF. That is your product for now. Ship it before you feel ready. Perfection is procrastination.",
    fallback_why:"Shipping something imperfect beats planning something perfect. Your first version teaches you things no amount of planning can.",
    resource:{ type:"TOOL", title:"Carrd.co — One-page site builder", why:"Takes 2 hours to learn. Professional results. £15/year. No excuse not to start." },
    time:"4–6 hrs",
  },
  {
    index:"04", week:"Week 7–8",
    title:"Get Your First Paying Customer",
    fallback_action:"Send 20 personal, specific messages to people who match your target. Not posts. Not ads. Personal messages referencing their actual situation.",
    fallback_why:"Your first customer validates everything. One real payment is worth more than 1,000 positive comments.",
    resource:{ type:"ARTICLE", title:"Lenny Rachitsky — How to get your first 10 customers", why:"Practical, unglamorous, and it actually works when nobody knows you yet." },
    time:"5–6 hrs",
  },
];

const ROADMAP_PHASE2 = [
  {
    index:"05", week:"Week 9–10",
    title:"Build Your Content Engine",
    action:"Post one piece of content per week documenting your journey. Not polished. Real. Your story is your marketing.",
    resource:{ type:"BOOK", title:"Show Your Work — Austin Kleon", why:"The simplest framework for building an audience by sharing your process, not just your results." },
    time:"2–3 hrs",
  },
  {
    index:"06", week:"Week 11–12",
    title:"Systematise Your Delivery",
    action:"Document your entire delivery process so someone else could do it from your notes alone.",
    resource:{ type:"VIDEO", title:"Alex Hormozi — How to build systems (YouTube)", why:"You cannot scale what only lives in your head. Systems are how you buy back your time." },
    time:"3–4 hrs",
  },
  {
    index:"07", week:"Week 13–14",
    title:"Raise Your Price",
    action:"Double your price for every new client. Keep existing ones at current rate. You have proof now.",
    resource:{ type:"ARTICLE", title:"Patrick McKenzie — Pricing guide for consultants", why:"The most honest and practical guide to pricing your expertise that exists." },
    time:"1–2 hrs",
  },
  {
    index:"08", week:"Week 15–16",
    title:"Get Your Second Channel",
    action:"Pick one distribution channel you have not used and commit to it for 30 days straight.",
    resource:{ type:"TOOL", title:"Hypefury — X/Twitter scheduling", why:"One channel makes you fragile. Two makes you resilient. Hypefury makes the second one manageable." },
    time:"2–3 hrs",
  },
];

/* ═══════════════════════════════════════════════════
   DEEPSEEK API
═══════════════════════════════════════════════════ */
const callDeepSeek = async (profession, goal, time, idea) => {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const system = `You are a sharp, honest business advisor for solo founders. 
Write like a knowledgeable friend — direct, warm, no jargon, no hype. 
Always tell the truth even when uncomfortable. 
Return valid JSON only. No markdown. No backticks. No preamble. Raw JSON only.`;

  const userPrompt = `Generate a complete personalised BlueprintPath for:
Profession: ${profession}
Goal: ${goal}
Time available per week: ${time}
Their idea: ${idea || "not specified"}

Return exactly this JSON with no extra keys:
{
  "diagnosis": "2-3 sentences tailored to their profession and goal",
  "problem": "2-3 sentences about real demand for their specific goal",
  "audience": "2-3 sentences describing their exact target customer",
  "offer": "2-3 sentences defining a clear productised offer for their goal",
  "tools": "3-4 specific tools with costs relevant to their goal",
  "stack": "2-3 sentences on the best no-code AI stack for their situation",
  "launch": "5-phase launch plan as one detailed paragraph",
  "pricing": "2-3 sentences on pricing strategy for their goal",
  "distribution": "2-3 sentences on where their customers actually are",
  "outreach": "A personalised outreach message template for their profession",
  "proof": "2-3 sentences on how to build credibility with zero portfolio",
  "risks": "3 honest risks specific to their profession and goal",
  "action": "7-day action plan as a detailed paragraph",
  "scale": "2-3 sentences on scaling path for their specific goal",
  "difficulty": "low or medium or high",
  "difficulty_text": "2 sentences honest difficulty based on their time availability",
  "income_month3": "realistic range like £200-500/mo",
  "income_month6": "realistic range like £500-1500/mo",
  "income_year1": "realistic range like £1500-4000/mo",
  "why_them": "2 sentences on why their profession is an advantage",
  "step1_action": "personalised week 1-2 action for their goal",
  "step1_why": "why this matters for their specific situation",
  "step2_action": "personalised week 3-4 action for their goal",
  "step2_why": "why this matters for their specific situation",
  "step3_action": "personalised week 5-6 action for their goal",
  "step3_why": "why this matters for their specific situation",
  "step4_action": "personalised week 7-8 action for their goal",
  "step4_why": "why this matters for their specific situation"
}`;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/deepseek-proxy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ system, user: userPrompt, max_tokens: 4000 }),
  });

  if (!response.ok) throw new Error(`DeepSeek proxy error: ${response.status}`);
  const data = await response.json();
  const text = data.choices[0].message.content;
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
};

/* ═══════════════════════════════════════════════════
   RATE LIMITING
═══════════════════════════════════════════════════ */
const checkRateLimit = () => {
  const today = new Date().toDateString();
  const stored = JSON.parse(localStorage.getItem("bp_rate") || "{}");
  if (stored.date !== today) {
    localStorage.setItem("bp_rate", JSON.stringify({ date: today, count: 0 }));
    return true;
  }
  return stored.count < 3;
};

const incrementRateLimit = () => {
  const today = new Date().toDateString();
  const stored = JSON.parse(localStorage.getItem("bp_rate") || "{}");
  const count = stored.date === today ? stored.count + 1 : 1;
  localStorage.setItem("bp_rate", JSON.stringify({ date: today, count }));
};

/* ═══════════════════════════════════════════════════
   MICRO COMPONENTS
═══════════════════════════════════════════════════ */
const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{background:${C.bg};color:${C.cream};font-family:${F.body};-webkit-font-smoothing:antialiased}
    button{font-family:inherit;cursor:pointer;border:none;outline:none}
    textarea{font-family:inherit;outline:none}
    input{font-family:inherit;outline:none}
    ::-webkit-scrollbar{width:3px}
    ::-webkit-scrollbar-track{background:${C.bg}}
    ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    .fade-up{animation:fadeUp 0.35s ease forwards}
    .s1{animation-delay:0.06s;opacity:0}
    .s2{animation-delay:0.13s;opacity:0}
    .s3{animation-delay:0.20s;opacity:0}
    .s4{animation-delay:0.27s;opacity:0}
    .s5{animation-delay:0.34s;opacity:0}
    .s6{animation-delay:0.41s;opacity:0}
  `}</style>
);

const Mono = ({ c = C.amber, size = 10, children }) => (
  <span style={{ fontFamily:F.mono, fontSize:size, fontWeight:600, letterSpacing:"0.13em", textTransform:"uppercase", color:c }}>
    {children}
  </span>
);

const Badge = ({ children, color = C.amber }) => (
  <div style={{
    display:"inline-flex", alignItems:"center", justifyContent:"center",
    minWidth:28, height:28, borderRadius:6, padding:"0 7px", flexShrink:0,
    background:`${color}15`, border:`1px solid ${color}33`,
    fontFamily:F.mono, fontSize:11, fontWeight:600, color,
  }}>{children}</div>
);

const Tag = ({ children, color = C.amber }) => (
  <span style={{
    display:"inline-block", padding:"3px 9px", borderRadius:4,
    fontFamily:F.mono, fontSize:9, fontWeight:600, letterSpacing:"0.12em",
    background:`${color}15`, color, border:`1px solid ${color}30`,
  }}>{children}</span>
);

const Rule = ({ my = 24 }) => (
  <div style={{ height:1, background:C.border, margin:`${my}px 0` }} />
);

const Pills = ({ current, total }) => (
  <div style={{ display:"flex", gap:4, alignItems:"center" }}>
    {Array.from({ length:total }).map((_,i) => (
      <div key={i} style={{
        height:3, width:i===current?22:8, borderRadius:99,
        background:i<=current?C.amber:C.border,
        transition:"all 0.3s ease",
      }}/>
    ))}
  </div>
);

const Logo = () => (
  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
    <div style={{
      width:28, height:28, background:C.amber, borderRadius:7,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:F.mono, fontSize:12, fontWeight:700, color:C.bg,
    }}>B</div>
    <span style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:C.cream, letterSpacing:"-0.01em" }}>
      Blueprint<span style={{ color:C.amber }}>Path</span>
    </span>
  </div>
);

/* ── Buttons ── */
const Btn = ({ children, onClick, disabled, variant="primary", small, full }) => {
  const base = {
    display:"inline-flex", alignItems:"center", justifyContent:"center",
    gap:8, borderRadius:9, fontFamily:F.body, fontWeight:600,
    letterSpacing:"0.01em", transition:"all 0.15s ease",
    padding:small?"9px 16px":"15px 24px",
    fontSize:small?12:14,
    width:full?"100%":"auto",
    cursor:disabled?"not-allowed":"pointer",
  };
  if (variant==="primary") return (
    <button onClick={!disabled?onClick:undefined} style={{...base,
      background:disabled?C.surfaceUp:C.amber,
      color:disabled?C.creamDim:C.bg,
      boxShadow:disabled?"none":`0 0 28px ${C.amberGlow}`,
    }}>{children}</button>
  );
  if (variant==="ghost") return (
    <button onClick={onClick} style={{...base,
      background:"transparent", color:C.creamDim,
      border:`1px solid ${C.border}`,
    }}>{children}</button>
  );
  if (variant==="outline") return (
    <button onClick={onClick} style={{...base,
      background:"transparent", color:C.amberSoft,
      border:`1px solid ${C.amber}44`,
    }}>{children}</button>
  );
};

/* ── Select option ── */
const Opt = ({ label, sub, selected, onClick, full }) => (
  <button onClick={onClick} style={{
    padding:"11px 14px", borderRadius:8,
    background:selected?C.amberDim:"transparent",
    border:`1px solid ${selected?C.amber+"55":C.border}`,
    color:selected?C.amberSoft:C.creamMid,
    fontSize:13, fontWeight:selected?600:400,
    textAlign:"left", transition:"all 0.12s ease",
    display:"flex", justifyContent:"space-between", alignItems:"center",
    width:full?"100%":"auto",
  }}>
    <span>{label}</span>
    {sub && <Mono c={selected?C.amber:C.creamDim} size={9}>{sub}</Mono>}
  </button>
);

/* ── Resource card ── */
const ResourceCard = ({ resource }) => {
  const colors = { BOOK:C.amber, VIDEO:"#C04040", TOOL:C.green, ARTICLE:C.blueSoft };
  const col = colors[resource.type] || C.creamMid;
  return (
    <div style={{ background:C.bgWarm, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px" }}>
      <div style={{ marginBottom:6 }}><Tag color={col}>{resource.type}</Tag></div>
      <p style={{ fontSize:13, fontWeight:600, color:C.cream, marginBottom:4, lineHeight:1.4 }}>{resource.title}</p>
      <p style={{ fontSize:12, color:C.creamMid, lineHeight:1.55 }}>{resource.why}</p>
    </div>
  );
};

/* ── Skeleton loader ── */
const Skeleton = ({ h = 16, w = "100%", mb = 8 }) => (
  <div style={{
    height:h, width:w, borderRadius:6, marginBottom:mb,
    background:`linear-gradient(90deg, ${C.surface} 25%, ${C.surfaceUp} 50%, ${C.surface} 75%)`,
    backgroundSize:"200% 100%",
    animation:"shimmer 1.5s infinite",
  }}/>
);

/* ── Upgrade card ── */
const UpgradeCard = ({ onUpgrade }) => (
  <div style={{
    background:C.amberDim, border:`1px solid ${C.amber}44`,
    borderRadius:12, padding:"20px", textAlign:"center",
  }}>
    <div style={{ fontSize:20, marginBottom:10 }}>🔒</div>
    <h3 style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:C.cream, marginBottom:8 }}>
      Your path continues beyond here
    </h3>
    <p style={{ fontSize:13, color:C.creamMid, lineHeight:1.65, marginBottom:16 }}>
      Steps 03 and 04 are included in BlueprintPath Pro.
      Join for £9/month and unlock your full roadmap,
      progress tracking, and weekly accountability emails.
    </p>
    <Btn onClick={onUpgrade} full>Unlock my full path →</Btn>
  </div>
);

/* ── Toast ── */
const Toast = ({ message, show }) => (
  <div style={{
    position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
    background:C.amber, color:C.bg, padding:"10px 20px", borderRadius:8,
    fontSize:13, fontWeight:600, fontFamily:F.body,
    opacity:show?1:0, transition:"opacity 0.3s ease",
    pointerEvents:"none", zIndex:999, whiteSpace:"nowrap",
  }}>{message}</div>
);

/* ═══════════════════════════════════════════════════
   SCREEN WRAPPER
═══════════════════════════════════════════════════ */
const Screen = ({ children, nav, showNav = true }) => (
  <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center" }}>
    <Fonts/>
    {showNav && (
      <div style={{ width:"100%", maxWidth:500, padding:"20px 22px 0", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:30 }}>
        {nav}
      </div>
    )}
    <div style={{ width:"100%", maxWidth:500, padding:"0 22px 70px" }}>
      {children}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   SCREEN 0 — LANDING
═══════════════════════════════════════════════════ */
function Landing({ onStart }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 60); }, []);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", overflow:"hidden" }}>
      <Fonts/>
      {/* Grid texture */}
      <div style={{
        position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:`linear-gradient(${C.border}18 1px,transparent 1px),linear-gradient(90deg,${C.border}18 1px,transparent 1px)`,
        backgroundSize:"48px 48px",
      }}/>
      {/* Amber glow */}
      <div style={{
        position:"fixed", top:-260, left:"50%", transform:"translateX(-50%)",
        width:700, height:500,
        background:`radial-gradient(ellipse,${C.amberGlow} 0%,transparent 68%)`,
        pointerEvents:"none", zIndex:0,
      }}/>

      <nav style={{ width:"100%", maxWidth:500, padding:"20px 22px 0", display:"flex", justifyContent:"space-between", alignItems:"center", zIndex:1 }}>
        <Logo/>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Tag>Beta · Free</Tag>
          <button
            onClick={() => { window.location.href = "/auth"; }}
            style={{
              fontFamily:F.body, fontSize:12, fontWeight:600, color:C.amberSoft,
              background:"transparent", border:`1px solid ${C.amber}44`, borderRadius:7,
              padding:"5px 12px", cursor:"pointer", transition:"all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.amberDim; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            Log in
          </button>
        </div>
      </nav>

      <div style={{
        width:"100%", maxWidth:500, padding:"0 22px 60px", zIndex:1,
        paddingTop:60, textAlign:"center",
        opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(16px)",
        transition:"opacity 0.45s ease,transform 0.45s ease",
      }}>
        {/* Eyebrow */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, marginBottom:24 }}>
          <div style={{ width:24, height:1, background:C.amber }}/>
          <Mono>Business plan + personal learning path in 60 seconds</Mono>
          <div style={{ width:24, height:1, background:C.amber }}/>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily:F.display, fontSize:46, fontWeight:700,
          lineHeight:1.06, letterSpacing:"-0.02em", color:C.cream, marginBottom:18,
        }}>
          Your idea deserves<br/>
          <span style={{ color:C.amber }}>a real plan.</span><br/>
          <span style={{ fontSize:34, color:C.creamMid, fontWeight:500 }}>And a path to build it.</span>
        </h1>

        <p style={{ fontSize:16, color:C.creamMid, lineHeight:1.75, maxWidth:360, margin:"0 auto 34px", fontWeight:300 }}>
          BlueprintPath combines a full AI-generated business blueprint with a personal week-by-week learning roadmap — built for exactly who you are.
        </p>

        <div style={{ maxWidth:340, margin:"0 auto" }}>
          <Btn onClick={onStart} full>Generate my BlueprintPath — free →</Btn>
          <p style={{ fontFamily:F.mono, fontSize:9, color:C.creamDim, marginTop:10, letterSpacing:"0.12em" }}>
            NO ACCOUNT NEEDED · 60 SECONDS · HONEST ANSWERS
          </p>
        </div>

        <Rule my={44}/>

        {/* Feature grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, textAlign:"left", marginBottom:32 }}>
          {[
            { icon:"📋", t:"14-Section Blueprint",  d:"Full AI business plan tailored to your idea and profession" },
            { icon:"🗺️", t:"Personal Roadmap",      d:"Week-by-week path based on your time and background" },
            { icon:"📚", t:"Curated Resources",     d:"One best resource per step. No noise, no overwhelm" },
            { icon:"✓",  t:"Honest Preview",        d:"Real difficulty rating and income expectations upfront" },
            { icon:"📧", t:"Weekly Emails",         d:"Monday accountability check-ins personalised to your step" },
            { icon:"🔄", t:"Adaptive Check-ins",    d:"Got stuck? The app adapts your path with alternatives" },
          ].map(f => (
            <div key={f.t} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px" }}>
              <div style={{ fontSize:18, marginBottom:7 }}>{f.icon}</div>
              <div style={{ fontSize:13, fontWeight:700, color:C.cream, marginBottom:3 }}>{f.t}</div>
              <div style={{ fontSize:12, color:C.creamMid, lineHeight:1.55 }}>{f.d}</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:32 }}>
          {[
            { n:"40+",  l:"Professions" },
            { n:"200+", l:"Resources"   },
            { n:"£0",   l:"To start"    },
          ].map((s,i) => (
            <div key={s.n} style={{
              flex:1, textAlign:"center", padding:"0 12px",
              borderRight:i<2?`1px solid ${C.border}`:"none",
            }}>
              <div style={{ fontFamily:F.display, fontSize:26, fontWeight:700, color:C.amber }}>{s.n}</div>
              <div style={{ fontFamily:F.mono, fontSize:9, color:C.creamDim, marginTop:3, letterSpacing:"0.08em", textTransform:"uppercase" }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20, textAlign:"left" }}>
          <p style={{ fontSize:14, color:C.creamMid, lineHeight:1.75, fontStyle:"italic", marginBottom:14 }}>
            "I spent months scattered across YouTube, Reddit, and ChatGPT trying to figure out how to start. BlueprintPath gave me a complete plan AND told me exactly what to learn first. First client in week 6."
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:C.amberDim, border:`1px solid ${C.amber}33`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Mono>S</Mono>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:C.cream }}>Sarah M.</div>
              <Mono c={C.creamDim}>Nurse → Freelance health writer</Mono>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SCREEN 1 — INTAKE FORM
═══════════════════════════════════════════════════ */
function Intake({ onNext, isAdmin }) {
  const [a, setA] = useState({ profession:"", goal:"", idea:"", time:"" });
  const set = (k,v) => setA(p=>({...p,[k]:v}));
  const ready = a.profession && a.goal && a.time;
  const rateOk = isAdmin || checkRateLimit();

  return (
    <Screen nav={<><Logo/><Pills current={0} total={5}/></>}>
      <div className="fade-up">
        <Mono c={C.amberSoft}>Step 01 of 03</Mono>
        <h2 style={{ fontFamily:F.display, fontSize:32, fontWeight:700, color:C.cream, margin:"10px 0 6px", lineHeight:1.15, letterSpacing:"-0.02em" }}>
          Tell us about yourself
        </h2>
        <p style={{ fontSize:14, color:C.creamMid, marginBottom:28, lineHeight:1.6 }}>
          Four questions. Your blueprint and roadmap are built entirely from these answers.
        </p>

        {/* A — Profession */}
        <div style={{ marginBottom:22 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <Badge>A</Badge>
            <Mono c={C.creamMid}>Your profession</Mono>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
            {PROFESSIONS.map(p => <Opt key={p} label={p} selected={a.profession===p} onClick={()=>set("profession",p)}/>)}
          </div>
        </div>

        <Rule/>

        {/* B — Goal */}
        <div style={{ marginBottom:22 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <Badge>B</Badge>
            <Mono c={C.creamMid}>What do you want to build?</Mono>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
            {GOALS.map(g => <Opt key={g} label={g} selected={a.goal===g} onClick={()=>set("goal",g)}/>)}
          </div>
        </div>

        <Rule/>

        {/* C — Idea */}
        <div style={{ marginBottom:22 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <Badge>C</Badge>
            <Mono c={C.creamMid}>Your idea in one sentence <span style={{ color:C.creamDim }}>(optional)</span></Mono>
          </div>
          <textarea
            value={a.idea}
            onChange={e=>set("idea",e.target.value)}
            placeholder="e.g. An online course teaching hospitality staff how to earn more on the side"
            rows={3}
            style={{
              width:"100%", background:C.surface, border:`1px solid ${C.border}`,
              borderRadius:9, padding:"12px 14px", color:C.cream, fontSize:13,
              lineHeight:1.6, resize:"none",
            }}
          />
        </div>

        <Rule/>

        {/* D — Time */}
        <div style={{ marginBottom:30 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <Badge>D</Badge>
            <Mono c={C.creamMid}>Time available per week</Mono>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {TIME_OPTS.map(t => <Opt key={t.v} label={t.l} sub={t.n} selected={a.time===t.v} onClick={()=>set("time",t.v)} full/>)}
          </div>
        </div>

        {!rateOk ? (
          <div style={{ background:C.amberDim, border:`1px solid ${C.amber}44`, borderRadius:10, padding:"14px 16px", textAlign:"center" }}>
            <p style={{ fontSize:13, color:C.amberSoft, lineHeight:1.6 }}>
              You have generated 3 blueprints today.<br/>
              Come back tomorrow — your next one will be even sharper.
            </p>
          </div>
        ) : (
          <Btn onClick={()=>onNext(a)} disabled={!ready} full>
            {ready?"Generate my BlueprintPath →":"Complete all sections above"}
          </Btn>
        )}
      </div>
    </Screen>
  );
}

/* ═══════════════════════════════════════════════════
   SCREEN 2 — GENERATING
═══════════════════════════════════════════════════ */
function Generating({ answers, onDone, isAdmin }) {
  const [step, setStep] = useState(0);
  const steps = [
    "Analysing your profession and goal…",
    "Building your 14-section business blueprint…",
    "Personalising your learning roadmap…",
    "Generating honest income projections…",
    "Assembling your BlueprintPath…",
  ];

  useEffect(() => {
    let cancelled = false;

    const generate = async () => {
      try {
        if (!isAdmin) incrementRateLimit();
        const timers = steps.map((_,i) => setTimeout(() => { if(!cancelled) setStep(i); }, i*700));
        const result = await callDeepSeek(answers.profession, answers.goal, answers.time, answers.idea);
        if (!cancelled) {
          setTimeout(() => { if(!cancelled) onDone(result); }, steps.length*700 + 400);
        }
        return () => timers.forEach(clearTimeout);
      } catch (err) {
        console.error("DeepSeek error:", err);
        if (!cancelled) {
          setTimeout(() => onDone(null), steps.length*700 + 400);
        }
      }
    };

    generate();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
      <Fonts/>
      <div style={{ textAlign:"center", maxWidth:340, padding:"0 22px" }}>
        <div style={{
          width:52, height:52, borderRadius:"50%",
          border:`2px solid ${C.border}`, borderTop:`2px solid ${C.amber}`,
          animation:"spin 0.9s linear infinite",
          margin:"0 auto 28px",
        }}/>
        <h2 style={{ fontFamily:F.display, fontSize:26, fontWeight:700, color:C.cream, marginBottom:26, lineHeight:1.3 }}>
          Building your<br/><span style={{ color:C.amber }}>BlueprintPath</span>
        </h2>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {steps.map((s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, opacity:i<=step?1:0.2, transition:"opacity 0.4s ease" }}>
              <div style={{
                width:18, height:18, borderRadius:"50%", flexShrink:0,
                background:i<step?C.amber:i===step?C.amberDim:C.surface,
                border:`1px solid ${i<=step?C.amber:C.border}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:10, color:C.bg, fontWeight:700,
              }}>{i<step?"✓":""}</div>
              <span style={{ fontSize:13, color:i===step?C.cream:C.creamMid, textAlign:"left" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SCREEN 3 — HONEST PREVIEW
═══════════════════════════════════════════════════ */
function Preview({ answers, data, onNext }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const timeLabel = TIME_OPTS.find(t=>t.v===answers.time)?.l||answers.time;
  const useFallback = !data;

  const diffMap = { low:"LOW — achievable", medium:"MEDIUM — requires consistency", high:"HIGH — serious commitment" };
  const diff = data?.difficulty ? diffMap[data.difficulty]||data.difficulty.toUpperCase() : "MEDIUM — requires consistency";

  return (
    <Screen nav={<><Btn variant="ghost" small onClick={onNext}>Skip →</Btn><Pills current={1} total={5}/></>}>
      <div className="fade-up">
        <Mono c={C.amberSoft}>Honest Preview</Mono>
        <h2 style={{ fontFamily:F.display, fontSize:32, fontWeight:700, color:C.cream, margin:"10px 0 6px", lineHeight:1.15, letterSpacing:"-0.02em" }}>
          Before you begin —<br/>here's the truth.
        </h2>
        <p style={{ fontSize:14, color:C.creamMid, marginBottom:20, lineHeight:1.6 }}>
          No hype. No doom. Based on your profile.
        </p>

        {/* Profile tags */}
        <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:22 }}>
          <Tag color={C.blueSoft}>{answers.profession}</Tag>
          <Tag color={C.greenSoft}>{answers.goal}</Tag>
          <Tag color={C.amberSoft}>{timeLabel}</Tag>
        </div>

        {useFallback && (
          <div style={{ background:C.surface, border:`1px solid ${C.amber}33`, borderRadius:8, padding:"10px 14px", marginBottom:16 }}>
            <p style={{ fontSize:12, color:C.amberSoft, lineHeight:1.6 }}>Showing example content — refresh to try generating again.</p>
          </div>
        )}

        {/* Card 1 — How hard */}
        <div className="fade-up s1" style={{
          background:C.card, border:`1px solid ${C.border}`,
          borderLeft:`3px solid ${C.amber}`, borderRadius:12, padding:"18px 20px", marginBottom:12,
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <Mono c={C.amber}>01 · How hard is this?</Mono>
            <Tag color={C.amber}>{diff}</Tag>
          </div>
          {data ? (
            <p style={{ fontSize:13, color:C.creamMid, lineHeight:1.7 }}>{data.difficulty_text}</p>
          ) : (
            <p style={{ fontSize:13, color:C.creamMid, lineHeight:1.7 }}>
              With <strong style={{ color:C.cream }}>{timeLabel}</strong>, expect 8–12 weeks to your first real result. The tech is learnable. The hard part is staying consistent when nothing is working yet. Most people quit at week 4. The ones who don't almost always get there.
            </p>
          )}
        </div>

        {/* Card 2 — Income */}
        <div className="fade-up s2" style={{
          background:C.card, border:`1px solid ${C.border}`,
          borderLeft:`3px solid ${C.green}`, borderRadius:12, padding:"18px 20px", marginBottom:12,
        }}>
          <div style={{ marginBottom:12 }}><Mono c={C.green}>02 · What could this give you?</Mono></div>
          <p style={{ fontSize:13, color:C.creamMid, lineHeight:1.6, marginBottom:14 }}>
            People from <strong style={{ color:C.cream }}>{answers.profession}</strong> who built a <strong style={{ color:C.cream }}>{answers.goal?.toLowerCase()}</strong> typically reach:
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:10 }}>
            {[
              { p:"Month 3", v:data?.income_month3||"£200–500/mo" },
              { p:"Month 6", v:data?.income_month6||"£500–1,500/mo" },
              { p:"Year 1",  v:data?.income_year1||"£1,500–4k/mo" },
            ].map(m => (
              <div key={m.p} style={{ background:C.bgWarm, borderRadius:8, padding:"10px 8px", textAlign:"center", border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.greenSoft, marginBottom:3 }}>{m.v}</div>
                <Mono c={C.creamDim} size={9}>{m.p}</Mono>
              </div>
            ))}
          </div>
          <p style={{ fontSize:11, color:C.creamDim, fontStyle:"italic", lineHeight:1.5 }}>Realistic ranges based on similar profiles. Not guaranteed. Not impossible.</p>
        </div>

        {/* Card 3 — Why them */}
        <div className="fade-up s3" style={{
          background:C.card, border:`1px solid ${C.border}`,
          borderLeft:`3px solid ${C.creamDim}`, borderRadius:12, padding:"18px 20px", marginBottom:28,
        }}>
          <div style={{ marginBottom:10 }}><Mono c={C.creamMid}>03 · Why your path specifically?</Mono></div>
          {data ? (
            <p style={{ fontSize:13, color:C.creamMid, lineHeight:1.7 }}>{data.why_them}</p>
          ) : (
            <p style={{ fontSize:13, color:C.creamMid, lineHeight:1.7 }}>
              Your background in <strong style={{ color:C.cream }}>{answers.profession}</strong> gives you something most founders spend months building: you already understand what your customer feels. We've sequenced your path to activate that advantage from week one.
            </p>
          )}
        </div>

        <div className="fade-up s4">
          <Btn onClick={onNext} full>View my full BlueprintPath →</Btn>
        </div>
      </div>
    </Screen>
  );
}

/* ═══════════════════════════════════════════════════
   SCREEN 4 — OUTPUT (BLUEPRINT + ROADMAP TABS)
═══════════════════════════════════════════════════ */
function Output({ answers, data, tier, onCheckin, onUpgrade, completed, setCompleted, tab, setTab }) {
  const [expanded, setExpanded] = useState(null);
  const [toast, setToast] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(false), 2500);
  };

  const isPro = tier === "pro" || tier === "premium" || tier === "lifetime";

  const handleShare = async () => {
    const shareText = `Check out my BlueprintPath — built for a ${answers.profession} who wants to ${answers.goal?.toLowerCase()}. blueprintpath.co.uk`;
    const shareUrl = "https://blueprintpath.co.uk";
    // Try Web Share API first (mobile)
    try {
      if (navigator.share) {
        await navigator.share({ title: "My BlueprintPath", text: shareText, url: shareUrl });
        return;
      }
    } catch (e) {
      // user cancelled or unsupported — fall through to clipboard
      if (e?.name === "AbortError") return;
    }
    // Clipboard with textarea fallback (works inside sandboxed iframes)
    let copied = false;
    try {
      await navigator.clipboard.writeText(shareText);
      copied = true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = shareText;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        copied = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {}
    }
    showToast(copied ? "Copied to clipboard!" : "Could not copy — long-press to share");
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 48;
      const maxW = pageW - margin * 2;
      let y = margin;

      const ensureSpace = (h) => {
        if (y + h > pageH - margin) { doc.addPage(); y = margin; }
      };
      const writeWrapped = (text, size, style="normal", color=[40,40,40], lineGap=4) => {
        if (!text) return;
        doc.setFont("helvetica", style);
        doc.setFontSize(size);
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(String(text), maxW);
        lines.forEach((ln) => {
          ensureSpace(size + lineGap);
          doc.text(ln, margin, y);
          y += size + lineGap;
        });
      };
      const sectionTitle = (t) => {
        ensureSpace(28);
        y += 8;
        writeWrapped(t, 14, "bold", [184,115,26]);
        y += 2;
      };
      const hr = () => {
        ensureSpace(10);
        doc.setDrawColor(220,215,200);
        doc.line(margin, y, pageW - margin, y);
        y += 10;
      };

      // Header
      writeWrapped("BlueprintPath", 22, "bold", [20,20,20]);
      writeWrapped(`For a ${answers.profession} → ${answers.goal}`, 11, "normal", [110,110,110]);
      y += 6;
      hr();

      // Blueprint
      writeWrapped("Your Business Blueprint", 16, "bold", [20,20,20]);
      y += 4;
      BLUEPRINT_KEYS.forEach((s) => {
        sectionTitle(`${s.index}. ${s.title}`);
        writeWrapped(data?.[s.key] || "—", 11, "normal", [55,55,55], 5);
      });

      // Roadmap
      doc.addPage(); y = margin;
      writeWrapped("Your Personal Roadmap", 16, "bold", [20,20,20]);
      y += 6;
      const allSteps = [...ROADMAP_PHASE1, ...ROADMAP_PHASE2];
      allSteps.forEach((step) => {
        sectionTitle(`${step.index}. ${step.week} — ${step.title}`);
        writeWrapped(`Time: ${step.time}`, 10, "italic", [120,120,120], 4);
        writeWrapped(step.action || step.fallback_action || "", 11, "normal", [55,55,55], 5);
        if (step.resource) {
          writeWrapped(`Resource (${step.resource.type}): ${step.resource.title}`, 10, "bold", [55,55,55], 4);
          writeWrapped(step.resource.why, 10, "normal", [100,100,100], 4);
        }
      });

      const safeName = (answers.profession || "blueprint").replace(/\s+/g, "-").toLowerCase();
      const filename = `blueprintpath-${safeName}.pdf`;
      try {
        // Primary: blob URL + anchor download (works inside sandboxed iframes)
        const blob = doc.output("blob");
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      } catch {
        // Fallback: open in new tab so the user can save manually
        const dataUri = doc.output("datauristring");
        window.open(dataUri, "_blank");
      }
      showToast("PDF downloaded!");
    } catch (e) {
      console.error("PDF export failed", e);
      showToast("Could not generate PDF");
    }
  };

  const TabBtn = ({ id, label, icon }) => (
    <button onClick={()=>setTab(id)} style={{
      flex:1, padding:"11px 8px", background:tab===id?C.surfaceUp:"transparent",
      color:tab===id?C.amber:C.creamDim,
      fontFamily:F.mono, fontSize:10, fontWeight:600, letterSpacing:"0.1em",
      borderBottom:`2px solid ${tab===id?C.amber:"transparent"}`,
      transition:"all 0.15s ease", border:"none",
    }}>{icon} {label}</button>
  );

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center" }}>
      <Fonts/>
      <Toast message={toast} show={!!toast}/>

      {/* Sticky header */}
      <div style={{
        position:"sticky", top:0, zIndex:10, width:"100%",
        background:`${C.bg}F0`, backdropFilter:"blur(8px)",
        borderBottom:`1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth:500, margin:"0 auto", padding:"14px 22px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <Logo/>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <Pills current={2} total={5}/>
            <button onClick={handleDownloadPDF} style={{
              background:C.amber, border:`1px solid ${C.amber}`, borderRadius:7,
              padding:"6px 10px", fontSize:11, color:"#fff", fontFamily:F.mono,
              letterSpacing:"0.06em", cursor:"pointer", fontWeight:600,
            }}>PDF</button>
            <button onClick={handleShare} style={{
              background:C.surface, border:`1px solid ${C.border}`, borderRadius:7,
              padding:"6px 10px", fontSize:11, color:C.creamMid, fontFamily:F.mono,
              letterSpacing:"0.06em", cursor:"pointer",
            }}>SHARE</button>
          </div>
        </div>
        <div style={{ maxWidth:500, margin:"0 auto", padding:"8px 22px", display:"flex", gap:6, flexWrap:"wrap" }}>
          <Tag color={C.blueSoft}>{answers.profession}</Tag>
          <Tag color={C.greenSoft}>{answers.goal}</Tag>
          {!isPro && <Tag color={C.amber}>FREE</Tag>}
          {isPro && <Tag color={C.green}>PRO</Tag>}
        </div>
        <div style={{ maxWidth:500, margin:"0 auto", display:"flex" }}>
          <TabBtn id="blueprint" label="BLUEPRINT" icon="📋"/>
          <TabBtn id="roadmap"   label="ROADMAP"   icon="🗺️"/>
        </div>
      </div>

      <div style={{ width:"100%", maxWidth:500, padding:"24px 22px 70px" }}>

        {/* ── BLUEPRINT TAB ── */}
        {tab==="blueprint" && (
          <div className="fade-up">
            <Mono c={C.amberSoft}>Your Business Blueprint</Mono>
            <h2 style={{ fontFamily:F.display, fontSize:26, fontWeight:700, color:C.cream, margin:"8px 0 4px", lineHeight:1.2 }}>
              14 sections. One plan.
            </h2>
            <p style={{ fontSize:13, color:C.creamMid, marginBottom:22, lineHeight:1.6 }}>
              Tailored to {answers.profession} → {answers.goal}. Tap any section to expand.
            </p>

            {BLUEPRINT_KEYS.map((s,i) => {
              const content = data?.[s.key];
              const isOpen = expanded === i;
              return (
                <div key={s.index} onClick={()=>setExpanded(isOpen?null:i)} style={{
                  background:C.card, border:`1px solid ${isOpen?C.amber+"44":C.border}`,
                  borderRadius:12, padding:"14px 18px", marginBottom:8,
                  cursor:"pointer", transition:"all 0.15s ease",
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <Badge color={isOpen?C.amber:C.creamDim}>{s.index}</Badge>
                      <span style={{ fontFamily:F.display, fontSize:15, fontWeight:600, color:C.cream }}>{s.title}</span>
                    </div>
                    <span style={{ color:C.creamDim, fontSize:18, flexShrink:0, transform:isOpen?"rotate(90deg)":"rotate(0)", transition:"transform 0.2s ease" }}>›</span>
                  </div>
                  {isOpen && (
                    <div style={{ paddingLeft:38, marginTop:12 }}>
                      {content ? (
                        <p style={{ fontSize:13, color:C.creamMid, lineHeight:1.75 }}>{content}</p>
                      ) : (
                        <>
                          <Skeleton h={13} mb={8}/>
                          <Skeleton h={13} w="85%" mb={8}/>
                          <Skeleton h={13} w="70%"/>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ marginTop:20 }}>
              <Btn onClick={()=>setTab("roadmap")} variant="outline" full>
                View my personal roadmap →
              </Btn>
            </div>
          </div>
        )}

        {/* ── ROADMAP TAB ── */}
        {tab==="roadmap" && (
          <div className="fade-up">
            <Mono c={C.amberSoft}>Your Personal Roadmap</Mono>
            <h2 style={{ fontFamily:F.display, fontSize:26, fontWeight:700, color:C.cream, margin:"8px 0 4px", lineHeight:1.2 }}>
              Week by week. No noise.
            </h2>
            <p style={{ fontSize:13, color:C.creamMid, marginBottom:22, lineHeight:1.6 }}>
              One resource per step. Curated for {answers.profession} → {answers.goal?.toLowerCase()}.
            </p>

            {/* Phase 1 */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <Badge color={C.amber}>P1</Badge>
              <Mono c={C.amber}>Phase 1 — Foundation</Mono>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
              {ROADMAP_PHASE1.map((step,i) => {
                const done    = completed.includes(i);
                const current = (i===0&&!done)||(completed.includes(i-1)&&!done);
                const locked  = i>0&&!completed.includes(i-1)&&!done;
                const isGated = !isPro && i>=2;

                if (isGated) return (
                  <div key={i}>
                    {i===2 && <UpgradeCard onUpgrade={onUpgrade}/>}
                  </div>
                );

                const actionText = data?.[`step${i+1}_action`] || step.fallback_action;
                const whyText    = data?.[`step${i+1}_why`]    || step.fallback_why;

                return (
                  <div key={i} style={{
                    background:current?C.surfaceUp:C.card,
                    border:`1px solid ${done?C.green+"44":current?C.amber+"44":C.border}`,
                    borderRadius:12, padding:"18px 20px",
                    opacity:locked?0.35:1, transition:"all 0.2s ease",
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <Badge color={done?C.green:current?C.amber:C.creamDim}>{done?"✓":step.index}</Badge>
                        <Mono c={done?C.green:current?C.amber:C.creamDim}>{done?"Completed":step.week}</Mono>
                      </div>
                      <Mono c={C.creamDim} size={9}>{step.time}</Mono>
                    </div>

                    <h3 style={{ fontFamily:F.display, fontSize:17, fontWeight:600, color:C.cream, marginBottom:6 }}>{step.title}</h3>
                    <p style={{ fontSize:13, color:C.creamMid, lineHeight:1.65, marginBottom:6 }}>{actionText}</p>

                    {whyText && (
                      <p style={{ fontSize:12, color:C.creamDim, lineHeight:1.6, fontStyle:"italic", marginBottom:14 }}>
                        Why this: {whyText}
                      </p>
                    )}

                    <ResourceCard resource={step.resource}/>

                    {current && (
                      <button onClick={()=>onCheckin(i, ()=>setCompleted(s=>[...s,i]))} style={{
                        width:"100%", marginTop:14, padding:"12px",
                        borderRadius:8, background:C.amber, color:C.bg,
                        fontSize:13, fontWeight:700, fontFamily:F.body, cursor:"pointer",
                      }}>
                        Mark complete & check in →
                      </button>
                    )}

                    {locked && (
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:12 }}>
                        <div style={{ width:12, height:12, border:`1px solid ${C.creamDim}`, borderRadius:3, opacity:0.4 }}/>
                        <Mono c={C.creamDim} size={9}>Complete previous step to unlock</Mono>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Phase 2 */}
            {isPro && (
              <>
                <Rule/>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                  <Badge color={completed.length>=4?C.amber:C.creamDim}>P2</Badge>
                  <Mono c={completed.length>=4?C.amber:C.creamDim}>Phase 2 — Growth</Mono>
                  {completed.length<4 && <Tag color={C.creamDim}>Unlocks after Phase 1</Tag>}
                </div>

                {completed.length>=4 ? (
                  <div style={{ background:C.amberDim, border:`1px solid ${C.amber}44`, borderRadius:12, padding:"16px 20px", marginBottom:16 }}>
                    <p style={{ fontFamily:F.display, fontSize:17, fontWeight:600, color:C.cream, marginBottom:4 }}>
                      Phase 1 complete. 🎉
                    </p>
                    <p style={{ fontSize:13, color:C.creamMid, lineHeight:1.65 }}>
                      You've validated, built, and found your first customer. Now let's grow it.
                    </p>
                  </div>
                ) : null}

                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {ROADMAP_PHASE2.map((step,i) => {
                    const globalIdx = i+4;
                    const done      = completed.includes(globalIdx);
                    const current   = completed.length>=4&&(globalIdx===4&&!done||(completed.includes(globalIdx-1)&&!done));
                    const locked    = completed.length<4||(!done&&!current);

                    return (
                      <div key={i} style={{
                        background:current?C.surfaceUp:C.card,
                        border:`1px solid ${done?C.green+"44":current?C.amber+"44":C.border}`,
                        borderRadius:12, padding:"18px 20px",
                        opacity:locked?0.35:1, transition:"all 0.2s ease",
                      }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <Badge color={done?C.green:current?C.amber:C.creamDim}>{done?"✓":step.index}</Badge>
                            <Mono c={done?C.green:current?C.amber:C.creamDim}>{done?"Completed":step.week}</Mono>
                          </div>
                          <Mono c={C.creamDim} size={9}>{step.time}</Mono>
                        </div>

                        <h3 style={{ fontFamily:F.display, fontSize:17, fontWeight:600, color:C.cream, marginBottom:6 }}>{step.title}</h3>
                        <p style={{ fontSize:13, color:C.creamMid, lineHeight:1.65, marginBottom:14 }}>{step.action}</p>
                        <ResourceCard resource={step.resource}/>

                        {current && (
                          <button onClick={()=>onCheckin(globalIdx, ()=>setCompleted(s=>[...s,globalIdx]))} style={{
                            width:"100%", marginTop:14, padding:"12px",
                            borderRadius:8, background:C.amber, color:C.bg,
                            fontSize:13, fontWeight:700, fontFamily:F.body, cursor:"pointer",
                          }}>
                            Mark complete & check in →
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {completed.length>=8 && (
                  <div style={{ background:C.surface, border:`1px solid ${C.amber}`, borderRadius:16, padding:"28px 24px", textAlign:"center", marginTop:20 }}>
                    <div style={{ fontSize:32, marginBottom:12 }}>🏆</div>
                    <h3 style={{ fontFamily:F.display, fontSize:26, fontWeight:700, color:C.cream, marginBottom:8 }}>
                      You built it.
                    </h3>
                    <p style={{ fontSize:14, color:C.creamMid, lineHeight:1.75, marginBottom:20 }}>
                      From {answers.profession} to {answers.goal?.toLowerCase()}.<br/>
                      You're no longer someone who wants to build something.<br/>
                      You're someone who did.
                    </p>
                    <Btn onClick={handleShare} full>Share my BlueprintPath story →</Btn>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SCREEN 5 — CHECK-IN
═══════════════════════════════════════════════════ */
function Checkin({ stepIndex, answers, onComplete, onBack }) {
  const allSteps = [...ROADMAP_PHASE1, ...ROADMAP_PHASE2];
  const step = allSteps[stepIndex];
  const [choice, setChoice] = useState(null);
  const [stuckReason, setStuckReason] = useState(null);

  const stuckReasons = [
    "I didn't know who to talk to",
    "People weren't interested or honest",
    "I felt too awkward to ask",
    "I ran out of time this week",
  ];

  return (
    <Screen nav={<><Btn variant="ghost" small onClick={onBack}>← Back</Btn><Pills current={3} total={5}/></>}>
      <div className="fade-up">
        <Mono c={C.greenSoft}>Check-In</Mono>
        <h2 style={{ fontFamily:F.display, fontSize:32, fontWeight:700, color:C.cream, margin:"10px 0 6px", lineHeight:1.15, letterSpacing:"-0.02em" }}>
          How did it go?
        </h2>
        <p style={{ fontSize:14, color:C.creamMid, marginBottom:24, lineHeight:1.6 }}>
          Honest answer only. This is where your path adapts.
        </p>

        {/* Step reminder */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 18px", marginBottom:22 }}>
          <Mono c={C.creamDim}>Checking in on</Mono>
          <p style={{ fontFamily:F.display, fontSize:16, fontWeight:600, color:C.cream, marginTop:4 }}>
            {step?.index} · {step?.title}
          </p>
        </div>

        <p style={{ fontSize:15, fontWeight:600, color:C.cream, marginBottom:14, lineHeight:1.5 }}>
          Did you complete this step?
        </p>

        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
          {[
            { v:"complete", l:"Yes — I completed it",                c:C.green    },
            { v:"stuck",    l:"Partially — I started but got stuck",  c:C.amber    },
            { v:"skip",     l:"No — life got in the way",             c:C.creamMid },
          ].map(o => (
            <button key={o.v} onClick={()=>setChoice(o.v)} style={{
              padding:"13px 16px", borderRadius:8,
              background:choice===o.v?`${o.c}14`:"transparent",
              border:`1px solid ${choice===o.v?o.c+"55":C.border}`,
              color:choice===o.v?o.c:C.creamMid,
              fontSize:13, fontFamily:F.body, fontWeight:choice===o.v?600:400,
              textAlign:"left", transition:"all 0.12s ease",
            }}>{o.l}</button>
          ))}
        </div>

        {/* Stuck flow */}
        {choice==="stuck" && (
          <div className="fade-up" style={{
            background:C.surface, border:`1px solid ${C.amber}33`,
            borderRadius:12, padding:"18px 20px", marginBottom:20,
          }}>
            <Mono c={C.amber}>Where specifically did you get stuck?</Mono>
            <div style={{ display:"flex", flexDirection:"column", gap:6, margin:"12px 0 16px" }}>
              {stuckReasons.map(r => (
                <button key={r} onClick={()=>setStuckReason(r)} style={{
                  padding:"10px 14px", borderRadius:8,
                  background:stuckReason===r?C.amberDim:"transparent",
                  border:`1px solid ${stuckReason===r?C.amber+"44":C.border}`,
                  color:stuckReason===r?C.amberSoft:C.creamMid,
                  fontSize:13, fontFamily:F.body, textAlign:"left", transition:"all 0.12s ease",
                }}>{r}</button>
              ))}
            </div>
            <Rule my={16}/>
            <Mono c={C.amberSoft}>Alternative resource for you</Mono>
            <div style={{ marginTop:10 }}>
              <ResourceCard resource={{
                type:"ARTICLE",
                title:"Lenny Rachitsky — How to talk to users",
                why:"Shorter, more practical, specifically for first-time founder conversations.",
              }}/>
            </div>
          </div>
        )}

        {/* Skip encouragement */}
        {choice==="skip" && (
          <div className="fade-up" style={{
            background:C.surface, border:`1px solid ${C.border}`,
            borderRadius:12, padding:"16px 20px", marginBottom:20,
          }}>
            <p style={{ fontSize:13, color:C.creamMid, lineHeight:1.7 }}>
              That's okay. Life happens. The step will still be here next week.
              Small, consistent progress beats sporadic intensity every time.
            </p>
          </div>
        )}

        {choice && (
          <Btn onClick={()=>{ if(choice==="complete") onComplete(); else onBack(); }} full>
            {choice==="complete"?"Unlock next step →":"Return to my roadmap →"}
          </Btn>
        )}
      </div>
    </Screen>
  );
}

/* ═══════════════════════════════════════════════════
   SCREEN 6 — PRICING
═══════════════════════════════════════════════════ */
function Pricing({ onBack, onSelectTier }) {
  const plans = [
    {
      name:"Free", price:"£0", period:"forever",
      color:C.creamDim, features:[
        "Full 14-section blueprint",
        "Honest preview",
        "Roadmap steps 01 & 02",
        "Basic check-ins",
      ],
      cta:"Current plan", disabled:true,
    },
    {
      name:"Pro", price:"£9", period:"/month",
      color:C.amber, highlight:true,
      features:[
        "Everything in Free",
        "Full 8-step roadmap (both phases)",
        "Progress saved permanently",
        "Weekly Monday accountability emails",
        "Adaptive resources when stuck",
        "Resource library access",
      ],
      cta:"Start my full path →", tier:"pro",
    },
    {
      name:"Premium", price:"£29", period:"/month",
      color:C.blueSoft,
      features:[
        "Everything in Pro",
        "Private community Discord",
        "Monthly live Q&A session",
        "Priority support",
      ],
      cta:"Join BlueprintPath Premium →", tier:"premium",
    },
    {
      name:"Lifetime", price:"£149", period:"one-time",
      color:C.greenSoft,
      features:[
        "Everything in Pro forever",
        "No monthly payments",
        "Founding member badge",
        "All future features included",
      ],
      cta:"Get lifetime access →", tier:"lifetime",
    },
  ];

  return (
    <Screen nav={<><Btn variant="ghost" small onClick={onBack}>← Back</Btn><Logo/></>}>
      <div className="fade-up">
        <Mono c={C.amberSoft}>Pricing</Mono>
        <h2 style={{ fontFamily:F.display, fontSize:32, fontWeight:700, color:C.cream, margin:"10px 0 6px", lineHeight:1.15, letterSpacing:"-0.02em" }}>
          Choose your path
        </h2>
        <p style={{ fontSize:14, color:C.creamMid, marginBottom:28, lineHeight:1.6 }}>
          Start free. Upgrade when you're ready. Cancel anytime.
        </p>

        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
          {plans.map(p => (
            <div key={p.name} style={{
              background:p.highlight?C.amberDim:C.card,
              border:`1px solid ${p.highlight?C.amber+"55":C.border}`,
              borderRadius:12, padding:"20px",
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <Mono c={p.color}>{p.name}</Mono>
                  <div style={{ display:"flex", alignItems:"baseline", gap:4, marginTop:4 }}>
                    <span style={{ fontFamily:F.display, fontSize:28, fontWeight:700, color:C.cream }}>{p.price}</span>
                    <Mono c={C.creamDim}>{p.period}</Mono>
                  </div>
                </div>
                {p.highlight && <Tag color={C.amber}>Most Popular</Tag>}
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:16 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
                    <span style={{ color:p.color, fontSize:12, marginTop:1, flexShrink:0 }}>✓</span>
                    <span style={{ fontSize:13, color:C.creamMid, lineHeight:1.5 }}>{f}</span>
                  </div>
                ))}
              </div>

              {!p.disabled ? (
                <Btn
                  onClick={()=>onSelectTier(p.tier)}
                  variant={p.highlight?"primary":"outline"}
                  full
                >{p.cta}</Btn>
              ) : (
                <div style={{ padding:"12px", textAlign:"center", borderRadius:8, background:C.surface }}>
                  <span style={{ fontSize:13, color:C.creamDim, fontFamily:F.mono, letterSpacing:"0.08em" }}>CURRENT PLAN</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <p style={{ fontSize:11, color:C.creamDim, textAlign:"center", lineHeight:1.6, fontFamily:F.mono, letterSpacing:"0.06em" }}>
          UK VAT INCLUDED · CANCEL ANYTIME · HANDLED BY LEMON SQUEEZY
        </p>
      </div>
    </Screen>
  );
}

/* ═══════════════════════════════════════════════════
   ROOT APP CONTROLLER
═══════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen]       = useState("landing");
  const [answers, setAnswers]     = useState(null);
  const [aiData, setAiData]       = useState(null);
  const [checkinStep, setCheckinStep] = useState(null);
  const [checkinCb, setCheckinCb] = useState(null);
  const [tier, setTier]           = useState("free");
  const [isAdmin, setIsAdmin]     = useState(false);
  const [completed, setCompleted] = useState([]);
  const [tab, setTab]             = useState("blueprint");

  useEffect(() => {
    let mounted = true;
    const checkAdmin = async (userId) => {
      if (!userId) { if (mounted) { setIsAdmin(false); setTier("free"); } return; }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (mounted && data) { setIsAdmin(true); setTier("lifetime"); }
    };
    supabase.auth.getSession().then(({ data: { session } }) => checkAdmin(session?.user?.id));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      checkAdmin(session?.user?.id);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const go = (s) => { window.scrollTo(0,0); setScreen(s); };

  const handleIntake = (a) => {
    setAnswers(a);
    go("generating");
  };

  const handleGenerated = (data) => {
    setAiData(data);
    go("preview");
  };

  const handleCheckin = (stepIdx, cb) => {
    setCheckinStep(stepIdx);
    setCheckinCb(()=>cb);
    go("checkin");
  };

  const handleCheckinComplete = () => {
    if (checkinCb) checkinCb();
    go("output");
  };

  const handleUpgrade = () => isAdmin ? go("output") : go("pricing");

  const handleSelectTier = (t) => {
    setTier(t);
    go("output");
  };

  if (screen==="landing")    return <Landing onStart={()=>go("intake")}/>;
  if (screen==="intake")     return <Intake onNext={handleIntake} isAdmin={isAdmin}/>;
  if (screen==="generating") return <Generating answers={answers} onDone={handleGenerated} isAdmin={isAdmin}/>;
  if (screen==="preview")    return <Preview answers={answers} data={aiData} onNext={()=>go("output")}/>;
  if (screen==="output")     return <Output answers={answers} data={aiData} tier={tier} onCheckin={handleCheckin} onUpgrade={handleUpgrade} completed={completed} setCompleted={setCompleted} tab={tab} setTab={setTab}/>;
  if (screen==="checkin")    return <Checkin stepIndex={checkinStep} answers={answers} onComplete={handleCheckinComplete} onBack={()=>go("output")}/>;
  if (screen==="pricing")    return <Pricing onBack={()=>go("output")} onSelectTier={handleSelectTier}/>;

  return null;
}
