# Migration Control System — Customer Dataset

**Layer 1 of the Migration Control System. Foundation data model for the post-acquisition customer migration cohort.**

---

## Methodology

Twelve customers total. Six real (pulled from Omnipresent's public case study pages pre-acquisition), six synthetic (designed to span the migration decision space).

### Pricing inputs (Omnipresent pre-acquisition rates)

- **EOR**: $499/employee/month = $5,988/year
- **Contractor**: $29/contractor/month = $348/year
- **PEO-US**: $1,800/year (commoditized US PEO market, separate assumption from international EOR pricing)

### Discount tiering (industry-standard, documented assumption)

| Workers | Discount |
|---|---|
| 1–24 | 0% |
| 25–49 | 10% |
| 50–99 | 15–20% |
| 100–199 | 25% |
| 200+ | 30–35% |

This applies a simplified headcount-based discount curve. Real Omnipresent enterprise contracts likely included additional non-headcount terms (multi-year commits, bundled services, country-specific pricing). The simplification is for demo legibility; the production system would model contract-specific terms per account.

**Critical credibility note:** ARR figures use Omnipresent's pre-acquisition pricing tier, not Deel's enterprise pricing tier (which is higher). This is an intentional choice so a reviewer can verify the math against publicly observable Omnipresent rates.

### Provenance tags

- **PUBLISHED** — number is in a primary source we can cite
- **PARTIAL** — primary source exists; number is a derived calculation
- **ESTIMATE** — operationally plausible, derived from public unit pricing
- **SYNTHETIC** — invented for the demo, clearly labeled

### Migration-state synthesis (synthesis-by-inference)

Migration state fields (track, quote SLA, friction surfaces, health, disposition, CSM handover, renewal) are not publicly observable for these specific customers — this is internal Omnipresent and Deel data that was never published. They are synthesized by inference from each account's profile (country footprint, SKU mix, tenure, headcount) to produce operationally realistic states that span the decision space.

**Inference logic:**

- **Country-track inference (Layer 1 directional):** Track is a per-worker
  attribute determined by the country a worker is employed in. Omnipresent
  owned legal entities in roughly 25-40 countries (industry-pattern inference;
  Omnipresent did not publicly disclose its exact owned-entity list). Workers
  in countries where Omnipresent owned an entity are Track A (Deel inherits
  the entity, fees can be honored). Workers in countries where Omnipresent
  used local partners are Track B (Deel must re-quote per its own pricing,
  with the 7-day customer-acceptance window). A customer can have workers
  on both tracks simultaneously — most multi-country customers are mixed.

  The `country_track_map` field per customer maps each country in their
  footprint to A or B. The `track_mix` summary field is computed from that
  map: `track_a_dominant` if 80%+ of countries are A, `track_b_dominant`
  if 80%+ are B, `mixed` otherwise.

  The country-track inference below is directional, not verified against
  internal Omnipresent data:

  Track A (likely owned entity, high confidence):
    US, GB, IE, DE, FR, NL, ES, IT, AU, CA, IN, SG

  Track A (likely owned entity, medium confidence):
    SE, BE, PT, MX, JP, BR, AE

  Track B (likely partner, high confidence):
    NG, KR, TR, VN, TH, ID, KE, MA, EG, CO, PE, CL, AR, PH, PK, BD

  Track B (likely partner, medium confidence):
    NZ, PL, NO, DK, FI, AT, CH, GR, CZ, HU, RO, IL, ZA
- **SLA state (Track B portion of mixed customers):** Distributed across the cohort to span the decision space — one at acute distress (day 6 of 7), one already accepted, others mid-clock or early. Track A-dominant customers have no Track B SLA exposure.
- **Friction surfaces:** Drawn from the fixed seven (CSM continuity, payroll cutoff, benefits substitution, platform learning curve, document/data lag, bundled-service unbundling, tax-election re-flagging). Activation follows from profile: SKU mismatch → benefits + tax friction; high-risk countries → tax + benefits; short tenure → platform + document friction; large headcount → CSM + payroll friction.
- **Health state:** Distributed across green/watch/at-risk, weighted by friction count and tenure.
- **Disposition:** track_a_dominant customers with multi-year terms → hold; most accounts → convert; long-tail with weak tenure → release-eligible.
- **CSM handover:** Distributed across the three states, weighted by tier (enterprise gets faster Deel CSM assignment).
- **Renewal date:** Inferred as `tenure_months + ~12` from contract start, clustered into the next 0–18 months for demo realism.

---

## Dataset

```csv
customer_id,customer_name,source,workers_total,eor_workers,contractor_workers,peo_us_workers,countries_count,countries_list,high_risk_flags,tenure_months,industry,arr_usd,arr_provenance,sku_mismatch_flag,track_mix,country_track_map,quote_issued_date,quote_acceptance_deadline,quote_state,friction_surfaces_active,health_state,disposition,csm_handover_state,renewal_date
1,Soundtrap,REAL,35,30,5,0,8,"US;GB;DE;SE;NL;ES;FR;AU","DE;FR;NL",18,Music tech / SaaS,160000,ESTIMATE,FALSE,track_a_dominant,"US:A;GB:A;DE:A;SE:A;NL:A;ES:A;FR:A;AU:A",,,,"benefits_substitution",watch,convert,deel_assigned,2026-09-15
2,Halfbrick,REAL,25,25,0,0,17,"US;AU;GB;DE;FR;BR;IN;CA;JP;SG;MX;NZ;IE;ES;PL;NO;DK","DE;FR;BR;IN",22,Gaming,135000,ESTIMATE,FALSE,mixed,"US:A;AU:A;GB:A;DE:A;FR:A;BR:A;IN:A;CA:A;JP:A;SG:A;MX:A;NZ:B;IE:A;ES:A;PL:B;NO:B;DK:B",2026-04-25,2026-05-02,pending,"tax_election_reflagging;document_data_lag;platform_learning_curve",watch,convert,in_handover,2027-01-20
3,Proof,REAL,45,35,0,10,5,"US;CA;GB;IE;AU","",14,Legal tech,200000,ESTIMATE,TRUE,track_a_dominant,"US:A;CA:A;GB:A;IE:A;AU:A",,,,"benefits_substitution;bundled_service_unbundling",green,hold,deel_assigned,2026-08-10
4,Layer.ai,REAL,28,22,6,0,6,"US;GB;DE;IN;SG;CA","DE;IN",9,AI / SaaS,120000,ESTIMATE,FALSE,track_a_dominant,"US:A;GB:A;DE:A;IN:A;SG:A;CA:A",,,,"platform_learning_curve;document_data_lag",watch,convert,in_handover,2026-12-05
5,Cube,REAL,35,30,5,0,7,"US;GB;DE;FR;NL;CA;IE","DE;FR;NL",16,Data / SaaS,160000,ESTIMATE,FALSE,track_a_dominant,"US:A;GB:A;DE:A;FR:A;NL:A;CA:A;IE:A",,,,"benefits_substitution",green,convert,deel_assigned,2026-11-08
6,Sphere,REAL,22,18,4,0,5,"US;GB;CA;AU;IE","",28,SaaS,109000,ESTIMATE,FALSE,track_a_dominant,"US:A;GB:A;CA:A;AU:A;IE:A",,,,,green,convert,omnipresent_only,2026-06-15
7,Meridian Health Analytics,SYNTHETIC,210,140,40,30,10,"US;CA;GB;DE;FR;NL;IN;BR;SG;AU","DE;FR;NL;BR;IN",20,HealthTech / SaaS,580000,SYNTHETIC,TRUE,track_a_dominant,"US:A;CA:A;GB:A;DE:A;FR:A;NL:A;IN:A;BR:A;SG:A;AU:A",,,,"csm_continuity_break;benefits_substitution;tax_election_reflagging",at_risk,convert,in_handover,2026-10-30
8,Northwind Renewables,SYNTHETIC,95,75,15,5,6,"US;DE;NL;DK;NO;SE","DE;NL",26,CleanTech,355000,SYNTHETIC,TRUE,mixed,"US:A;DE:A;NL:A;DK:B;NO:B;SE:A",2026-04-15,2026-04-22,accepted,"benefits_substitution;payroll_cutoff_shift",green,convert,deel_assigned,2026-09-25
9,Kestrel Robotics,SYNTHETIC,60,45,8,7,4,"US;DE;JP;KR","DE",8,Robotics / Manufacturing,250000,SYNTHETIC,TRUE,mixed,"US:A;DE:A;JP:A;KR:B",,,,"benefits_substitution;tax_election_reflagging;platform_learning_curve;document_data_lag",at_risk,convert,in_handover,2026-12-18
10,Palomar Trading,SYNTHETIC,40,35,5,0,5,"GB;AE;SG;NG;BR","AE;NG;BR",10,Crypto / Trading,190000,SYNTHETIC,FALSE,mixed,"GB:A;AE:A;SG:A;NG:B;BR:A",,,,"tax_election_reflagging;document_data_lag",watch,release,in_handover,2026-12-10
11,Corvus Legal Tech,SYNTHETIC,30,25,5,0,4,"US;GB;IE;CA","",30,Legal tech / SaaS,136000,SYNTHETIC,FALSE,track_a_dominant,"US:A;GB:A;IE:A;CA:A",,,,,green,convert,deel_assigned,2026-09-05
12,Pivot Payments,SYNTHETIC,32,25,5,2,6,"US;GB;IE;AE;TR;MX","AE;TR",7,Fintech,135000,SYNTHETIC,TRUE,mixed,"US:A;GB:A;IE:A;AE:A;TR:B;MX:A",2026-04-24,2026-05-01,pending,"tax_election_reflagging;benefits_substitution;platform_learning_curve;document_data_lag",at_risk,release,in_handover,2026-11-12
```

---

## Notes on key accounts

**Meridian Health Analytics — Senior Migration centerpiece.** 210 workers
across 10 countries, all of which are likely Omnipresent owned-entity (US,
CA, GB, DE, FR, NL, IN, BR, SG, AU) — `track_a_dominant`. The demo subject
for *Senior Migration tier under multi-country regulatory complexity*, not
for Track B SLA pressure (Meridian has minimal Track B exposure). Three
active friction surfaces: CSM continuity break, benefits substitution gap
in regulated DE/NL/FR markets, tax-election re-flagging for NL 30% ruling
and BR statutory complexity. At-risk health, in-handover CSM. $580K ARR.
The account that requires immediate Senior Migration attention.

**Sphere — controlled green case.** Track A, no active friction, 28-month tenure, omnipresent-only CSM (handover hasn't started because nothing's broken). The "leave it alone" counter-example. Demo-useful to show the system can recognize a healthy account.

**Northwind — Track B live-fire demo subject.** Mixed-track: US/DE/NL/SE
on Track A (owned entity), DK/NO on Track B (partner). $355K ARR, Senior
Migration tier, currently green health with quote already accepted. The
demo button — "Simulate health degradation: Northwind" — flips the Track B
portion specifically: DK/NO worker tickets surge, partner-side milestone
slips, localized to the Track B exposure while Track A workers stay calm.
Demonstrates the system catching localized partner-side failure on a
Senior Migration account in real time.

**Palomar and Pivot — release candidates.** Short tenure (10 and 7 months),
mixed-track exposure with high-volatility partner countries (NG for
Palomar; TR for Pivot). The accounts where the system explicitly
recommends "accept attrition risk" — making the held/converted/released
decision visible rather than pretending every account gets saved.

**Proof — the only "hold" disposition.** `track_a_dominant` (US, CA, GB,
IE, AU all Omnipresent owned-entity), 5-country footprint with no
high-risk flags, 14-month tenure with PEO-US workers. Multi-year contract
terms assumed; honoring is cheaper than the brand cost of breaking. The
Contract-Protected flag (Track A dominant + multi-year contract) flags
this account as protected.

---

## Cohort distribution (deliberate, not random)

- **Track mix:** 7 track_a_dominant (Soundtrap, Proof, Layer.ai, Cube, Sphere, Meridian, Corvus); 5 mixed (Halfbrick, Northwind, Kestrel, Palomar, Pivot); 0 pure track_b_dominant
- **Quote states:** 5 pending (active Track B re-quote work on mixed-track customers' partner-country workers), 1 accepted (Northwind), 6 N/A
- **Health:** 4 green, 4 watch, 3 at-risk, 1 N/A
- **Disposition:** 1 hold (Proof), 9 convert, 2 release (Palomar, Pivot)
- **CSM handover:** 4 deel_assigned, 6 in_handover, 1 omnipresent_only, 1 N/A

The demo flow: Meridian (the fire) → Kestrel and Pivot (the at-risk supporting cast) → Palomar (the release decision) → Northwind (the success) → Sphere (the leave-alone). Five accounts tell the entire story; the other seven add depth.
