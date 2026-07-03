# Sigma Live — Track 1: Supply Chain & Demand Planning
### Veeco Systems · New Graduate Analytics Assignment

## What This Is
A dual-application operational ecosystem simulating the Sigma Computing + Snowflake live write-back paradigm, applied to semiconductor supply chain management.

**Sigma Live Insight** — Real-time analytics dashboard showing inventory levels vs. demand forecasts, component risk status, financial exposure, and monthly demand trends.

**Sigma Live Action** — Operational input panel for planners to update demand forecasts, override supplier lead times, and log incoming supply shipments. Changes reflect instantly on the Insight dashboard, closing the feedback loop.

## Tech Stack
- React 18 + Vite
- Recharts (data visualization)
- Tailwind CSS (styling)
- React useState (shared state / write-back simulation)

## Run Locally
```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

## Deploy to Vercel
```bash
npm install -g vercel
vercel
```
Or connect the GitHub repo to vercel.com for automatic deployments.

## Architecture
State lives in App.jsx and is shared across both components. When a planner submits an update in ActionView, the parent state updates, causing InsightView to re-render with the new values — simulating Sigma's write-back to Snowflake.

## System Design
See `/docs/architecture.md` for full data flow diagrams and data model documentation.
