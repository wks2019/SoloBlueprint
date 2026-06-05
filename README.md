# SoloBlueprint

**AI-powered business blueprint generator for solo founders.**

Turn any business idea into a complete 14-section launch plan in under 60 seconds — tools, pricing, outreach scripts, and a 7-day action plan included.

🌐 **Live:** [www.soloblueprint.co.uk](https://www.soloblueprint.co.uk)

---

## What It Does

A solo founder enters their business idea and answers 5 questions (budget, hours/week, experience, goal). Claude AI generates a complete 14-section blueprint tailored to their exact situation:

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
| AI Engine | Claude API (claude-sonnet-4-20250514) |
| Hosting | Netlify (auto-deploy from GitHub) |
| Domain | soloblueprint.co.uk (Spaceship → Netlify DNS) |
| Payments | Stripe (integration pending) |

---

## Infrastructure

```
User Browser
    ↓
Netlify (React SPA — auto-deploys from GitHub main branch)
    ↓ auth check
Supabase Auth (email/password)
    ↓ invoke
Supabase Edge Function: generate-blueprint (Deno)
    ↓ token check + deduction
Supabase DB (token_balance, token_transactions, blueprints)
    ↓ API call
Claude API (claude-sonnet-4-20250514)
    ↓ structured output via tool_use
Blueprint returned to user
    ↓ payment (Stripe — pending)
Token store → credit tokens → unlock generation
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
Stores every generated blueprint.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Auth user (nullable for anon) |
| idea_name | string | Business idea |
| answers | json | Form answers |
| report | json | Full 14-section blueprint |
| created_at | timestamptz | Generation timestamp |

#### `token_balance`
One row per user — live token balance.
| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | Primary key (references auth.users) |
| balance | int | Current spendable tokens |
| total_purchased | int | Lifetime purchased |
| total_used | int | Lifetime used |
| updated_at | timestamptz | Last updated |

#### `token_transactions`
Audit log of every token credit/debit.
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | User reference |
| amount | int | Positive = credit, negative = debit |
| reason | text | signup_bonus / blueprint_generated / purchase |
| stripe_session_id | text | Stripe session (for purchases) |
| created_at | timestamptz | Timestamp |

#### `profiles`
User profile data (display name etc.)

### Triggers
- `on_auth_user_created_tokens` — fires on new signup, auto-creates `token_balance` row with 1 free token + logs `signup_bonus` transaction.

### Edge Functions
- `generate-blueprint` — main AI function. Checks token balance, deducts 1 token, calls Claude API, saves blueprint, returns structured report.

### Secrets (set in Supabase dashboard)
- `ANTHROPIC_API_KEY` — Claude API key

---

## Token System

SoloBlueprint uses a token-based monetisation model (inspired by Claude.ai).

**How it works:**
- Every new user gets **1 free token** on signup
- Each blueprint generation costs **1 token**
- When tokens run out → Token Store modal appears
- Users buy token packs via Stripe

**Token Packs (pricing):**
| Pack | Tokens | Price | Per token |
|------|--------|-------|-----------|
| Starter | 3 | £9 | £3.00 |
| Builder | 10 | £19 | £1.90 |
| Pro Pack | 30 | £39 | £1.30 |
| Monthly Sub | 20/mo + rollover | £19/mo | £0.95 |

**Why tokens over fixed plans:**
- Lower barrier to first purchase (£9 impulse buy)
- Unused tokens reduce churn — users stay for their balance
- Flexible for power users and one-time users
- Natural upsell path ("2 tokens left")
- Monthly sub = predictable MRR with rollover loyalty hook

---

## User Flow

```
Landing page (www.soloblueprint.co.uk)
    ↓ "Build My Blueprint →"
Sign up / Sign in (/auth)
    ↓ email + password
Home screen (token balance shown)
    ↓ "Build My Blueprint →"
Form (5 questions)
    ↓ Submit
Loading screen (animated 7-step progress)
    ↓ ~30 seconds
Blueprint results
    ├── All 14 sections (first blueprint free)
    ├── PDF download
    ├── Share link (/blueprint/:id)
    ├── Copy full text
    └── Start over
Token runs out → Token Store modal → Stripe checkout (pending)
```

---

## Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Index.tsx | Main app (auth-gated) |
| `/auth` | Auth.tsx | Sign in / Sign up / Forgot password / Reset password |
| `/admin` | Admin.tsx | Admin dashboard (mvlasceanu26.vm@gmail.com only) |
| `/history` | History.tsx | User's past blueprints |
| `/blueprint/:id` | BlueprintView.tsx | Shared blueprint (public link) |

---

## Key Components

| Component | Purpose |
|-----------|---------|
| `HomeView.tsx` | Landing screen with token balance, CTA, logout |
| `FormView.tsx` | 5-question form |
| `LoadingView.tsx` | Animated 7-step progress indicator |
| `ResultsView.tsx` | Blueprint output with share/PDF/copy |
| `AccountMenu.tsx` | Avatar dropdown — token balance, history, change password, cancel sub, logout |
| `TokenStore.tsx` | Token purchase modal (4 packs) |
| `Logo.tsx` | Brand logo component |

---

## Admin Dashboard

**Access:** `/admin` — only accessible when logged in as `mvlasceanu26.vm@gmail.com`

**Features:**
- Total blueprints generated
- Unique users
- Today's count
- This week's count
- Bar chart — last 14 days activity
- Full list of recent blueprints (idea, budget, hours, experience, date)

**How to access:**
1. Sign in as admin email
2. Click **Admin** button (top right of home screen)
3. Or click **Admin Access** button at bottom of login page

---

## Authentication

- Email + password via Supabase Auth
- Email confirmation required on signup
- Forgot password → reset link sent to email
- Password reset handled in-app at `/auth` (type=recovery hash)
- Site URL: `https://www.soloblueprint.co.uk`
- Redirect URL: `https://www.soloblueprint.co.uk/auth`

---

## Deployment

**Auto-deploy:** Push to `main` → Netlify builds automatically

**Build settings (netlify.toml):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Manual deploy via CLI:**
```bash
SUPABASE_ACCESS_TOKEN=<token> supabase functions deploy generate-blueprint --project-ref nlpgbwhxdrxsddhkkcwc --use-api
```

---

## DNS Configuration

- **Registrar:** Spaceship
- **DNS:** Managed by Netlify
- **Nameservers:**
  - dns1.p07.nsone.net
  - dns2.p07.nsone.net
  - dns3.p07.nsone.net
  - dns4.p07.nsone.net
- Both `soloblueprint.co.uk` and `www.soloblueprint.co.uk` point to Netlify
- SSL/TLS: Auto-provisioned by Netlify (Let's Encrypt)

---

## Environment Variables

### Supabase Edge Function Secrets
Set in Supabase dashboard → Edge Functions → Secrets:
- `ANTHROPIC_API_KEY` — Claude API key

### Netlify Environment (if needed)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## What's Built

- ✅ Landing page (DM Serif Display + indigo #4f46e5 brand)
- ✅ Auth system (sign up, sign in, forgot password, reset password)
- ✅ Auth gate — unauthenticated users redirected to /auth
- ✅ Blueprint generation via Claude API (replaced Lovable gateway)
- ✅ 14-section structured blueprint output
- ✅ Token system (DB tables, trigger, edge function gate)
- ✅ 1 free token on signup
- ✅ Token store UI (4 packs)
- ✅ Token balance shown in home screen + account menu
- ✅ Animated loading screen (7-step progress)
- ✅ Blueprint history (/history)
- ✅ Share link (/blueprint/:id — public)
- ✅ PDF export
- ✅ Copy full blueprint text
- ✅ Account menu (token balance, history, change password, cancel sub, logout)
- ✅ Admin dashboard with usage tracking
- ✅ Admin-only access (email-gated)
- ✅ SPA routing fix (netlify.toml redirects)

---

## What's Pending

- 🔜 **Stripe integration** — checkout + webhooks to credit tokens
- 🔜 **Token purchase flow** — /checkout?pack= route
- 🔜 **Cancel subscription** — Stripe customer portal link
- 🔜 **T&Cs + Privacy Policy** pages
- 🔜 **Email branding** — Supabase email templates branded as SoloBlueprint
- 🔜 **Make.com automation** — welcome email on signup, nudge after 48hrs
- 🔜 **Perplexity API** — live market research for Pro tier
- 🔜 **Firecrawl** — competitor scraping for Pro tier
- 🔜 **Referral system** — share blueprint → earn tokens
- 🔜 **Blueprint rating** — thumbs up/down for quality tracking

---

## North Star Rule

> Every decision, feature, and build must be made with the goal of growing this into a million-dollar product. Always think scale, retention, and revenue impact before building anything.

**Default skills always active:** `/g` (growth) · `/p` (prioritize) · `/sd` (system design)

**On-demand build commands:**
| Command | Skill |
|---------|-------|
| `/rm` | Roadmap — timeline-based steps |
| `/ss` | Step-by-step — clear numbered steps |
| `/o` | Optimizer — improve what's given |
| `/oc` | Optimize code — improve performance |
| `/tr` | Track — build a tracking system |

**On-demand content commands:**
| Command | Skill |
|---------|-------|
| `/icp` | Ideal customer profile |
| `/h` | Hook — strong opening lines |
| `/v` | Viral — high engagement style |
| `/per` | Persuasive — convincing tone |
| `/auth` | Authority — expert tone |
| `/d` | Data — include stats |
| `/eng` | Engagement — increase engagement |
| `/tf` | Tone formal — formal writing |

---

## Legal

AI outputs are for informational purposes only and do not constitute professional business, legal, financial, or investment advice. Always consult qualified professionals before acting on any information provided by this tool.

---

*Built by solo founders, for solo founders. soloblueprint.co.uk*
