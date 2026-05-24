# Corporate Signal Intelligence Dashboard

Executive dashboard for the [Corporate Signal Intelligence](https://github.com/sidnei-almeida/corporate-signal-intelligence) platform. Visualizes ML anomaly detection, monitored public companies, SEC filing signals, market features, and Groq-generated executive briefings.

Built with **Next.js**, **TypeScript**, **Tailwind CSS**, **Recharts**, and **Lucide React**. Deploy target: **Vercel**.

## Backend API

Production API (Render):

**https://corporate-signal-intelligence.onrender.com**

Interactive docs: [https://corporate-signal-intelligence.onrender.com/docs](https://corporate-signal-intelligence.onrender.com/docs)

The dashboard does **not** connect to PostgreSQL directly. All data flows through the FastAPI backend.

## Main features

- API health and ML model status indicators
- Executive KPI overview (monitored companies, anomaly counts, highest-risk ticker)
- Top anomaly events table (clickable rows for briefing selection)
- Anomaly type distribution chart
- Company anomaly summary table
- Company selector with profile and per-ticker anomaly list
- Groq executive briefing generation (`POST /briefings/generate`)

## Environment variable

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://corporate-signal-intelligence.onrender.com
```

Used in `next.config.ts` rewrites and as the upstream for `/api-backend/*`. The browser calls that same-origin path via `src/lib/api.ts` (no cross-origin CORS in dev).

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** The Render free tier may sleep after inactivity. The first request can take 30–60 seconds while the API wakes up.

## Build

```bash
npm run build
npm start
```

## Deploy on Vercel

1. Import this repository on Vercel.
2. Framework preset: **Next.js**
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://corporate-signal-intelligence.onrender.com`
4. Deploy.

API traffic is proxied through `/api-backend/*` on the Next.js host, so the browser does not need CORS to Render in dev or on Vercel.

## Project structure

```
src/
├── app/              # Next.js App Router
├── components/
│   ├── layout/       # AppShell, Header, Sidebar
│   ├── dashboard/    # Executive panels & tables
│   └── ui/           # Card, Badge, Button, etc.
└── lib/              # api, types, formatters, constants
```

## Disclaimer

Model scores and LLM briefings are for **analytical monitoring and portfolio demonstration only**. They are not investment advice, legal opinions, or SEC filing interpretations.

## License

MIT
