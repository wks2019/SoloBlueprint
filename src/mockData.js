// SoloBlueprint mock data
// Returns a hardcoded 14-section report for a given business idea name.
// When the API is wired up later, replace getMockReport() with a fetch call.

const KEYS = [
  "diagnosis",
  "problem_and_demand",
  "target_audience",
  "clear_offer",
  "tools_needed",
  "ai_nocode_stack",
  "launch_plan",
  "pricing_strategy",
  "distribution_channels",
  "outreach_scripts",
  "proof_needed",
  "honest_risks",
  "seven_day_plan",
  "how_to_scale",
];

const REPORTS = {
  "AI Content Repurposing Service": {
    diagnosis:
      "A strong service business for 2025. Creators publish more video and podcast content than they can repackage. You can turn one long video into 30+ assets using AI. Low overhead, fast to start, and easy to prove value with a free sample.",
    problem_and_demand:
      "Creators, coaches and B2B founders constantly produce long-form content (YouTube, podcasts, webinars) but lack time to cut clips, write LinkedIn posts and turn transcripts into newsletters. They are already paying VAs £400–£1,500/month for this. Demand is steady on Upwork, LinkedIn and X.",
    target_audience:
      "Best niches to start: B2B SaaS founders with podcasts, business coaches with YouTube channels, and finance/health creators on Spotify. Sweet spot: 5k–100k followers , big enough to pay, small enough to be reachable.",
    clear_offer:
      "Starter package: From 1 long-form video per week, deliver: 1 LinkedIn carousel, 5 short-form clips with captions, 3 tweets/threads, 1 newsletter draft. Turnaround 48 hours. Position as 'Your podcast in 30 places' rather than 'content repurposing'.",
    tools_needed:
      "Opus Clip or Vizard (auto clips), Descript (transcripts + edits), Canva Pro (carousels), CapCut (final captions), Notion (client dashboard), Google Drive (delivery), Loom (sample walkthroughs).",
    ai_nocode_stack:
      "ChatGPT or Claude for hooks, headlines, threads. Submagic for captions. Castmagic to auto-generate show notes, summaries, quote cards. Zapier or Make to push finished assets into a shared client folder.",
    launch_plan:
      "Week 1: Pick 1 niche. Build 1 portfolio sample by repurposing a public podcast for free. Week 2: DM 30 creators in that niche with the sample. Week 3: Land 1–2 paid pilots at £200–£400. Week 4: Raise price, add testimonial, systemise delivery in Notion.",
    pricing_strategy:
      "Pilot: £200 one-off. Standard retainer: £600/month for 4 episodes. Premium: £1,200/month with shorts, carousels and newsletter. Always quote per month, never per hour. Add a £150 setup fee from month 2 onward.",
    distribution_channels:
      "1) LinkedIn outbound DMs to podcast hosts. 2) Reply guy strategy on X to creators in your niche. 3) Post 3x/week showing before/after of public episodes. 4) Upwork as a backup channel for fast cash.",
    outreach_scripts:
      "DM: 'Hey {name}, loved your episode on {topic}. I cut 5 short clips + a LinkedIn carousel from it as a sample , want me to send it over? No catch, just showing what I do.' Follow-up after 3 days: 'Bumping this , sample is ready whenever.'",
    proof_needed:
      "Build 2 free portfolio samples from well-known public podcasts in your niche. Record a 2-minute Loom showing your process. Put both on a 1-page Carrd or Notion site. That's enough proof to charge £600/month.",
    honest_risks:
      "AI tools are commoditising basic clipping , your edge has to be taste, hooks, and reliability. Clients churn fast if quality dips. Don't take more than 4 clients until you have a clear SOP.",
    seven_day_plan:
      "Day 1: Choose niche + 20 target creators. Day 2: Set up tools and templates. Day 3: Build sample #1. Day 4: Build sample #2 + portfolio page. Day 5: Send 15 cold DMs. Day 6: Send 15 more + follow up. Day 7: Get on 1 call, close 1 pilot.",
    how_to_scale:
      "At £3k/month: hire a junior editor at £8/hr to handle clipping while you handle hooks and client comms. At £8k/month: productise into fixed packages, build a Notion-based client portal, and start a waitlist. Long term: niche down to one industry and become the default option there.",
  },

  "AI Automation Setup for SMBs": {
    diagnosis:
      "Excellent fit for 2025. Small businesses know they 'should use AI' but have no idea where to start. You package that confusion into a clear deliverable: an automation that saves 5+ hours per week. Deliver in days, get paid £500–£2,000.",
    problem_and_demand:
      "Plumbers, dentists, agencies and e-commerce stores waste time on lead replies, invoicing reminders, review requests and onboarding emails. They will gladly pay to make it 'just work'. Demand is exploding on LinkedIn and local Facebook groups.",
    target_audience:
      "Best to start with one vertical you understand. Good options: home service businesses (plumbers, electricians), small marketing agencies, Shopify stores doing £20k–£200k/month, real estate teams.",
    clear_offer:
      "'AI Lead Responder Setup': capture every form/missed call → AI replies in 60 seconds → books a call in their calendar → notifies the owner. Delivered in 7 days. Includes 30-day support.",
    tools_needed:
      "Make.com or n8n (orchestration), Airtable (data), Cal.com (booking), Twilio (SMS), Gmail/Outlook integration, Loom (handover video), ClickUp or Notion (project tracking).",
    ai_nocode_stack:
      "OpenAI or Claude for reply generation, Whisper for voicemail transcription, Pinecone or Supabase for company knowledge base, Zapier as fallback when Make can't connect to a niche tool.",
    launch_plan:
      "Week 1: Pick vertical, build 1 demo automation for a fake company. Week 2: Record 90-second demo video, post in 3 niche communities. Week 3: Offer 'free audit calls' to interested owners. Week 4: Close 1 paid build at £750.",
    pricing_strategy:
      "Audit call: free. Build: £750–£1,500 fixed price. Monthly maintenance: £150/month per active automation. Always quote in 'hours saved per week × your client's hourly rate' to anchor value.",
    distribution_channels:
      "1) Local BNI / chamber of commerce events. 2) LinkedIn posts showing before/after. 3) Facebook groups for your chosen vertical. 4) Partnerships with local web designers who don't do automation.",
    outreach_scripts:
      "Email: 'Hi {name}, I help {vertical} stop losing leads from missed calls and slow replies. I built a 60-second AI responder for businesses like yours , happy to show you a 5-min demo if useful. Worth a quick look?'",
    proof_needed:
      "1 fully-built demo automation you can screen-share. 1 case study (even from a friend's business done at cost). A simple Notion page with 'what you get / timeline / price'. That's enough to close mid-4-figure deals.",
    honest_risks:
      "Clients will ask for endless tweaks if scope isn't tight. Lock down deliverables in writing. Some automations break when third-party APIs change , charge maintenance to cover that.",
    seven_day_plan:
      "Day 1: Choose vertical. Day 2–3: Build the demo automation end-to-end. Day 4: Record demo Loom. Day 5: Post in 3 communities + DM 20 owners. Day 6: Follow up + book 3 calls. Day 7: Run calls, close 1 pilot.",
    how_to_scale:
      "Productise 3 fixed automations and sell them by name ('Lead Responder', 'Review Engine', 'Onboarding Bot'). At £5k/month: hire a Make.com freelancer to build while you sell. Long term: niche to one vertical and become the operator's choice.",
  },

  "Canva Template Shop": {
    diagnosis:
      "Low-effort, high-margin digital product business. Sells 24/7 with no support load. Realistic to hit £500–£2k/month within 6 months if you pick the right niche and post consistently on Pinterest and Instagram.",
    problem_and_demand:
      "Coaches, small business owners and content creators need professional-looking visuals but can't design. They will happily pay £8–£40 for a template pack that saves them hours. Steady demand on Etsy, Creative Market and Gumroad.",
    target_audience:
      "Best buyers: female solopreneurs, coaches, real estate agents, wedding vendors, course creators. Avoid 'designers' as a target , they make their own.",
    clear_offer:
      "Launch with 1 focused pack of 30 Instagram carousel templates for a specific niche (e.g. 'Mindset coaches'). Sell at £19. Bundle of 3 packs at £39. Always sell to one persona, not 'everyone'.",
    tools_needed:
      "Canva Pro (design), Etsy or Gumroad or Payhip (storefront), Pinterest Business account (traffic), Tailwind or Later (scheduling), Beacons or Linktree (link in bio).",
    ai_nocode_stack:
      "ChatGPT for caption ideas inside templates and product descriptions. Midjourney or Ideogram for unique background graphics. Canva's Magic Studio for quick variants. Notion for product roadmap.",
    launch_plan:
      "Week 1: Pick 1 buyer persona, design pack #1 (30 templates). Week 2: Set up Etsy + Gumroad listings, write SEO descriptions. Week 3: Pin 30 Pinterest pins, post 5 Reels. Week 4: Launch pack #2, build email list.",
    pricing_strategy:
      "Single pack: £19. Bundle of 3: £39. Mega bundle (all packs): £79. Run a 7-day launch discount of 20% for each new pack. Never go below £15 , it kills perceived value.",
    distribution_channels:
      "1) Pinterest is #1 for templates , fresh pins daily. 2) Etsy SEO (long-tail keywords). 3) Instagram Reels showing 'before/after' of using the template. 4) Email list from a free mini-pack lead magnet.",
    outreach_scripts:
      "No cold outreach needed , this is search + content. Caption hook: 'POV: you spent 4 hours making 1 Instagram post. This pack does 30 in 20 minutes.' Pin title: 'Aesthetic Instagram Templates for Mindset Coaches'.",
    proof_needed:
      "Mockups in real iPhone frames, not flat exports. A 15-second Reel showing how easy editing is. 5 detailed Etsy listing photos per pack. That's the proof that converts cold buyers.",
    honest_risks:
      "Etsy fees + ad costs eat margin. Designs get copied fast. Algorithm shifts on Pinterest can tank traffic. Mitigation: build an email list from day one and own your audience.",
    seven_day_plan:
      "Day 1: Pick niche + research top sellers. Day 2–3: Design 30 templates. Day 4: Create mockups. Day 5: Set up Etsy + Gumroad. Day 6: Make 20 Pinterest pins. Day 7: Post on IG + go live.",
    how_to_scale:
      "Add adjacent products (Reels covers, lead magnet templates, email banners). Launch a £29/month subscription for new templates monthly. At £3k/month: hire a VA to make Pinterest pins. Long term: build a brand around one niche.",
  },

  "Notion Template Shop": {
    diagnosis:
      "Strong digital product play. Notion's user base keeps growing and paying customers expect polished templates. Lower volume than Canva, but higher per-unit price (£25–£99). Great compounding asset.",
    problem_and_demand:
      "Freelancers, founders, students and creators want 'a system' but freeze in front of a blank Notion page. They pay for clarity and structure. Top sellers on Gumroad clear £10k/month. Demand is real and growing.",
    target_audience:
      "Best buyers: freelancers (CRM, finances), solopreneurs (second brain), content creators (content OS), ADHD/productivity audiences, students. Pick ONE.",
    clear_offer:
      "Launch with 1 flagship template that solves a clear job, e.g. 'Freelance Operating System' (clients, invoices, tasks, finances in one). Price £49. Add a £19 lite version later as funnel entry.",
    tools_needed:
      "Notion (build), Loom (walkthrough video), Gumroad or Lemon Squeezy (storefront), Carrd or Framer (landing page), ConvertKit or Beehiiv (email list), Tella (high-quality demo video).",
    ai_nocode_stack:
      "ChatGPT to draft template copy, formulas and database descriptions. Notion AI inside the template as a selling point. Make.com to auto-deliver template duplicate links + email sequences.",
    launch_plan:
      "Week 1: Build flagship template + record 3-min walkthrough. Week 2: Build landing page, set up Gumroad. Week 3: Soft launch on Twitter/LinkedIn with founder story. Week 4: Pitch on Reddit, IndieHackers, niche newsletters.",
    pricing_strategy:
      "Flagship: £49. Lite version: £19. Bundle: £69. Lifetime updates included as default , strong sales driver. Offer a 7-day no-questions refund to lower buyer risk.",
    distribution_channels:
      "1) X/Twitter is #1 for Notion buyers , build in public + thread launches. 2) YouTube tutorials of your template. 3) Affiliate program at 30% for niche creators. 4) Listings on Notion gallery + UseNotion.com.",
    outreach_scripts:
      "Launch tweet: 'I built {template name}. It's the system I wish I had when I started {niche}. Includes: {3 bullets}. Free duplicate for the first 50 RTs. Link below.'",
    proof_needed:
      "1 polished demo video (Tella, not Loom for sales). 6+ landing page screenshots. 3 testimonials from beta testers (give it free in exchange). A free mini-template as lead magnet.",
    honest_risks:
      "High refund rate if template is too complex. Notion changes break formulas occasionally. Templates get pirated , accept it and outpace via updates and community.",
    seven_day_plan:
      "Day 1: Decide niche + outline template. Day 2–4: Build template. Day 5: Record demo + write landing page. Day 6: Set up Gumroad + payment. Day 7: Launch with thread + DM 30 niche creators.",
    how_to_scale:
      "Build 3–5 templates around one niche → bundle them → launch a community at £15/month. At £5k/month: bring on an affiliate manager. Long term: become the go-to brand for one specific Notion use case.",
  },

  "Resume & LinkedIn Profile Writer": {
    diagnosis:
      "Evergreen service with high willingness to pay. People in job transitions are emotional buyers , they want help fast. Easy to start with zero stack, zero inventory. Reliable £1k–£4k/month within 90 days.",
    problem_and_demand:
      "Mid-career professionals struggle to articulate impact. Layoffs are constant. AI tools produce generic results that don't get interviews. Buyers will pay £150–£500 for a real human who can position them.",
    target_audience:
      "Sweet spot: mid-senior professionals (£60k–£150k salary), career-switchers, returning parents, and tech workers post-layoff. Avoid grads , they have no money and need a different product.",
    clear_offer:
      "'Career Reset Package': 1x 45-min discovery call → fully rewritten CV + LinkedIn About + headline + 5-message outreach scripts. Delivered in 5 working days. £349.",
    tools_needed:
      "Google Docs (drafts), Canva (1 CV template), Calendly (calls), Stripe or Wise (payments), Zoom (calls), Loom (walkthrough of changes), Notion (client tracker).",
    ai_nocode_stack:
      "ChatGPT to brainstorm verbs and reframe achievements. Claude for long-form rewrites. Grammarly for polish. Make.com to send post-purchase intake form + booking link automatically.",
    launch_plan:
      "Week 1: Build 1 anonymised before/after case study. Week 2: Post on LinkedIn 3x with case study. Week 3: DM 30 connections in transition. Week 4: Close 2 clients at £299 launch price, raise to £349.",
    pricing_strategy:
      "Entry: £199 (CV only). Standard: £349 (CV + LinkedIn + scripts). Premium: £599 (adds 30-day interview prep). Always offer 3 tiers , most pick the middle.",
    distribution_channels:
      "1) LinkedIn (your home turf as a CV writer). 2) Niche Slack/Discord communities. 3) Career-pivot Facebook groups. 4) Partnerships with career coaches who don't write CVs.",
    outreach_scripts:
      "DM: 'Hey {name}, saw you're exploring new roles. I rewrite CVs + LinkedIn profiles for {role type} , last client landed 4 interviews in 10 days after the rewrite. Want me to send a 60-sec audit of your current profile? No charge.'",
    proof_needed:
      "1 anonymised before/after PDF. 3 written testimonials with photo. 1 short Loom of you reviewing a real profile. A free 'LinkedIn headline checklist' as lead magnet.",
    honest_risks:
      "Outcome (interviews/jobs) depends on factors you can't control , set expectations early. Clients ghost mid-process. Use a 50% upfront deposit to filter serious buyers.",
    seven_day_plan:
      "Day 1: Build offer page on Carrd. Day 2: Build 1 case study. Day 3–4: Post on LinkedIn + DM 20 people. Day 5: Run free audits to build interest. Day 6: Convert 2 audits to paid. Day 7: Deliver fast and ask for testimonial.",
    how_to_scale:
      "Niche down by industry (e.g. 'CVs for product managers'). Add a £49 template + course bundle for budget buyers. At £4k/month: hire another writer and become the editor. Long term: launch a small agency or course.",
  },

  "Simple Landing Page Service": {
    diagnosis:
      "Solid starter business. Every coach, freelancer and SaaS founder needs a clean landing page and most can't build one. Fast turnaround means quick cash. Easy to upsell hosting and revisions.",
    problem_and_demand:
      "Buyers want a launch-ready page in 5 days, not a 6-week WordPress project. Demand is consistent on Upwork, X and LinkedIn. Steady income from £400–£1,500 per build.",
    target_audience:
      "Best buyers: course creators, coaches, indie SaaS founders pre-launch, local service businesses needing a relaunch, newsletter writers building a 'home base'.",
    clear_offer:
      "'Launch-Ready Landing Page in 5 Days': 1 high-converting page in Framer or Webflow, copy + design + mobile + analytics + 1 round of revisions. Fixed price £695.",
    tools_needed:
      "Framer or Webflow (build), Figma (mood boards), Notion (briefs), Loom (demo videos), Stripe (payments), Plausible or GA4 (analytics handover), Unsplash + Pexels (imagery).",
    ai_nocode_stack:
      "ChatGPT or Claude for first-draft copy and headlines. Midjourney or Ideogram for hero imagery. Relume AI for fast wireframes. Cursor for any custom code snippets.",
    launch_plan:
      "Week 1: Build 2 portfolio pages for fictional brands. Week 2: Post both on X with a 'how I made this' breakdown. Week 3: DM 30 indie founders. Week 4: Close 1 paid build at £495 launch price.",
    pricing_strategy:
      "Starter: £495 (1 page, 1 revision). Standard: £695 (1 page, 2 revisions, copy). Premium: £1,200 (3 pages, copy, basic SEO). Add £49/month maintenance retainer.",
    distribution_channels:
      "1) X/Twitter posts of design breakdowns. 2) Dribbble and Read.cv. 3) IndieHackers + Reddit (r/SaaS, r/EntrepreneurRideAlong). 4) Subcontract via 2 web agencies who don't do Framer.",
    outreach_scripts:
      "DM: 'Saw you're launching {product}. I noticed your landing page could use a sharper hero + clearer CTA , I built a quick mock for you, want me to send it? Takes 60 secs to look at.'",
    proof_needed:
      "3–5 portfolio pages on Framer. 1 case study with real metrics ('CTR went from 1.8% to 4.2%'). A 60-sec Loom walkthrough of one project. That's enough to close £700+ deals.",
    honest_risks:
      "Scope creep is the #1 killer. Lock deliverables and revision rounds in writing. Clients with no copy will slow you down , charge extra or refuse the project.",
    seven_day_plan:
      "Day 1: Pick stack (Framer recommended). Day 2: Build portfolio page #1. Day 3: Build portfolio page #2. Day 4: Set up Carrd offer page. Day 5: Post 2 design breakdowns. Day 6: DM 25 founders. Day 7: Run calls, close 1 build.",
    how_to_scale:
      "Productise 3 fixed templates ('Coach', 'SaaS', 'Newsletter'). At £4k/month: hire a designer and become the strategist. Long term: niche to one industry (e.g. 'Landing pages for course creators') for compounding referrals.",
  },

  "AI-Written Email Newsletter": {
    diagnosis:
      "Long-term play. Slower start than services, but the highest leverage business once you have 1k+ subscribers. Sponsorships at 5k subs realistically pay £200–£800 per send. Compounds beautifully.",
    problem_and_demand:
      "People are drowning in noise and want a curated, focused newsletter in their inbox. AI dramatically shortens research and drafting time. Niches with high CPMs: B2B SaaS, finance, AI, marketing, health.",
    target_audience:
      "Pick a clear avatar: e.g. 'mid-level marketers wanting to use AI to do their job better'. The narrower, the better. Avoid broad niches like 'productivity' or 'startups'.",
    clear_offer:
      "1 newsletter, 1 niche, 1 angle. Sent every Tuesday at 7am. Each issue: 1 big idea + 3 tactical links + 1 tool of the week. Always under 4 minutes to read. That consistency IS the offer.",
    tools_needed:
      "Beehiiv or ConvertKit (sending + monetisation), Notion (editorial calendar), Feedly (curation), Typefully (social repurposing), Gumroad (any paid tier), Plausible (link tracking).",
    ai_nocode_stack:
      "ChatGPT or Claude for first drafts + summarising research. Perplexity for current news. Midjourney for header images. Make.com to auto-cross-post issue snippets to LinkedIn + X.",
    launch_plan:
      "Week 1: Pick niche + name + design simple template. Week 2: Write 4 issues in advance. Week 3: Launch publicly + share first issue widely. Week 4: Publish weekly + start growth experiments.",
    pricing_strategy:
      "Phase 1 (0–1k subs): free. Phase 2 (1k–5k): paid tier at £8/month for archive + extras. Phase 3 (5k+): sponsorships at £300+/send. Phase 4: digital products to your list (much higher per-subscriber revenue).",
    distribution_channels:
      "1) Beehiiv Boosts (cross-promos with similar newsletters). 2) X/LinkedIn threads summarising each issue. 3) Guest posts on bigger newsletters. 4) SparkLoop for paid recommendations once you have budget.",
    outreach_scripts:
      "Cross-promo DM: 'Hey {name}, love {their newsletter}. I write {your newsletter} for {niche} , 800 subs, 45% open. Want to swap a recommendation slot in our next issues? Easy 30-min setup.'",
    proof_needed:
      "A clean landing page with a clear promise + sample issue. 3 strong issues already published before you push for subscribers. Social proof: open rate, sub count, testimonials.",
    honest_risks:
      "Slow growth , most quit before 6 months. Open rates are dropping industry-wide. You must publish weekly without fail. Treat first 200 subs as a 12-week project, not a 12-day one.",
    seven_day_plan:
      "Day 1: Pick niche + name. Day 2: Set up Beehiiv + landing page. Day 3–5: Write 4 issues. Day 6: Soft launch to friends + 1st issue out. Day 7: Post 3 social threads + start cross-promo outreach.",
    how_to_scale:
      "At 5k subs: monetise with sponsorships. At 10k: launch a digital product. At 25k: hire a part-time writer + sponsor manager. Long term: spin off niche-adjacent newsletters under one media brand.",
  },

  "Digital Product Audit & Funnel Fix": {
    diagnosis:
      "High-leverage consulting service. Course creators and SaaS founders are losing money on broken funnels every day. A 90-minute audit + written report can sell for £300–£700 with almost no delivery cost.",
    problem_and_demand:
      "Lots of solo founders have a product, traffic, and zero idea why nothing converts. They will pay for an outside expert to point at the leak. Demand is steady on X and LinkedIn.",
    target_audience:
      "Best buyers: course creators with £2k–£20k/month revenue, indie SaaS founders post-MVP, coaches with broken sales pages. Avoid pre-revenue founders , they don't have data to audit.",
    clear_offer:
      "'Funnel Fix Audit': they share landing page + checkout + email flow + 30 days of analytics. You return a 15-page Notion doc + 30-min Loom walkthrough with prioritised fixes. £495, delivered in 5 days.",
    tools_needed:
      "Loom (walkthrough), Notion (deliverable), Hotjar or Microsoft Clarity (heatmap reviews), Stripe (payment), Cal.com (booking), Google Sheets (metrics templates).",
    ai_nocode_stack:
      "ChatGPT to stress-test sales copy and generate alternative headlines. Claude for long-form audit drafting. Use a custom GPT trained on your audit framework for consistency.",
    launch_plan:
      "Week 1: Build 1 fake-brand audit as your portfolio piece. Week 2: Publish it as a public teardown post. Week 3: DM 30 small course creators offering free 15-min mini-audits. Week 4: Convert 3 to paid full audits.",
    pricing_strategy:
      "Mini-audit: £195 (60 mins, Loom only). Full audit: £495 (5-day delivery). Implementation retainer: £1,200/month for ongoing fixes. Anchor with implementation to make audits look cheap.",
    distribution_channels:
      "1) Public teardown threads on X (massive distribution). 2) LinkedIn posts breaking down funnel mistakes. 3) Newsletter sponsorships in creator-economy newsletters. 4) Podcast guesting on indie-founder shows.",
    outreach_scripts:
      "Teardown tweet: 'I audited 10 course landing pages this week. Here are the 5 mistakes 90% are making. (Bookmark this.)' Then DM offer: 'Want me to do this for your funnel? Free 15-min teardown , first 3 only.'",
    proof_needed:
      "1 public teardown thread that did well. 1 full anonymised audit PDF as a downloadable sample. 3 testimonials with measurable results ('+22% checkout conversion in 2 weeks').",
    honest_risks:
      "Clients expect miracles from one audit , set realistic expectations. Without retainer revenue, this can be feast-or-famine. Stack 2–3 audits per month + 1 retainer client for stability.",
    seven_day_plan:
      "Day 1: Pick niche. Day 2: Build audit framework template in Notion. Day 3: Run 1 public teardown. Day 4: Post it + DM 25 owners. Day 5: Free mini-audits. Day 6: Convert to paid. Day 7: Deliver, ask for testimonial.",
    how_to_scale:
      "Productise into a £79 audit checklist + £299 group teardown. At £5k/month: niche to one funnel type (e.g. 'webinar funnels for coaches'). Long term: build a small team of auditors and become the brand.",
  },

  "Niche Booking Tool (Micro-SaaS)": {
    diagnosis:
      "Highest-leverage path on this list, but slowest. A focused booking tool for ONE niche (e.g. 'dog groomers') can clear £3k–£10k MRR within 12–18 months. Requires patience and one technical co-founder OR strong no-code skills.",
    problem_and_demand:
      "Generic tools like Calendly don't fit niche workflows. Industries like tattoo artists, mobile detailers, music teachers, dog groomers cobble together 3 tools. They pay £20–£60/month happily for a tailored solution.",
    target_audience:
      "Pick ONE micro-niche where: (a) workflows are specific, (b) owners are in Facebook groups you can reach, (c) average revenue per business is high enough to pay £30+/month. Examples: tattoo studios, mobile car detailers, music teachers.",
    clear_offer:
      "'Booking + payments + reminders for {niche}, in one place'. Specific features that match how the niche actually works (e.g. deposits, no-show fees, photo uploads for tattoos). Not generic.",
    tools_needed:
      "Bubble or Lovable + Supabase (build), Stripe (payments), Twilio (SMS), Resend (email), Cal.com API (calendar), Loops (lifecycle emails), PostHog (product analytics).",
    ai_nocode_stack:
      "Lovable / Cursor / v0 to ship the MVP fast. ChatGPT to generate SMS/email copy and onboarding flows. Use Claude to draft your support docs. Make.com for any third-party integrations you can't code.",
    launch_plan:
      "Month 1: Interview 15 owners in your niche. Month 2: Build smallest possible MVP. Month 3: Onboard 5 free beta users + collect feedback. Month 4: Launch paid at £29/month.",
    pricing_strategy:
      "Single tier to start: £29/month flat. Annual: £290 (2 months free). Add a £79/month tier with multi-staff once you have 30+ users. Avoid free plans early , they bring noise.",
    distribution_channels:
      "1) Niche Facebook groups (founder-led, give value first). 2) Niche Reddit subs. 3) Cold DMs on Instagram (where most of these owners actually live). 4) Affiliate program with niche influencers.",
    outreach_scripts:
      "DM: 'Hey {name}, I'm building a booking tool just for {niche}. Saw you're juggling Calendly + Square + WhatsApp , same as everyone in your space. Mind if I show you a 5-min demo? Would love your honest opinion.'",
    proof_needed:
      "Working MVP that handles 1 full booking end-to-end. 3 case studies from beta users showing time saved or money recovered (no-show fees). A Loom demo on the homepage.",
    honest_risks:
      "Long path to revenue. Churn is brutal in early SaaS. You will be on calls answering 'how do I log in' for 6 months. Only do this if you genuinely care about the niche.",
    seven_day_plan:
      "Day 1–2: Interview 5 owners in your chosen niche. Day 3: Map MVP scope on paper. Day 4–6: Build click-through prototype. Day 7: Show prototype to 5 owners + collect commitments to beta test.",
    how_to_scale:
      "Onboard a niche-aligned co-founder for sales. At £3k MRR: invest in SEO + lifecycle emails. At £8k MRR: hire 1 part-time support person. Long term: dominate one niche fully before considering a second vertical.",
  },

  "Lead List Service": {
    diagnosis:
      "One of the fastest cash-flow businesses for beginners. No design or code skills needed. Sales teams and agencies will pay weekly for clean, targeted lead lists. Realistic to hit £1k–£3k/month within 60 days.",
    problem_and_demand:
      "Agencies, B2B SaaS sales teams and freelancers all need fresh lists every week. Doing it themselves takes 6+ hours. Demand on Upwork, Twitter and LinkedIn is constant.",
    target_audience:
      "Best buyers: 1–10 person B2B sales teams, marketing agencies doing cold email, recruiters, fractional sales reps. Avoid huge enterprises , sales cycle too long for a solo founder.",
    clear_offer:
      "'500 verified, niche-targeted leads delivered every week'. Each lead includes: name, role, company, verified email, LinkedIn URL, 1 personalisation hook. Delivered Friday. £349/week or £1,200/month.",
    tools_needed:
      "Apollo.io or Instantly (lead pulling), Hunter.io or NeverBounce (email verification), Clay.com (enrichment + personalisation), Google Sheets (delivery), Notion (client tracker).",
    ai_nocode_stack:
      "Clay's AI to scrape personalisation hooks from LinkedIn + websites. ChatGPT to generate 1-line openers per lead. Make.com to automate weekly delivery to client folders. Loom for handover videos.",
    launch_plan:
      "Week 1: Pick 1 niche of buyer (e.g. SaaS sales teams). Week 2: Build a sample list of 100 leads + share publicly. Week 3: DM 30 prospects with the sample. Week 4: Close 2 weekly retainers.",
    pricing_strategy:
      "One-off: £349 for 500 leads. Weekly retainer: £299/week. Monthly: £1,200/month for 2,000 leads. Personalised openers: +£0.50/lead. Always price per lead delivered, never per hour.",
    distribution_channels:
      "1) Cold LinkedIn DMs to sales/agency founders. 2) Twitter posts showing your enrichment workflows. 3) Reddit (r/sales, r/coldemail). 4) Partnerships with cold email agencies who don't do sourcing.",
    outreach_scripts:
      "DM: 'Hey {name}, saw you're scaling outbound at {company}. I deliver 500 verified, hyper-targeted leads every Friday for teams like yours , done in Clay, includes 1 personalisation hook per lead. Want a free sample of 25 leads in your niche? Takes me 30 mins.'",
    proof_needed:
      "1 sample list of 100 leads in a real niche. 1 short Loom showing your Clay/Apollo workflow. 2 testimonials with response-rate numbers. A simple Notion landing page is enough.",
    honest_risks:
      "Apollo, Clay and email verifier costs add up , track margin per client. List quality varies by niche. Email deliverability laws (GDPR, CAN-SPAM) matter , always recommend opt-in compliance to clients.",
    seven_day_plan:
      "Day 1: Set up Apollo + Clay accounts. Day 2: Pick buyer niche. Day 3: Build sample list. Day 4: Build Notion offer page. Day 5: Send 25 cold DMs. Day 6: Follow up + run calls. Day 7: Close 1 retainer.",
    how_to_scale:
      "Productise into 3 fixed packages by list size. At £4k/month: hire a VA to run Apollo while you handle Clay enrichment + clients. Long term: pair with a cold-email agency partner for full-funnel offers.",
  },
};

const GENERIC_REPORT = {
  diagnosis:
    "Solid starting point. The strongest solo businesses solve a specific, painful problem for a specific group of people willing to pay. Sharpen your idea by naming exactly who it's for and what changes for them after they buy.",
  problem_and_demand:
    "Validate demand before you build anything: search Reddit, niche Facebook groups, and Twitter for people complaining about the problem. If you can find 10 real complaints in a week, the demand is real. If not, narrow your niche.",
  target_audience:
    "Pick ONE specific buyer persona. Define their job title, income range, where they hang out online, and what they currently use. 'Everyone' is not a target. Smaller niche = faster traction.",
  clear_offer:
    "Package your service or product as a clear outcome with a fixed scope and price. Bad: 'consulting'. Good: '5-day landing page for £695, with copy, design and 1 revision'. Specificity wins.",
  tools_needed:
    "Start lean: Notion (operations), Stripe or Wise (payments), Calendly or Cal.com (booking), Loom (sales + delivery), Carrd or Framer (landing page), Gmail (comms). Don't over-tool before you have customers.",
  ai_nocode_stack:
    "ChatGPT or Claude for copy + research. Make.com or Zapier for automations. Lovable / Cursor / v0 if any product needs building. Use AI to compress 10-hour tasks into 1 , then sell that time-saving to clients.",
  launch_plan:
    "Week 1: Define your offer + 1 buyer persona. Week 2: Build 1 portfolio sample or MVP. Week 3: Reach out to 30 ideal buyers. Week 4: Close 1 paying customer at a discount, raise the price, and ask for a testimonial.",
  pricing_strategy:
    "Offer 3 tiers , most buyers pick the middle one. Price on outcomes, not hours. Always quote a project fee, not 'I charge £X/hr'. Raise prices every 3 customers.",
  distribution_channels:
    "Pick 2 channels max where your buyers actually are. For B2B: LinkedIn + cold email. For consumer products: Pinterest, TikTok, Instagram. For technical products: X/Twitter + niche Reddit. Go deep on 2, not shallow on 6.",
  outreach_scripts:
    "DM: 'Hey {name}, I help {audience} solve {pain} by {clear method}. Built a quick {sample/audit/demo} for you , happy to send it over with no catch. Worth a 60-second look?'",
  proof_needed:
    "1 portfolio sample or case study (build it for free if needed). 1 short Loom walkthrough. A 1-page landing page on Carrd or Framer with a clear offer, 3 benefits and 1 CTA. That is enough to start charging.",
  honest_risks:
    "The #1 risk is quitting before traction. Most solo businesses take 60–90 days of consistent effort to get the first paying customer. Set a clear weekly action target and stick to it for at least 12 weeks.",
  seven_day_plan:
    "Day 1: Define offer + persona. Day 2: Build landing page. Day 3: Build portfolio sample. Day 4: List 30 ideal prospects. Day 5: Send 20 outreach messages. Day 6: Follow up + book calls. Day 7: Run calls, close 1 paying customer.",
  how_to_scale:
    "Once you hit £2k/month: systemise delivery in Notion, raise prices by 25%, and hire a VA for repetitive tasks. At £5k/month: niche down further and double on the channel that works. At £10k/month: hire your first delivery teammate.",
};

export function getMockReport(ideaName) {
  if (ideaName && Object.prototype.hasOwnProperty.call(REPORTS, ideaName)) {
    return REPORTS[ideaName];
  }
  return GENERIC_REPORT;
}

export const REPORT_KEYS = KEYS;
