# Sigma Live — Track 2 Execution Plan

Project tracking board for the Track 2 (Lifecycle & Obsolescence Management) build, mapped to the
assignment's Day 1–4 milestone structure. (Tracked here as a versioned markdown board; mirror into GitHub
Projects for the visual board view if desired.)

## Done

### Day 1 — Scoping, Architecture & UX Wireframes
- [x] Selected Track 2 domain, reviewed EOL scenario requirements
- [x] Curated the 8-component EOL dataset across power electronics, vacuum systems, optical hardware, and process equipment
- [x] Defined the `EOL Component Registry` Input Table schema (17 base fields)
- [x] Sketched system architecture: Insight and Action as two pages over one shared Sigma Input Table

### Day 2 — Core Build
- [x] Built baseline Sigma Live Insight dashboard: 4 KPIs (Total Financial Exposure, Critical Components, No Mitigation Plan, Alternatives Found)
- [x] Built EOL Risk Heatmap (Urgency × EOL Status) and Run-Out Timeline bar chart
- [x] Built Sigma Live Action: EOL Notice Registry form bound to the Input Table
- [x] Verified the write-back loop — form submissions reflect instantly on the Insight dashboard

### Day 3 — Advanced Analytics Layer
- [x] Designed the weighted `riskScore` model (stock urgency + EOL proximity + financial exposure), replacing the manually-typed `urgency` column
- [x] Built `riskScorePart1`; caught and fixed a data-quality bug where `runOutMonths = 999` (a non-EOL sentinel value) produced a `-759.2` score — fixed by clamping with `Greatest(0, ...)`
- [x] Built `daysUntilEOL` and `riskScorePart2` (EOL proximity); handled null `eolDate` (non-EOL components) with `Zn()` so they score `0` instead of erroring
- [x] Built `riskScorePart3` (financial exposure weight)
- [x] Combined into final `riskScore` and derived `riskLevel`; validated against the original manual `urgency` labels and found a real discrepancy on E008 (manual: LOW, computed: MEDIUM, due to unaccounted dollar exposure)
- [x] Built `projectedStockoutDate` and the "Components Stocking Out in Next 90 Days" KPI (predictive, not just descriptive)
- [x] Built `riskAvoided` and the "Total Risk Mitigated to Date" KPI (reframes mitigation activity in dollar terms)
- [x] Repo check-in: replaced placeholder documentation with real Track 2 architecture, data model, and edge-case writeup

## In Progress / To Do

### Day 4 — Polish & Showcase Prep
- [ ] Reorganize the Insight dashboard layout so `riskScore` / `riskLevel` are visually surfaced (currently only exist as columns in the underlying table)
- [ ] Rehearse the 10-minute live showcase: product walkthrough, system design methodology, AI-assisted workflow review

## Notes

An earlier commit in this repository's history reflects exploratory scaffolding for Track 1 (before final
track assignment on July 5). That work is not part of this submission — see README.md for details.
