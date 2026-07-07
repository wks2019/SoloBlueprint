# SoloBlueprint

AI-powered business blueprint generator. Turns any business idea into a 14-section launch plan in under 60 seconds.

Live: https://soloblueprint.co.uk

## Stack
- Frontend: React + TypeScript + Vite + Tailwind
- Auth/DB/Edge: Supabase (ref: nlpgbwhxdrxsddhkkcwc, eu-west-2)
- AI: Claude API (claude-sonnet-4-5) via edge function generate-blueprint
- Hosting: Netlify (auto-deploy on push to main)
- Payments: Stripe live (4 tiers)
- Email: Resend (hello@soloblueprint.co.uk)
- Monitoring: UptimeRobot via /healthz (every 5 min)

## Status: LIVE + MONETISED
- Full Stripe integration: checkout, webhook, token crediting
- Blueprint + Roadmap generation working
- Admin dashboard: users, gift tokens
- Landing page with CRO fixes deployed
- Email confirmation disabled (instant app entry)
- Em dashes banned codebase-wide

## Changelog
### 2026-07-07
- Roadmap UX: skeleton loaders + staggered slideIn animations (80ms cascade)
- README rewritten (was stale Lovable boilerplate)

### 2026-06 (from prior sessions)
- Stripe live mode: 4 pricing tiers, webhook, instant token crediting
- Unified idea input form, ideaName single source of truth
- System prompt upgrade: sharper frameworks, pitch narrative
- 6 CRO audit bugs fixed on Landing.tsx
- /healthz endpoint + UptimeRobot
- Resend SMTP, email rate limit fix
- Em dash purge, full codebase

## Deploy rules
- Show artifact first, deploy only after approval, batch deploys
- Edge functions: SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy <fn> --project-ref nlpgbwhxdrxsddhkkcwc --use-api
- Netlify functions need .mts extension
