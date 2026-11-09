# nook.

Your little corner of the internet — a minimalist, hand-drawn personal bookmarking app.
Save links, images, and notes; search them; organize them into collections.

## Stack

- Next.js (App Router) + React + TypeScript (strict)
- Tailwind CSS v4
- Supabase (Postgres + Auth + Storage) — wired in from Milestone 2
- lucide-react icons, restyled as doodles

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Copy `.env.example` to `.env.local` and add your Supabase keys once Milestone 2 lands.

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```
