[Engineer / Planner]
        |
        v
[Sigma Live Action]  —— bound form ——> required-field + fixed-choice validation
        |
        | Submit → INSERT row into EOL Component Registry (Sigma Input Table)
        v
[EOL Component Registry — Sigma Input Table]
  (simulates a Snowflake write-back production table; single source of truth)
        |
        | live read — no manual refresh, formulas re-evaluate on every write
        v
[Computed Column Layer]  (Sigma's spreadsheet-like formula engine, equivalent to a SQL view)
        |
        +—> riskScorePart1  (stock run-out urgency)
        +—> daysUntilEOL → riskScorePart2Raw → riskScorePart2  (EOL proximity)
        +—> riskScorePart3  (financial exposure weight)
        +—> riskScore = Part1 + Part2 + Part3
        +—> riskLevel  (derived label: CRITICAL / HIGH / MEDIUM / LOW)
        +—> projectedStockoutDate → isStockoutSoon
        +—> riskAvoided  (cost-avoidance from logged mitigation actions)
        |
        v
[Sigma Live Insight]  —— re-renders on every underlying data change
        |
        +—> KPI: Total Financial Exposure
        +—> KPI: Critical Components
        +—> KPI: No Mitigation Plan / Alternatives Found
        +—> EOL Risk Heatmap (Urgency × EOL Status)
        +—> Run-Out Timeline bar chart (months of stock remaining)
        +—> KPI: Components Stocking Out in Next 90 Days  (count where isStockoutSoon = True)
        +—> KPI: Total Risk Mitigated to Date  (sum of riskAvoided)
