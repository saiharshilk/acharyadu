# Acharyudu

Find professors. Generate a personalized cold email. Copy it to your own mailbox.

No sign-in, no OAuth, no setup — open the app, pick a topic and school, and browse hand-curated faculty listings with their latest work.

## What it does

1. **Find a professor** — choose a topic + college, click "Find Professors".
2. **Generate a draft** — select any professor and get an personalized cold email draft.
3. **Copy & send yourself** — the draft is copied to your clipboard; paste it into your own email client.

## Features

- **Open to everyone** — no account needed.
- **Professor search** — filter faculty by topic and school.
- **AI-generated drafts** — uses `google/gemini-3.5-flash` to personalize each email from the professor's recent paper and your info.
- **My Info (local)** — optionally fill in your details once; they are saved in your browser and reused for every draft.
- **Sent Log (local)** — history of drafts you've copied, stored only in your browser.
- **Save professor emails** — paste a professor's email once and it is cached for the next visitor.

## Stack

- TanStack Start (Vite, React 19, SSR)
- Tailwind v4 + shadcn/ui
- Supabase Postgres (`professors_cache`)
- Lovable AI Gateway (`google/gemini-3.5-flash`)
- Vanta.js + Three.js

## Local development

```bash
bun install
bun run dev
```

Create a `.env.local` in the project root:

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
LOVABLE_API_KEY=lvbl_xxx
```

- `SUPABASE_*` credentials come from your Supabase project settings → API.
- `LOVABLE_API_KEY` comes from your Lovable Cloud dashboard.
