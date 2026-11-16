# Stones of Italy — Next.js (AI & Automation Modules)

Production-oriented import of the Stones of Italy, Inc. static frontend into a **Next.js 14 (App Router) + React + Tailwind + Supabase + GoHighLevel webhooks** stack, with 5 AI/automation modules wired.

## Project structure

- `app/page.tsx` — landing page integrating all modules (branding/content from Stones of Italy Vero Beach)
- `app/api/visualize-countertop/route.ts` — Module 1 API
- `components/CountertopVisualizer.tsx` — Module 1 UI (upload/sample, Top 10 stones, before/after drag slider, "Get Quote for This Stone")
- `components/InstantQuoteCalculator.tsx` — Module 2 calculator + gated itemized quote submission
- `components/AiSalesConcierge.tsx` + `app/api/chat/route.ts` — Module 3 AI sales/support chat
- `components/BookingForm.tsx` + `app/api/lead-webhook/route.ts` — Module 4 speed-to-lead trigger (GHL + AI voice) and lead capture
- `lib/stones.ts`, `lib/quote.ts` — Top 10 stones, pricing logic
- `lib/ghl.ts` — GHL contact upsert, tagging, webhook trigger, nurture workflow schedule (Module 5)
- `lib/voice.ts` — Outbound AI voice call trigger (Vapi / Synthflow / Bland) (Module 4)
- `lib/supabase.ts` — optional Supabase persistence
- `.env.example` — required environment variables

## Modules

### 1) AI Countertop Visualizer (`/api/visualize-countertop`)
- Upload a kitchen/bath photo or pick a sample room; select from **Top 10 Stones** (Taj Mahal Quartzite, Calacatta Gold Marble, Calacatta Laza Quartz, Carrara Gioia Marble, Bianco Romano Granite, Sea Pearl Quartzite, Statuario Porcelain, Black Galaxy Granite, Super White Dolomite, Azul Macaubas Quartzite).
- Calls an image-to-image/inpainting provider (**Gemini** or **Replicate ControlNet/FLUX fill**, configurable via `VISUALIZER_PROVIDER`) with a prompt to mask/replace horizontal countertop surfaces and backsplashes, rendering exact veining, sheen (polished/honed), and color while preserving cabinets, lighting, and appliances.
- UI: interactive **Before/After drag slider** + **Get Quote for This Stone** CTA.
- Graceful fallback with explanatory note when provider keys are not configured.

### 2) Instant Quote Maker with precision installed estimate range (`components/InstantQuoteCalculator.tsx`)
- Inputs: Project Scope (Kitchen, Kitchen + Island, Bathroom Vanity, Outdoor Kitchen, Fireplace Wrap), dimensions slider + presets (Small 30, Medium 50, Large 75, Estate 100+ sq ft), stone selection mapped to realistic Vero Beach installed rates ($55–$135/sq ft), edge profile (Eased/Beveled standard, Bullnose/Ogee +$12/ln ft, Mitered Waterfall +$450/side), cutouts (Undermount Sink $250, Cooktop $200), Tear-out/Disposal ($350 optional).
- Calculation: computes baseline `C` and displays a tight range **`[round((C - 750)/100)*100]` to `[round((C + 750)/100)*100]`** (tight installed estimate range) with itemized inclusions (laser templating, fabrication, installation, sealing).
- **Gated full itemized PDF/SMS quote** behind Name + Phone + Email submission; all quote parameters passed to `/api/lead-webhook`.

### 3) AI Sales & Support Chat (`components/AiSalesConcierge.tsx` + `/api/chat`)
- Trained/prompted on Stones of Italy business data: 4646 US-1, Vero Beach, FL 32967, (772) 299-7560, Mon–Fri 8am–5pm, Sat 8am–2pm.
- Knowledge: stone care/durability (quartz vs. quartzite vs. marble, Florida/outdoor guidance), pricing tiers, service areas.
- Goal-oriented: answers material questions, recommends slabs by lifestyle (e.g. Taj Mahal Quartzite over marble for heavy cooks; porcelain/quartzite for Florida outdoor kitchens), captures phone/email, and pushes to book a free in-home measurement or showroom slab walk. Uses `OPENAI_API_KEY` when set, with a rule-based fallback.

### 4) Instant Outbound AI Voice Caller + In-Person Estimate Booking (`/api/lead-webhook`)
- On form submission (Instant Quote tool or Booking Form), immediately fires webhook/upsert to **GoHighLevel (GHL)** and triggers **Vapi / Synthflow / Bland AI** outbound call.
- **15–30 second** delayed outbound call: greets lead by name from Stones of Italy in Vero Beach, references exact stone and quote range, qualifies project (timeline, cabinets installed, tear-out needed, decision-maker status), books in-person estimate/templating appointment on calendar, and triggers instant SMS calendar confirmation (via voice provider/GHL workflow).
- Configure `VOICE_PROVIDER` and corresponding API keys/assistant IDs in `.env`.

### 5) Automated 7-Day Drip + Long-Term Nurture + 2-Way SMS (`lib/ghl.ts`, triggered in `/api/lead-webhook`)
- On lead capture, tags: `soi-web-lead`, `stone-selected`/`stone-{id}`, `quote-range`.
- Triggers GHL webhook/workflow with declarative nurture schedule:
  - **Minute 0:** Instant SMS + Email with custom quote summary & stone care guide.
  - **Day 1:** SMS check-in + link to book showroom slab viewing at 4646 US-1.
  - **Day 2:** Email showcasing recent Vero Beach kitchen transformations & 5-star reviews.
  - **Day 3:** SMS "Quick question — are your cabinets already in place, or are you still in the planning stage?"
  - **Day 4:** Email comparing Quartzite vs. Quartz vs. Marble durability.
  - **Day 5:** SMS offering complimentary sink upgrade or free sealer package when booked this week.
  - **Day 6:** Email walkthrough of Stones of Italy's 5-day template-to-install process.
  - **Day 7:** Final VIP priority scheduling SMS before moving to long-term nurture.
  - **Day 8+:** Bi-weekly automated SMS & email broadcasts featuring new Italian/Brazilian slab arrivals at the Vero Beach yard.
- Mirror this sequence in your **GoHighLevel workflow builder** (or set `GHL_NURTURE_WORKFLOW_ID` / inbound webhook workflow) for production execution and 2-way SMS handling.

## Setup

```bash
npm install
cp .env.example .env.local
# fill in Supabase, GHL, voice provider, and AI keys
npm run dev
```

Open http://localhost:3000

## Notes
- **Attached images:** the chat included image attachments (e.g. kitchen/stone renders) that could not be read in this environment due to model input limitations; the app uses the live site/CDN image URLs from https://blessed.clicksitepages.com/stones-of-italy-vero-beach-trmpe0koq3 where applicable.
- **PDF/SMS quote delivery & calendar booking:** itemized quote payload is passed to GHL/webhook; generate/send the PDF and SMS, and perform calendar booking/SMS confirmation, via your configured GHL workflows/templates or downstream services.
- **Voice call scheduling:** `/api/lead-webhook` schedules the outbound call after a 15–30s delay (fire-and-forget). In serverless deployments, move the delay/dispatch to a durable queue/cron (e.g. Vercel Cron, GHL workflow delay, or job queue) to guarantee execution.
- **Supabase:** optional lead persistence; create a `leads` table matching `lib/supabase.ts` insert if desired.
