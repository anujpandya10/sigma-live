# Sigma Live — Track 2: Lifecycle & Obsolescence Management

### Veeco Systems · New Graduate Analytics Assignment

## Assignment Note

This repository was initialized while I was still awaiting track assignment (I had ranked Track 1 — Supply
Chain & Demand Planning — as my first preference, and an early exploratory scaffold for it remains in
`/src`, `/public`, and the root config files as commit history). On July 5, I was formally assigned
**Track 2 — Lifecycle & Obsolescence Management**, and per direction from my manager, the actual
implementation was built on the real **Sigma Computing** platform (not hand-coded), since the assignment's
premise is to simulate the live Sigma + Snowflake write-back relationship using the actual BI tool it
describes. This README and `/docs/architecture.md` document that Track 2 implementation.

## What This Is

A dual-application operational ecosystem, built natively in Sigma Computing, simulating the Sigma +
Snowflake live write-back paradigm applied to semiconductor component lifecycle risk.

**Sigma Live Insight** — a real-time risk dashboard for engineering components approaching End-of-Life
(EOL) from their suppliers. Surfaces financial exposure, a computed risk score, stock run-out timelines, and
mitigation progress across 8 tracked components spanning power electronics, vacuum systems, optical
hardware, and process equipment.

**Sigma Live Action** — an EOL Notice Registry input form for engineers to log newly discovered
obsolescence notices, register approved alternative part numbers, and update mitigation status on existing
components. Submissions write directly to the same Input Table the Insight dashboard reads from — closing
the feedback loop instantly, with no manual refresh.

## Platform / "Stack"

- **Sigma Computing** (cloud-native BI platform) — both Insight and Action are pages within a single Sigma
  Workbook.
- **Sigma Input Table** (`EOL Component Registry`) — a write-back-enabled table simulating a Snowflake
  production table. This is the single source of truth read by every chart, KPI, and the Action form.
- **Sigma computed columns** — the platform's spreadsheet-like formula layer (equivalent to derived SQL
  columns / a view layer over the base table). All risk modeling logic lives here — see
  `/docs/architecture.md` for the full formula chain.
- **Sigma UI elements** — KPI charts, a heatmap table, a bar chart, and a bound input form, all wired to the
  same Input Table.

No custom application code was written for the Track 2 submission — this is intentional, matching the
assignment's own framing that Sigma "translates user operations directly into optimized, live SQL queries"
and supports write-back natively, without requiring a hand-built simulation layer.

## Data Source

`eol_components_sigma.csv` — a manually curated 8-row component registry, loaded into a Sigma Input Table to
simulate a Snowflake-backed production warehouse table.

## System Design

See [`/docs/architecture.md`](./docs/architecture.md) for the full data flow diagram, data model mapping
(schema + computed-column dependency chain), and edge-case/scale-mitigation writeup.

## Key Analytical Additions

Beyond the baseline dashboard (KPIs, heatmap, run-out bar chart), this build adds three modeled features
that replace subjective/manual signals with computed ones:

1. **`riskScore` / `riskLevel`** — a weighted score combining stock run-out timing, EOL proximity, and
   dollar exposure, replacing the original hand-typed `urgency` column. Derivation is fully documented in
   `/docs/architecture.md`.
2. **`projectedStockoutDate`** — a forward-looking projection (not just current-state reporting), rolled up
   into a **"Components Stocking Out in Next 90 Days"** KPI.
3. **`riskAvoided`** — a cost-avoidance calculation tied to logged mitigation actions, rolled up into a
   **"Total Risk Mitigated to Date"** KPI, reframing engineering activity in dollar terms.
