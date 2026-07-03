# System Architecture — Sigma Live (Track 1)

## Data Flow
```
[Planner Input]
      |
      v
[Sigma Live Action]  —— validates form ——> error states
      |
      | onUpdate(id, {forecastDemand, leadTime, stock, notes})
      v
[App.jsx — Shared State (useState)]
      |
      | components[] prop
      v
[Sigma Live Insight]  —— re-renders with new values
      |
      +—> KPI Cards (re-computed)
      +—> Inventory vs Demand Chart (re-rendered)
      +—> Component Risk Table (re-sorted by status)
```

## Data Model

### Component
| Field         | Type    | Description                         |
|---------------|---------|-------------------------------------|
| id            | string  | Unique ID (e.g. C001)               |
| name          | string  | Component display name              |
| supplier      | string  | Supplier company name               |
| region        | string  | Supplier geography                  |
| stock         | number  | Units currently on hand             |
| forecastDemand| number  | Monthly projected demand (units)    |
| leadTime      | number  | Supplier transit time (days)        |
| unitCost      | number  | Cost per unit (USD)                 |
| notes         | string  | Planner notes / supply update log   |

### Derived Metrics (computed at render)
- **Status**: CRITICAL (<40% coverage) / AT_RISK (<75%) / WATCH (<100%) / OK
- **Days of Supply**: (stock / forecastDemand) × 30
- **Financial Exposure**: Σ(gap × unitCost) across AT_RISK + CRITICAL components
- **Coverage Ratio**: stock / forecastDemand

### Update Log Entry
| Field         | Type    | Description                         |
|---------------|---------|-------------------------------------|
| componentName | string  | Display name                        |
| time          | string  | HH:MM timestamp                     |
| prevDemand    | number  | Demand before update                |
| newDemand     | number  | Demand after update                 |
| prevLead      | number  | Lead time before                    |
| newLead       | number  | Lead time after                     |
| stockAdded    | number  | Units added from supply event       |
| note          | string  | Planner note attached to update     |

## How inputs mathematically alter dashboard aggregations

When `forecastDemand` for component C changes by δ (delta):
- `Status(C)` recomputes: CRITICAL if `stock / newDemand < 0.40`, AT_RISK if `< 0.75`, WATCH if `< 1.0`, OK otherwise
- `Financial Exposure = Σ max(0, demand_i − stock_i) × unitCost_i` across all components (recalculated in full)
- `Monthly planned demand (Jul) = previous_planned + δ` — current month total shifts proportionally
- `KPI: Components at Risk = count where status ∈ {CRITICAL, AT_RISK}` — recount on every render
- `Alert banner` appears/disappears based on `count where status = CRITICAL > 0`

When `stock` increases by δ (supply event logged):
- `Days of Supply(C) = (new_stock / forecastDemand) × 30`
- `Status(C)` recomputes with new stock value — may move component out of CRITICAL
- `Financial Exposure` recalculates — gap shrinks, exposure drops
- `Supplier Bottleneck KPI` unaffected (driven by leadTime, not stock)

When `leadTime` for component C changes:
- `Avg Supplier Lead Time = Σ leadTime_i / n` — recomputed across all n components
- `Supplier Bottleneck KPI = max(leadTime_i)` with supplier name — may change if override is on the current max

All three mutations trigger a single `setComponents()` call in App.jsx. React batches the state update and re-renders both InsightView (which recomputes all derived values inline) and the UpdateLog in ActionView in a single pass.

## Edge Case Handling
- **Concurrent updates**: React's state batching + immutable updates prevent race conditions in client state.
- **Invalid input**: Form validates on submit — blocks NaN, negative values, and values > 100,000 units.
- **Zero demand**: getDaysOfSupply() returns 999 to avoid division-by-zero.
- **At scale with real Snowflake**: Updates would POST to an API endpoint, which writes to a Snowflake Input Table. Insight would query Snowflake directly via Sigma's live SQL layer — no client cache required.
