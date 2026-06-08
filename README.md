# SoloBlueprint

**AI-powered business blueprint generator for solo founders.**

Turn any business idea into a complete 14-section launch plan in under 60 seconds — tools, pricing, outreach scripts, and a 7-day action plan included.

🌐 **Live:** [www.soloblueprint.co.uk](https://www.soloblueprint.co.uk)

---

## What It Does

A solo founder enters their business idea and answers 5 questions (budget, hours/week, experience, goal). AI generates a complete 14-section blueprint tailored to their exact situation:

1. Business Idea Diagnosis
2. Real Problem & Demand
3. Target Audience
4. Clear Offer
5. Tools You Need
6. AI & No-Code Stack
7. Step-by-Step Launch Plan (5-phase, 14 days)
8. Pricing Strategy
9. Distribution Channels
10. Outreach Scripts (copy-paste ready)
11. Proof & Demo to Create
12. Honest Risks
13. 7-Day Action Plan
14. How to Scale Later

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite + Tailwind + shadcn/ui |
| Auth + Database | Supabase (eu-west-2) |
| Edge Functions | Supabase Edge Functions (Deno) |
| AI Engine | Claude API (claude-sonnet-4-5) |
| Hosting | Netlify (auto-deploy from GitHub) |
| Domain | soloblueprint.co.uk (Spaceship → Netlify DNS) |
| Payments | Stripe (live mode — active) |
| Monitoring | UptimeRobot + /healthz endpoint |

---

## Infrastructure

```
User Browser
    ↓
Netlify (React SPA — auto-deploys from GitHub main branch)
    + /healthz Netlify Function (monitoring)
    ↓ auth check
Supabase Auth (email/password)
    ↓ invoke
Supabase Edge Function: generate-blueprint (Deno)
    ↓ token check + deduction (refund on failure)
Supabase DB (token_balance, token_transactions, blueprints, blueprint_tags)
    ↓ API call
Claude API (claude-sonnet-4-5) — plain JSON response
    ↓ 14-section blueprint
Blueprint returned to user
    ↓ payment
Stripe Checkout → webhook → token credited instantly
```

---

## Repository

**GitHub:** `wks2019/SoloBlueprint`
**Branch:** `main` (production)
**Auto-deploy:** Every push to `main` triggers Netlify build

---

## Supabase

**Project ref:** `nlpgbwhxdrxsddhkkcwc`
**Region:** AWS eu-west-2
**URL:** `https://nlpgbwhxdrxsddhkkcwc.supabase.co`

### Database Tables

#### `blueprints`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Auth user |
| idea_name | string | Business idea |
| answers | json | Form answers |
| report | json | Full 14-section blueprint |
| created_at | timestamptz | Generation timestamp |

#### `token_balance`
| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | Primary key |
| balance | int | Current spendable tokens |
| total_purchased | int | Lifetime purchased |
| total_used | int | Lifetime used |
| updated_at | timestamptz | Last updated |

#### `token_transactions`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | User reference |
| amount | int | Positive = credit, negative = debit |
| reason | text | signup_bonus / blueprint_generated / purchase / gift / refund |
| stripe_session_id | text | Stripe session (for purchases) |
| created_at | timestamptz | Timestamp |

#### `blueprint_tags`
Admin catalogue tags for each blueprint.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| blueprint_id | uuid | Unique reference to blueprint |
| industry | text | Digital Product / SaaS / Service / Creator / Physical / Marketplace / Other |
| quality | text | Excellent / Good / Average / Poor |
| status | text | New / Reviewed / Featured / Flagged |
| notes | text | Admin notes |
| updated_at | timestamptz | Last updated |

### Triggers
- `on_auth_user_created_tokens` — fires on new signup, auto-creates `token_balance` row with 1 free token + logs `signup_bonus` transaction.

### Edge Functions
- `generate-blueprint` — checks token balance, deducts 1 token, calls Claude API, auto-refunds on failure, saves blueprint, returns 14-section JSON report.
- `create-checkout` — creates Stripe checkout session for token purchase.
- `stripe-webhook` — receives Stripe events, credits tokens on payment, handles monthly subscription renewal.

### Secrets (Supabase dashboard → Edge Functions → Secrets)
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY` (live)
- `STRIPE_PUBLISHABLE_KEY` (live)
- `STRIPE_WEBHOOK_SECRET` (live)

---

## Token System

**How it works:**
- Every new user gets **1 free token** on signup (DB trigger)
- Each blueprint generation costs **1 token**
- Failed generations automatically refund the token
- Admin email bypasses all token checks
- When tokens run out → Token Store modal → Stripe checkout

**Token Packs:**
| Pack | Tokens | Price | Per token |
|------|--------|-------|-----------|
| Starter | 3 | £9 | £3.00 |
| Builder | 10 | £19 | £1.90 |
| Pro Pack | 30 | £39 | £1.30 |
| Monthly Sub | 20/mo + rollover | £19/mo | £0.95 |

**Admin gifting:**
Admin can gift tokens to any user from the admin dashboard — no Stripe, no payment. Reasons: Failed generation, Goodwill, Beta tester, Referral, Support, Promo.

---

## Stripe Integration

**Mode:** Live (real payments active)
**Flow:**
1. User taps "Continue to payment" in Token Store
2. `create-checkout` edge function creates Stripe session
3. User redirected to Stripe hosted checkout
4. Payment completes → Stripe fires webhook → `stripe-webhook` credits tokens
5. User redirected to `/app?checkout=success` with success toast

**Live Price IDs:**
- Starter (3 tokens £9): `price_1TfSFoFTSPA2OpANpuBoGyNO`
- Builder (10 tokens £19): `price_1TfSFpFTSPA2OpANuX78PLBF`
- Pro Pack (30 tokens £39): `price_1TfSFpFTSPA2OpANZz2mbUeD`
- Monthly (20/mo £19): `price_1TfSFpFTSPA2OpANKrzFOeQz`

---

## User Flow

```
Landing page (www.soloblueprint.co.uk)
    ↓ interactive idea selector + dynamic CTA
Sign up / Sign in (/app/auth)
    ↓ 1 free token credited on signup
App home (/app) — token balance shown
    ↓ "Let's build this →"
Form (5 questions)
    ↓ Submit
Loading screen (animated progress)
    ↓ ~30-60 seconds
Blueprint results (14 colour-coded sections)
    ├── Sections 1-3 free
    ├── Sections 4-14 behind paywall
    ├── PDF download
    ├── Share link (/blueprint/:id — public)
    ├── Copy full text
    └── Start over
Token runs out → Token Store → Stripe checkout → tokens credited
```

---

## Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Landing.tsx | Public marketing site |
| `/app` | Index.tsx | App home (auth-gated) |
| `/app/auth` | Auth.tsx | Sign in / Sign up / Forgot / Reset / Admin mode |
| `/app/admin` | Admin.tsx | Admin dashboard (email-gated) |
| `/app/history` | History.tsx | User's past blueprints |
| `/blueprint/:id` | BlueprintView.tsx | Shared blueprint (public) |
| `/terms` | Terms.tsx | Terms & Conditions (UK law) |
| `/privacy` | Privacy.tsx | Privacy Policy (UK GDPR) |
| `/healthz` | Netlify Function | Health check endpoint |

---

## Key Components

| Component | Purpose |
|-----------|---------|
| `Landing.tsx` | Interactive landing — counter animation, scroll fade-ins, idea selector, dynamic CTA, blueprint preview, FAQ, pricing |
| `HomeView.tsx` | App home — token balance, CTA, blueprint includes preview |
| `FormView.tsx` | 5-question form with indigo pill options |
| `LoadingView.tsx` | Animated progress indicator |
| `ResultsView.tsx` | Colour-coded 14-section blueprint output |
| `AccountMenu.tsx` | Avatar dropdown — admin badge OR token balance, history, change password, logout |
| `TokenStore.tsx` | Token purchase modal — 4 packs, Stripe checkout |
| `Logo.tsx` | Clickable logo — navigates to `/` |

---

## Admin Dashboard

**Access:** `/app/admin` — `mvlasceanu26.vm@gmail.com` only

**Features:**
- Stats cards (total blueprints, unique users, today, this week)
- Bar chart — last 14 days activity
- Gift tokens — gift 1/3/5/10 tokens to any user by email, with reason
- Blueprint catalogue — inline tagging (Industry / Quality / Status / Notes)
- Filter bar — filter by tag or Untagged
- Click any blueprint row → view full blueprint
- Admin email bypasses all token checks and paywall

---

## Design System

- **Fonts:** DM Serif Display (headings), DM Sans (body)
- **Primary:** `#4f46e5` (indigo)
- **Pill style:** `bg-indigo-50 border-indigo-100 text-indigo-600 rounded-full`
- **Section colour coding:**
  - Strategy: `#4f46e5` (indigo)
  - Market: `#16a34a` (green)
  - Build: `#ea580c` (orange)
  - Growth: `#9333ea` (purple)
- **No em dashes anywhere** — use colon, comma, or rewrite

---

## Authentication

- Email + password via Supabase Auth
- Admin mode button in auth footer → dedicated admin sign in form
- Admin email always redirects to `/app/admin`
- Regular users redirect to `/app`
- Password reset via email link → `/app/auth` (type=recovery)
- Site URL: `https://www.soloblueprint.co.uk`
- Redirect URL: `https://www.soloblueprint.co.uk/app/auth`
- Email templates branded as SoloBlueprint

---

## Monitoring

**UptimeRobot:** Pings `/healthz` every 5 minutes. Alerts `mvlasceanu26.vm@gmail.com` if down.

**`/healthz` endpoint checks:**
- Supabase connection
- Edge function reachability
- Anthropic API reachability
- Stripe API reachability

Returns JSON: `{ status, timestamp, latency_ms, services }`

---

## Deployment

**Auto-deploy:** Push to `main` → Netlify builds automatically

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Deploy edge functions:**
```bash
SUPABASE_ACCESS_TOKEN=<token> supabase functions deploy generate-blueprint --project-ref nlpgbwhxdrxsddhkkcwc --use-api
```

---

## DNS

- **Registrar:** Spaceship
- **DNS:** Managed by Netlify (dns1-4.p07.nsone.net)
- Both `soloblueprint.co.uk` and `www.soloblueprint.co.uk` → Netlify
- SSL: Auto-provisioned (Let's Encrypt)

---

## Legal

- **T&Cs:** Plain English summary + full legal — UK law, England & Wales
- **Privacy Policy:** UK GDPR compliant — admin access disclosed, blueprint cataloguing disclosed, Anthropic processing disclosed
- **AI disclaimer:** All outputs for informational purposes only

---

## What's Built

- ✅ Interactive landing page (counter, scroll animations, idea selector, blueprint preview)
- ✅ Auth system — sign up, sign in, forgot password, reset, admin mode
- ✅ Public landing at `/` — app at `/app`
- ✅ Blueprint generation — 14 sections, plain JSON (no tool_use, prevents timeout)
- ✅ Token system — 1 free on signup, deduct on generation, auto-refund on failure
- ✅ Stripe integration — live mode, 4 packs, checkout + webhook, instant token crediting
- ✅ Admin gift tokens — gift to any user by email with reason
- ✅ Blueprint catalogue — inline tagging, filter bar, click to view
- ✅ Colour-coded results view (strategy/market/build/growth)
- ✅ Paywall gate — sections 1-3 free, 4-14 behind payment
- ✅ PDF export, share link, copy text
- ✅ Blueprint history
- ✅ Account menu — admin badge vs token balance
- ✅ Admin dashboard — stats, chart, gift tokens, catalogue
- ✅ T&Cs + Privacy Policy (UK GDPR)
- ✅ /healthz monitoring endpoint
- ✅ UptimeRobot monitoring (5-min pings)
- ✅ Logo links to landing page
- ✅ Responsive — all screen sizes
- ✅ No em dashes anywhere

---

## What's Pending

- 🔜 **Logo** — Marius designing externally
- 🔜 **Anthropic auto-reload** — set $20 top-up when balance hits $2
- 🔜 **Make.com automation** — welcome email on signup, nudge after 48hrs
- 🔜 **Perplexity API** — live market research for Pro tier
- 🔜 **Firecrawl** — competitor scraping for Pro tier
- 🔜 **Referral system** — share blueprint → earn tokens

---

## North Star Rule

> Every decision, feature, and build must be made with the goal of growing this into a million-dollar product. Always think scale, retention, and revenue impact before building anything.

**Default skills always active:** `/g` · `/p` · `/sd` · `/ui` · `/ghost`

**All slash commands:**
| Command | Skill |
|---------|-------|
| `/g` | Growth |
| `/p` | Prioritize |
| `/sd` | System design |
| `/ui` | Graphic & UI design |
| `/ghost` | Ghostwrite in user's voice |
| `/rm` | Roadmap |
| `/ss` | Step-by-step |
| `/o` | Optimizer |
| `/oc` | Optimize code |
| `/tr` | Track |
| `/icp` | Ideal customer profile |
| `/h` | Hook |
| `/v` | Viral |
| `/per` | Persuasive |
| `/auth` | Authority |
| `/d` | Data |
| `/eng` | Engagement |
| `/tf` | Tone formal |
| `/audit` | Full audit |
| `/funnel` | Conversion funnel |
| `/email` | Email sequences |
| `/pitch` | Pitch structure |

---

## Infra Upgrade Triggers

| Revenue | Action |
|---------|--------|
| £5k/month | Add job queue (Inngest or Trigger.dev) in front of Claude API |
| 10k+ users | Dedicated Postgres + PgBouncer (built into Supabase) |
| £50k/month | Move edge functions to Railway or Fly.io |

---

*Built by solo founders, for solo founders. soloblueprint.co.uk*

---

## Changelog

### June 8, 2026
- **Form redesign** — unified idea input: `ideaName` single source of truth, `customIdea` removed, description textarea is primary input, idea grid is shortcut only
- **Form UX** — "Not sure where to start?" divider, helper text above grid, fallback line below grid, country made optional, button activates from description alone
- **Em dashes purged** — zero em dashes remaining across entire codebase: FormView, AccountMenu, App, index.css, mockData.js, index.html, all edge functions. Permanent rule.
- **Resend SMTP connected** — all Supabase auth emails now route through hello@soloblueprint.co.uk via smtp.resend.com:587
- **Email rate limit raised** — from 2/hour to 100/hour via Supabase auth config
- **Email confirmation disabled** — users sign up and get straight in, no confirmation email required (re-enable once Resend SMTP verified)
- **Admin audit rules** — /audit now reads all project chats first before reporting
- **Memory updated** — Resend API key, communication rules, audit rules, README update rule all added to persistent memory

### June 7, 2026
- **Stripe live mode activated** — real payments active, all 4 live price IDs created
- **Gift tokens admin section** — gift 1/3/5/10 tokens to any user by email with reason selector
- **Auto-refund on failure** — tokens always returned if blueprint generation fails
- **Supabase project fix** — app was pointing at wrong Supabase project (Lovable), fixed to nlpgbwhxdrxsddhkkcwc
- **Blueprint generation fix** — rewrote edge function without tool_use schema, plain JSON response, all 14 sections generating within 150s timeout
- **Admin sign in fix** — admin email always redirects to /app/admin regardless of form mode
- **/healthz endpoint** — Netlify function monitoring Supabase, edge function, Anthropic, Stripe
- **UptimeRobot** — pings /healthz every 5 minutes, alerts mvlasceanu26.vm@gmail.com
- **Landing page** — testimonials replaced with real blueprint preview (browser mockup, blurred locked sections, paywall card)
- **RLS policies** — users can only read/insert their own data across all tables
- **Supabase auth** — site URL, redirect URLs, email subjects branded as SoloBlueprint
