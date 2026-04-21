# PROJECT_SNAPSHOT.md
_Generated 2026-04-19 — for architectural review. No secrets or env values included._

---

## 1. Project Overview

Symponia Marketing is a Next.js 15 web application that functions as an AI-powered marketing content pipeline. It combines multiple specialised AI agents (Claude, Kie.ai, Exa.ai, Blotato) to automate the full campaign lifecycle: trend research → content strategy → platform-native copy → image/video generation → social scheduling. The app has two distinct surfaces: (1) a public-facing landing page and pricing page for the Symponia consumer app (a separate spiritual-wellness product), and (2) a private Clerk-authenticated dashboard where the marketing team creates campaigns, runs agents, reviews content, and manages generated assets. The project is in an active build stage — core pipeline routes and agent library are wired up, the dashboard scaffold exists, but several pages (analytics, calendar) are likely still placeholder views.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| UI styling | Tailwind CSS 4, Framer Motion 11, Lucide React |
| Auth | Clerk (`@clerk/nextjs` ^6) |
| Database | Airtable (campaign/content data) + Supabase (`@supabase/supabase-js` ^2, SSR) |
| AI — LLM | Anthropic Claude (`@anthropic-ai/sdk` ^0.39) |
| AI — Images/Video | Kie.ai (40+ model library), fal.ai |
| AI — Research | Exa.ai |
| Social Scheduling | Blotato |
| Payments | Stripe (`stripe` ^17) |
| Workflow automation | n8n (webhook-triggered) |
| Hosting target | Vercel / Netlify (env var notes in upload handler) |

---

## 3. Folder Structure

```
/
├── app/                         # Next.js App Router — all pages and API routes
│   ├── api/
│   │   ├── agents/              # AI agent endpoints (research, strategy, content, images, videos, schedule)
│   │   ├── brand-profile/       # GET/POST user brand profile
│   │   ├── campaigns/           # CRUD campaigns + nested content/calendar/approve routes
│   │   ├── checkout/            # Stripe checkout session
│   │   ├── dashboard/           # Token-gated routes: login, records, generate, research, upload
│   │   ├── upload/              # Supabase storage upload
│   │   └── webhooks/            # Clerk user sync, Kie.ai completion callback
│   ├── dashboard/               # Clerk-protected marketing dashboard pages
│   │   ├── [id]/                # Campaign detail — strategy, content, research, assets sub-pages
│   │   ├── analytics/           # Analytics view (likely placeholder)
│   │   ├── assets/              # Shared assets library
│   │   ├── calendar/            # Content calendar view
│   │   ├── campaigns/           # Campaign list + new-campaign form
│   │   ├── content/             # Global content pieces view
│   │   └── settings/            # User / brand profile settings
│   ├── credits/                 # Pricing & Stripe token purchase
│   ├── onboarding/              # Post-signup onboarding flow
│   ├── sign-in/ sign-up/        # Clerk auth pages
│   ├── privacy/ terms/ eula/    # Legal pages
│   ├── layout.tsx               # Root layout (Clerk provider)
│   └── page.tsx                 # Public landing page (~700 lines, client component)
├── agents/
│   └── manager-agent.ts         # Orchestrator: routes briefs, scores output, saves to Airtable
├── lib/
│   ├── agents/                  # Individual agent modules (content, director, image, research, scheduler, seo, strategy, video)
│   ├── airtable.ts              # Airtable client + schema helpers
│   ├── blotato.ts               # Blotato social scheduling wrapper
│   ├── exa.ts                   # Exa.ai research wrapper
│   ├── fal.ts                   # fal.ai image/video generation
│   ├── kei.ts                   # Kie.ai 40+ model library
│   ├── kling.ts                 # Kling AI video generation
│   ├── platform-specs.ts        # Per-platform dimension/format rules (14+ platforms)
│   ├── pricing.ts               # Regional pricing (20+ countries)
│   └── supabase.ts              # Supabase browser + server clients
├── components/
│   ├── PageShell.tsx            # Layout wrapper component
│   ├── dashboard/Sidebar.tsx    # Dashboard navigation sidebar
│   └── ui/gradient-dots.tsx     # Animated gradient background
├── public/uploads/              # Local generated image storage (dev only)
├── middleware.ts                # Clerk auth guard: protects /dashboard/* and /onboarding/*
├── next.config.ts               # Minimal Next.js config
└── package.json
```

---

## 4. External Integrations

### Anthropic / Claude
- **Files:** `lib/agents/content-agent.ts`, `lib/agents/research-agent.ts`, `lib/agents/strategy-agent.ts`, `agents/manager-agent.ts`, `app/api/dashboard/research/route.ts`
- **Does:** LLM backbone for all agents — research synthesis, strategy generation, platform-native copy (with streaming), dashboard research endpoint, manager orchestration with scoring rubric
- **Env vars:** `ANTHROPIC_API_KEY`

### Kie.ai
- **Files:** `lib/kei.ts`, `lib/agents/image-agent.ts`, `lib/agents/video-agent.ts`, `app/api/webhooks/kie/route.ts`, `app/api/agents/images/route.ts`, `app/api/agents/videos/route.ts`
- **Does:** Image and video generation across 40+ models (Flux Kontext, GPT-Image-1, Seedance 2, Runway Gen-4, Kling 3, Veo 3.1, Suno, ElevenLabs TTS). Jobs are queued async; completion delivered via webhook to `/api/webhooks/kie`
- **Env vars:** `KIE_API_KEY`, `KIE_BASE_URL`

### fal.ai
- **Files:** `lib/fal.ts`
- **Does:** Secondary image/video generation provider — Flux Pro 1.1 Ultra (images with reference), Kling v2 Master (video)
- **Env vars:** `FAL_KEY` (inferred from fal.ai SDK)

### Exa.ai
- **Files:** `lib/exa.ts`, `lib/agents/research-agent.ts`
- **Does:** Neural + keyword web search for trend research — Reddit discussions, SEO keywords, competitor content, with published-date filtering and content highlights
- **Env vars:** `EXA_API_KEY`

### Blotato
- **Files:** `lib/blotato.ts`, `lib/agents/scheduler-agent.ts`, `app/api/agents/schedule/route.ts`
- **Does:** Multi-platform social scheduling (Instagram, TikTok, LinkedIn, Twitter/X, Facebook, YouTube, Pinterest). Supports first-comment, batch scheduling with rate limiting, and status tracking
- **Env vars:** `BLOTATO_API_KEY`, `BLOTATO_BASE_URL`

### Airtable
- **Files:** `lib/airtable.ts`, `agents/manager-agent.ts`, most agent files
- **Does:** Primary data store for campaigns, brand profiles, research reports, content ideas, content pieces, content calendar, and generation jobs
- **Env vars:** `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE`

### Supabase
- **Files:** `lib/supabase.ts`, `app/api/upload/route.ts`, `app/api/webhooks/clerk/route.ts`, `app/api/agents/images/route.ts`, `app/api/agents/videos/route.ts`
- **Does:** User sync from Clerk, generation job queue with Realtime updates to UI, file storage (three buckets: reference-images, generated-images, generated-videos)
- **Env vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### Clerk
- **Files:** `middleware.ts`, `app/api/webhooks/clerk/route.ts`, `app/sign-in/`, `app/sign-up/`, all dashboard API routes
- **Does:** User authentication and session management; `user.created` webhook syncs new users to Supabase
- **Env vars:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`

### Stripe
- **Files:** `app/api/checkout/route.ts`, `app/credits/page.tsx`
- **Does:** Creates checkout sessions for token/credit purchases; pricing is regionally localised (20+ countries)
- **Env vars:** `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### n8n
- **Files:** `app/api/dashboard/generate/route.ts`
- **Does:** Non-blocking webhook trigger for the full marketing team agent pipeline (manager → platform agents → Kie.ai → Airtable). Also has a schedule webhook variant
- **Env vars:** `N8N_WEBHOOK_URL`, `N8N_SCHEDULE_URL`

---

## 5. Existing Agents / Prompts

### Manager Agent (`agents/manager-agent.ts`)
Orchestrates an 8-agent team. Scores output 1–10; threshold 7.5 for approval (max 1 revision cycle).

```
You are the Marketing Director of Symponia — a senior strategist with 15 years
of brand, content, and digital marketing experience.

You lead an 8-agent team:
- Orchestrator (you): Campaign strategy, routing, quality control
- Instagram Agent: Visual storytelling, carousel arcs, Reels hooks
- TikTok Agent: 3-sec hook formulas, viral formats, sound strategy
- LinkedIn Agent: Thought leadership, 210-char hook formula
- Video Editor Agent: Scene breakdown, FFmpeg pipeline
- Copywriter Agent: Multi-platform copy, power words, A/B variants
- Trend Researcher Agent: Reddit/YouTube/Google Trends scraping
- Visual Director Agent: Brand consistency, Kie.ai prompts

SCORING RUBRIC (1–10):
- Hook strength     (3 pts)
- Brand alignment   (2 pts)
- Platform fit      (2 pts)
- CTA clarity       (1 pt)
- Visual coherence  (1 pt)
- Trend relevance   (1 pt)

APPROVAL THRESHOLD: 7.5 minimum. Max 1 revision cycle.
```

**Workflow:** (1) compile trend brief → (2) generate mission briefs per platform → (3) brief platform agents → (4) score output → (5) request revisions if below 7.5 → (6) save approved content to Airtable + trigger Kie.ai visual generation.

---

### Research Agent (`lib/agents/research-agent.ts`)
Uses Exa.ai searches + Claude synthesis to produce structured research output.

**Output schema:**
```typescript
{
  trendingTopics:      [{ topic, why, contentAngle, viralPotential, source }],
  redditInsights:      [{ painPoint, audienceQuote, contentOpportunity }],
  seoKeywords:         [{ keyword, searchIntent, difficulty, opportunity }],
  competitorAnalysis:  [{ competitor, strength, gap, opportunity }],
  summary:             string
}
```

---

### Strategy Agent (`lib/agents/strategy-agent.ts`)
Generates exactly 5 content ideas per campaign from research output.

**Output schema:**
```typescript
[{
  title, angle, hook, bestPlatform, contentFormat,
  engagementPotential: 'High' | 'Medium' | 'Low',
  engagementReason, trendingScore, trendingReason
}]
```

---

### Content Agent (`lib/agents/content-agent.ts`)
Generates platform-native copy for all selected platforms. Supports real-time streaming (SSE). Saves all pieces to Airtable.

Platform templates include: Instagram (caption + stories + alt text), Twitter/X (thread), LinkedIn (thought-leadership post), TikTok (script with hooks), Facebook, YouTube (description), Pinterest.

---

### Dashboard Research Prompt (`app/api/dashboard/research/route.ts`)
Bypasses Exa.ai (timeout avoidance). Pure Claude structured JSON response.

```
Analyze this topic and return actionable marketing intelligence.

Return ONLY valid JSON:
{
  "trendingAngle":        "single sharpest content angle",
  "timingWindow":         "best days/times to post",
  "hashtags":             "#tag1 #tag2 ... (10 tags)",
  "summary":              "2-3 sentence analysis",
  "bestFormat":           "Short-form video 60–90s",
  "trendStatus":          "rising|peaked|saturated|evergreen",
  "hookPatterns":         ["hook template 1", "hook template 2"],
  "emotionalTrigger":     "primary emotional driver",
  "contentGap":           "what is missing",
  "competitorBlindSpot":  "what most creators avoid",
  "viralMechanism":       "why content goes viral",
  "topAngles":            ["angle 1", "angle 2", ...],
  "algoTopSignals":       "algo rewards",
  "algoFormatWinner":     "format algorithm boosts",
  "algoHashtagRule":      "hashtag strategy",
  "algoHookTiming":       "hook duration",
  "algoPeakTimes":        "exact peak times",
  "algoAvoid":            "what kills reach",
  "algoSeoNote":          "SEO optimization"
}
```

---

### Director Agent (`lib/agents/director-agent.ts`)
Generates visual direction briefs and Kie.ai prompts for brand-consistent image/video creation.

### SEO Agent (`lib/agents/seo-agent.ts`)
Optimises content for search — details not fully examined.

### Video Agent (`lib/agents/video-agent.ts`)
Queues Kie.ai video generation jobs (Seedance 2 as primary — 1080p, 15s, native audio). Callback-preferred but polling also implemented.

### Image Agent (`lib/agents/image-agent.ts`)
Queues Kie.ai image generation jobs; handles reference-image-conditioned generation.

### Scheduler Agent (`lib/agents/scheduler-agent.ts`)
Posts approved content to Blotato with per-platform scheduling rules.

---

## 6. Database / Data Model

### Airtable (primary content data)

| Table | Purpose |
|---|---|
| Campaigns | One record per campaign — name, brand, platforms, goal, tone, competitors, posting frequency, status |
| Brand Profiles | Per-user brand voice, audience, competitors, visual style, reference image URLs |
| Research Reports | Exa + Claude output per campaign — trending topics, Reddit insights, SEO keywords, competitor analysis |
| Content Ideas | 5 strategy ideas per campaign — angle, hook, platform fit, engagement potential, trending score |
| Content Pieces | Platform-specific copy — body, hashtags, visual direction JSON, approval status |
| Content Calendar | Scheduled entries — contentPieceId, scheduledAt, platform, status |
| Generation Jobs | Async image/video job tracking — jobType, status, assetUrl, error, kieTaskId |

### Supabase (users + realtime job state)

| Table | Purpose |
|---|---|
| users | Clerk user sync — clerk_id, email, created_at |
| generation_jobs | Mirrors Airtable jobs with Realtime enabled so the UI updates when Kie.ai webhooks arrive |

**Storage buckets:** `reference-images`, `generated-images`, `generated-videos`

No SQL schema files exist — schema is defined through TypeScript interfaces and Airtable field definitions.

---

## 7. API Routes / Backend Endpoints

### Agent Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/agents/research` | Run research agent (Exa + Claude); returns structured ResearchOutput |
| POST | `/api/agents/strategy` | Generate 5 content ideas from research |
| POST | `/api/agents/content` | Stream platform-native copy (SSE) |
| POST | `/api/agents/images` | Queue background Kie.ai image generation job |
| POST | `/api/agents/videos` | Queue background Kie.ai video generation job |
| POST | `/api/agents/schedule` | Schedule approved content pieces via Blotato |

### Campaign Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/api/campaigns` | List all campaigns for authenticated user |
| POST | `/api/campaigns` | Create new campaign |
| GET | `/api/campaigns/[id]` | Get single campaign (ownership-verified) |
| PATCH | `/api/campaigns/[id]` | Update campaign fields |
| GET | `/api/campaigns/[id]/content` | List all content pieces for campaign |
| POST | `/api/campaigns/[id]/content/[pieceId]/approve` | Approve content piece; sets approvedAt |
| GET | `/api/campaigns/[id]/calendar` | Get scheduled calendar entries |

### Brand Profile

| Method | Route | Description |
|---|---|---|
| GET | `/api/brand-profile` | Get user's brand profile |
| POST | `/api/brand-profile` | Create or update brand profile |

### Checkout & Payments

| Method | Route | Description |
|---|---|---|
| POST | `/api/checkout` | Create Stripe checkout session for credit purchase |

### Dashboard (token-gated, not Clerk)

| Method | Route | Description |
|---|---|---|
| POST | `/api/dashboard/login` | Validate username/password; returns base64 token |
| GET | `/api/dashboard/records` | List Airtable marketing queue (filterable by status/platform) |
| PATCH | `/api/dashboard/records` | Update Airtable record (status, fields) |
| DELETE | `/api/dashboard/records` | Delete Airtable record |
| POST | `/api/dashboard/generate` | Trigger n8n agent pipeline (non-blocking) |
| PUT | `/api/dashboard/generate` | Schedule approved content via n8n schedule webhook |
| POST | `/api/dashboard/research` | Quick research topic via Claude only (no Exa) |
| POST | `/api/dashboard/upload` | Upload image to /public/uploads (8 MB limit) |

### Upload & Webhooks

| Method | Route | Description |
|---|---|---|
| POST | `/api/upload` | Upload file to Supabase storage (10 MB limit) |
| POST | `/api/webhooks/clerk` | Sync new Clerk users to Supabase users table |
| POST | `/api/webhooks/kie` | Receive Kie.ai job completion; update Supabase + Realtime |

---

## 8. Frontend / Dashboard

### Public Pages

| Page | File | Status |
|---|---|---|
| Landing page | `app/page.tsx` | Working — hero, profiles, pain points, how-it-works, 6 conversation modes, FAQ, CTA, footer |
| Pricing / credits | `app/credits/page.tsx` | Working — regional pricing (20+ countries), Stripe checkout |
| Privacy policy | `app/privacy/page.tsx` | Working |
| Terms of service | `app/terms/page.tsx` | Working |
| EULA | `app/eula/page.tsx` | Working |

### Auth Pages

| Page | Status |
|---|---|
| `/sign-in` `/sign-up` | Working — Clerk-managed |
| `/onboarding` | Scaffolded — flow unclear |

### Dashboard Pages (Clerk-protected)

| Page | What it shows | Status |
|---|---|---|
| `/dashboard` | Hub: campaign status overview, recent content, quick actions | Scaffolded |
| `/dashboard/campaigns` | Campaign list, filterable by status; create new button | Scaffolded |
| `/dashboard/campaigns/new` | Create campaign form (name, brand, platforms, goal, tone) | Scaffolded |
| `/dashboard/campaigns/[id]` | Campaign detail hub with sub-routes | Scaffolded |
| `/dashboard/campaigns/[id]/research` | Research report viewer | Scaffolded |
| `/dashboard/campaigns/[id]/strategy` | 5 strategy ideas; select ideas to proceed | Scaffolded |
| `/dashboard/campaigns/[id]/content` | Content pieces editor with approve button | Scaffolded |
| `/dashboard/campaigns/[id]/assets` | Campaign-specific generated assets gallery | Scaffolded |
| `/dashboard/content` | Global content pieces across all campaigns, filtered by status/platform | Scaffolded |
| `/dashboard/calendar` | Content calendar — scheduled posts view | Likely placeholder |
| `/dashboard/assets` | Shared reference + generated assets library | Scaffolded |
| `/dashboard/analytics` | Performance metrics, engagement, reach | Likely placeholder |
| `/dashboard/settings` | Brand profile management, user preferences | Scaffolded |

---

## 9. What Works End-to-End Right Now

- **Public landing page** — fully renderable; hero animations, FAQ, all sections complete.
- **Auth flow** — Clerk sign-up → user synced to Supabase → redirected to onboarding.
- **Dashboard login (token-gated)** — `POST /api/dashboard/login` returns token; used to call records, generate, research, upload endpoints.
- **Dashboard research** — `POST /api/dashboard/research` sends a topic to Claude and returns structured JSON (angles, hashtags, algo signals, hook patterns) in one call.
- **Dashboard records** — `GET/PATCH/DELETE /api/dashboard/records` interact with Airtable queue.
- **n8n pipeline trigger** — `POST /api/dashboard/generate` fires non-blocking webhook to n8n; n8n orchestrates the full multi-agent run.
- **Kie.ai image generation** — image jobs queued in Supabase, Kie.ai completes async, webhook received at `/api/webhooks/kie`, status updated in Supabase with Realtime push to UI.
- **Kie.ai video generation** — same async pattern as images; Seedance 2 as primary (1080p, 15s, audio).
- **Blotato scheduling** — `POST /api/agents/schedule` sends approved pieces to Blotato for multi-platform scheduling.
- **Stripe checkout** — `POST /api/checkout` creates a session; user lands on Stripe-hosted checkout.

---

## 10. Known Gaps / TODOs

1. **Analytics page** (`/dashboard/analytics`) — Almost certainly placeholder data; no real analytics integration wired up.
2. **Calendar view** (`/dashboard/calendar`) — Endpoint (`GET /api/campaigns/[id]/calendar`) exists but the UI calendar component is likely a scaffold without drag-to-reschedule.
3. **SEO agent** (`lib/agents/seo-agent.ts`) — File exists but not fully examined; may be a stub or incomplete.
4. **Director agent** (`lib/agents/director-agent.ts`) — Exists but depth of visual-direction generation unknown.
5. **Onboarding flow** (`/onboarding`) — Page exists; whether it captures brand profile and routes correctly is unclear.
6. **Local upload in production** — `POST /api/dashboard/upload` writes to `/public/uploads` (works in dev, breaks on serverless). The handler has a comment: _"On Netlify/Vercel, wire UPLOAD_BASE_URL env var to your CDN or replace with Vercel Blob / Cloudinary"_.
7. **Dashboard auth security** — Token is base64-encoded `username:password` passed in `x-dashboard-token` header; not JWT-signed. No expiry. Fine for internal use; not suitable for external exposure.
8. **No password → dev mode** — `POST /api/dashboard/login` returns a dummy token when `DASHBOARD_PASSWORD` is unset; could be an accidental security gap in staging.
9. **Streaming UI** — Content agent streams SSE to the client, but whether the frontend has a typewriter component consuming the stream is not confirmed.
10. **fal.ai integration** — `lib/fal.ts` exists alongside `lib/kei.ts`; unclear which provider is active for each job type or if fal.ai is still used after the Kie.ai migration.
11. **Kling wrapper** — `lib/kling.ts` exists as a separate file; may be superseded by Kling models in `lib/kei.ts`.
12. **Credits / token system** — Stripe checkout is wired but there is no visible balance-tracking, deduction logic, or credit ledger in Supabase.
