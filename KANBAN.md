# Sigma Live — Track 2 Execution Kanban

A versioned task board tracking the Track 2 (Lifecycle & Obsolescence Management) build, mapped to the
assignment's Day 1–4 milestones. See [`README.md`](./README.md) and [`docs/architecture.md`](./docs/architecture.md)
for the corresponding system documentation.

## Done

### Day 1 — Scoping & Architecture
- [x] Selected Track 2 domain and reviewed EOL scenario requirements
- [x] Curated the 8-component EOL dataset across power electronics, vacuum, optical, and process categories
- [x] Defined the EOL Component Registry Input Table schema
- [x] Sketched system architecture (Insight ↔ Action via shared Input Table)

### Day 2 — Core Build
- [x] Built baseline Insight dashboard (4 KPIs, Urgency × EOL Status heatmap, Run-Out Timeline chart)
- [x] Built the Action form (EOL Notice Registry) bound to the Input Table
- [x] Verified the write-back loop closes instantly between Action and Insight

### Day 3 — Advanced Analytics Layer
- [x] Designed the weighted `riskScore` model (stock urgency + EOL proximity + financial exposure)
- [x] Built `riskScorePart1`, caught and fixed a `runOutMonths = 999` sentinel bug that was producing a
      negative score
- [x] Built `riskScorePart2` (EOL proximity), handled null `eolDate` with `Zn()`
- [x] Built `riskScorePart3` (financial exposure weight)
- [x] Combined into `riskScore` / `riskLevel`, validated against the original manual urgency labels and
      found one real discrepancy (E008)
- [x] Built `projectedStockoutDate` + the 90-day stockout KPI
- [x] Built `riskAvoided` + the risk-mitigated KPI
- [x] Replaced placeholder repo docs with real Track 2 architecture/data-model documentation

## In Progress

### Day 4 — Polish & Showcase Prep
- [ ] Reorganize the Insight dashboard so `riskScore` / `riskLevel` are visible, not just buried in the table
- [ ] Rehearse the 10-minute live showcase

## Todo
- [ ] None currently — remaining work is scoped under Day 4 above
