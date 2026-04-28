# Customer Tiering + Health Indicator (Decision Layer)

**Layer 2 of the Migration Control System. Decides each account's treatment intensity at intake (static tier) and during execution (dynamic health-driven reassignment).**

---

## Static tier assignment (entry triage)

When a customer enters the migration program, the scoring model assigns them to one of three tiers, with stackable flags.

### Scoring model

**Migration complexity (0–100):**

```
country_footprint_score = min(countries_count / 10, 1) × 100
worker_count_score      = min(log10(workers + 1) / 2.5, 1) × 100
sku_mismatch_score      = 100 if sku_mismatch_flag else 0

complexity = (country_footprint_score × 0.40)
           + (worker_count_score     × 0.25)
           + (sku_mismatch_score     × 0.35)
```

**Churn risk (0–100):**

```
tenure_score:
  <12 months:   100
  12–24 months:  60
  24+ months:    20

industry_volatility:
  crypto:    40
  fintech:   30
  gaming:    20
  other:      0

geo_volatility:
  +20 points per high-volatility country (NG, RU, AE, BR, TR)
  capped at 60

total_volatility = min(industry_volatility + geo_volatility, 100)
churn_risk       = (tenure_score × 0.5) + (total_volatility × 0.5)
```

**Revenue at risk** = ARR × (churn_risk / 100)

### Tier assignment rules

Rules evaluated in order. First match wins.

```
1. IF churn_risk ≥ 60 AND tenure < 12 months:
     → CHURN WATCH (retention path)
     → SUPERSEDES Senior Migration even if ARR/complexity would qualify

2. IF ARR ≥ $350,000 OR complexity ≥ 75:
     → SENIOR MIGRATION (full attention)

3. ELSE:
     → STANDARD FLOW
```

**Stackable flags (apply on top of any tier):**

```
IF sku_mismatch_flag:                              → LEGAL ESCALATION
IF track == 'A' AND multi-year contract assumed:   → CONTRACT-PROTECTED
                                                     (drives 'hold' disposition)
```

### Methodology note

Senior threshold lowered from $500K to $350K after recalibrating ARR to realistic Omnipresent pre-acquisition pricing (was overstated previously). Documented and intentional.

Complexity threshold of 75 is calibrated so that genuinely complex accounts (large headcount + wide country footprint + SKU complications) qualify on complexity alone, while mid-market accounts with one complication (e.g., PEO-US only) get Standard Flow + Legal Escalation rather than being inflated to Senior Migration. The flag system handles the complication without distorting the tier.

### Tier distribution

```
SENIOR MIGRATION (2):  Meridian, Northwind
CHURN WATCH (2):       Palomar, Pivot (initial)
                       Halfbrick (auto-promoted Day 14 — see health layer)
STANDARD FLOW (8):     Soundtrap, Halfbrick (initial), Proof, Layer.ai,
                       Cube, Sphere, Kestrel, Corvus

FLAGS:
  Legal Escalation:    Proof, Kestrel, Northwind, Meridian, Pivot
                       (any account with sku_mismatch_flag)
  Contract-Protected:  Proof
                       (Track A + multi-year contract assumed)
```

### Computed scores per account

| Customer | Complexity | Churn Risk | Tier | Flags |
|---|---|---|---|---|
| Soundtrap | 48 | 30 | Standard | — |
| Halfbrick | 54 | 50 | Standard → Churn Watch (Day 14) | — |
| Proof | 72 | 30 | Standard | Legal Escalation, Contract-Protected |
| Layer.ai | 39 | 50 | Standard | — |
| Cube | 44 | 30 | Standard | — |
| Sphere | 34 | 10 | Standard | — |
| Meridian | 98 | 40 | Senior Migration | Legal Escalation |
| Northwind | 79 | 10 | Senior Migration | Legal Escalation |
| Kestrel | 69 | 50 | Standard | Legal Escalation |
| Palomar | 36 | 100 | Churn Watch | — |
| Corvus | 31 | 10 | Standard | — |
| Pivot | 74 | 85 | Churn Watch | Legal Escalation |

---

## Customer Health Indicator (dynamic tier reassignment)

The Customer Health system tracks four signals during active migration. If health degrades, the customer can move from Senior or Standard tier into Churn Watch during execution, not just at intake. This is the system's **preferential treatment decision layer** — it ensures customers who start fine but drift into trouble get retention focus before they actually churn.

### The four signals

```typescript
type HealthSignal = 'green' | 'amber' | 'red';

type CustomerHealth = {
  responsiveness: HealthSignal;
  // Customer's response time to CSM outreach.
  // Green: <48h | Amber: 2–5 days | Red: >5 days

  ticketVolume: HealthSignal;
  // Support tickets from this customer's workers, baseline-relative.
  // Green: at/below baseline | Amber: 2x baseline | Red: 3x+ baseline

  milestoneProgress: HealthSignal;
  // MSA, country appendices, contracts on schedule per playbook.
  // Green: on track | Amber: 1 milestone slipping | Red: 2+ slipping

  stakeholderEngagement: HealthSignal;
  // Customer's exec sponsor, HR lead, finance lead all responsive.
  // Green: all active | Amber: one stakeholder silent | Red: 2+ silent

  overall: HealthSignal;
  notes: { [key: string]: string };
};
```

### Computation rule

```
4 green                          → overall: green
1+ amber, 0 red                  → overall: amber
1 red                            → overall: amber (degrading)
2+ red                           → overall: red
2+ red AND tier != Churn Watch   → AUTO-PROMOTE TO CHURN WATCH
```

### Hardcoded health states for the demo

| Customer | Resp. | Tickets | Milestone | Stakeholder | Overall | Tier change |
|---|---|---|---|---|---|---|
| Meridian | green | green | amber | green | amber | — |
| Northwind | green | green | green | green | green | — |
| Kestrel | amber | green | red | green | amber | — |
| Palomar | red | red | amber | red | red | — (already Churn Watch) |
| Pivot | red | amber | red | red | red | — (already Churn Watch) |
| Soundtrap | green | green | green | green | green | — |
| **Halfbrick** | **amber** | **red** | **red** | **green** | **red** | **AUTO-PROMOTED Day 14** |
| Proof | green | green | green | green | green | — |
| Layer.ai | green | green | amber | green | amber | — |
| Cube | green | green | green | green | green | — |
| Sphere | green | green | green | green | green | — |
| Corvus | green | green | green | amber | amber | — |

### Notes per signal (tooltip content)

**Meridian milestone amber:** "Brazil eSocial sync running 3 days behind schedule. Local payroll partner (Brazil) engaged with Omnipresent migration team to resolve."

**Kestrel milestone red:** "MSA + custom SKU contract terms 5 days past target. Legal Ops engaged. Customer-side legal review still pending."

**Kestrel responsiveness amber:** "Customer's HR lead response time slipping past 3 days, possibly tied to legal review delay."

**Palomar (all signals red):** "Customer's CFO went silent 6 days ago after question about FX variance. CSM has chased twice. AE engaging exec sponsor for commercial conversation."

**Pivot (all signals degraded):** "Customer indicated active comparison with another EOR provider. Worker complaints up about Mexico payroll setup. CSM + AE in joint retention play."

**Halfbrick tickets red:** "Worker ticket volume tripled in past week. 17-country footprint creating compounding load — Brazil and India payroll cycles firing simultaneously generated cascade of statutory questions."

**Halfbrick milestone red:** "Brazil eSocial validation 5 days behind. India statutory compliance review pending. Two milestones slipping concurrently."

**Halfbrick responsiveness amber:** "HR lead response time slipped to 4 days, likely overwhelmed by ticket volume."

**Halfbrick auto-promotion note:** "Auto-promoted from Standard Flow to Churn Watch on Day 14 due to compounding BR + IN payroll cycle pressure. 17-country footprint generating cascading worker tickets. Retention play activated; exec sponsor outreach scheduled. System caught the drift before customer escalated."

**Layer.ai milestone amber:** "India statutory compliance review pending. Local payroll partner (India) engaged. No customer impact yet."

**Corvus stakeholder amber:** "Customer's HR lead on parental leave. Backup contact identified but not yet engaged."

**Sphere all green:** "Track A direct-entity, 28-month tenure, simple country footprint. Migration not yet started — omnipresent_only CSM state is normal for accounts that haven't entered active migration. Will move to in_handover when Phase 1 begins."

---

## What this layer changes about the system

- **Tier is cleaner than disposition.** Most accounts are Standard Flow. The flags (Legal Escalation, Contract-Protected) do meaningful differentiation work. Owner assignment in Layer 3 will route on tier *and* flags, not just tier.

- **Auto-promotion is a workflow trigger, not just a status change.** When Halfbrick promotes from Standard to Churn Watch, owner assignment needs to *change* — a senior CSM and AE need to be added. Layer 3 will treat tier transitions as events with downstream consequences.

- **Sphere is the canonical "do nothing" demo example.** All green, no friction, no SLA, no flag. The system explicitly recommends "no intervention needed" rather than forcing every account through a workflow. That's a feature, not a gap.
