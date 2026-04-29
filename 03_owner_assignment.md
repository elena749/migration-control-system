# Owner Assignment + Escalation (Routing Layer)

**Layer 3 of the Migration Control System. Defines who owns each account, how work routes from the owner to specialists, and how escalation flows when the owner can't unstick a stuck state.**

---

## Single owner per account: the CSM

The CSM (Customer Success Manager) is the single point of accountability for migration success. They own the customer relationship, drive daily progress, route work to specialists, and escalate when their routing isn't working.

This is a deliberate departure from "three owner" or RACI-style models that diffuse accountability across multiple parties. One throat to choke. One person whose performance is measured against the migration outcome. Everyone else is engaged, not owning.

```
ACCOUNTABILITY:
CSM owns migration success
CSM is accountable to CSM Manager
CSM Manager is accountable to Head of CS
Head of CS is accountable to COO

ROUTING (the CSM directs work to):

AE (Account Executive): commercial decisions
— repricing, disposition recommendation, contract changes
Implementation Lead (HR IM / Implementation Manager): operational migration
— playbook execution, milestone progress, customer-side coordination
Specialists (per-function, per-country): function-specific work
— Payroll IM (per country), Legal Ops, US Legal, Compliance
Customer-side stakeholders: HR lead, Finance lead, exec sponsor

ENGAGEMENT vs. OWNERSHIP:
Specialists, AEs, and Implementation Leads are "engaged" with accounts.
They do work. They have accountability for their function's contribution.
But they don't own the account. The CSM does.

This means: when a customer is unhappy, the CSM is the one called.
When a milestone slips, the CSM is the one who explains.
When the account is at risk, the CSM is the retention driver.
```

## CSM seniority by tier

The CSM exists for every account. What changes by tier is the seniority of the assigned CSM.

```
Senior Migration tier (Meridian, Northwind):
→ Named senior CSM (dedicated portfolio, individual book)

Churn Watch tier (Halfbrick, Palomar, Pivot):
→ Named senior CSM with retention specialty
→ Direct CSM Manager visibility on weekly cadence

Standard Flow tier (Soundtrap, Proof, Layer.ai, Cube, Sphere, Kestrel, Corvus):
→ Pooled CSM (round-robin assignment from CS pool)
→ CSM Manager involvement only on escalation
```

Pooled CSMs are real CSMs, not junior. The pooled designation means the customer has a single CSM (still one owner) but assignment is rotational rather than dedicated. For the customer, this is invisible — they have one person they call.

## Routing relationships per tier

```
ALL TIERS:
AE — commercial decisions, repricing, disposition
Implementation Lead (HR IM) — operational migration execution

ADDITIONAL ROUTING TRIGGERED BY CONDITION:

IF sku_mismatch_flag (Legal Escalation):
+ Legal Ops — multi-jurisdictional contract review
+ US Legal — if PEO-US workers present (Proof, Northwind, Meridian, etc.)

IF Track B workers active in 7-day quote window:
+ AE drives commercial decision (already routed; elevated priority)

IF customer footprint includes high-risk country (DE, FR, NL, BR, IN, AE, NG, TR):
+ Country-specific Payroll IM
+ Compliance for the relevant jurisdiction

IF auto-promoted to Churn Watch (health-driven):
+ Retention specialist paired alongside CSM
+ Cross-functional escalation channel activated
```

These are **engagement relationships** — the CSM has visibility into who's doing what, and routes work through these channels. None of them are co-owners.

## The escalation chain — four tiers, CEO not in chain

The CSM drives the account. When they can't unstick something, escalation moves up:

```
TIER 1 — CSM
Default state. CSM drives the account, routes work, manages the customer.
Most accounts stay here permanently.

TIER 2 — CSM Manager
Triggers:
- Health degraded to amber 5+ days without resolution
- Customer relationship issues CSM can't resolve alone
- Capacity overload (CSM has too many at-risk accounts simultaneously)
Role:
- Coaches CSM on retention approach
- Engages directly if customer relationship has broken down with CSM
- Reassigns to senior CSM if pattern indicates fit issue

TIER 3 — Head of CS (or VP CS)
Triggers:
- Cross-functional blocker (Legal won't sign off, Implementation can't deliver)
- CSM Manager has tried convening and failed
- Pattern across multiple accounts indicating systemic issue
Role:
- Convenes function heads (Head of Legal Ops, Head of Implementation)
- Resolves cross-functional disputes
- Triggers Ghostbuster engagement if convening fails

TIER 4 — Ghostbusters (break-glass)
Triggers:
- Tier 3 convening has failed or stalled 7+ days
- Account at risk of churn while system is stuck
- Pattern suggests function heads can't resolve internally
Role:
- COO-empowered cross-functional intervention
- Direct authority to assign work, override function priorities
- Reports findings back to COO for systemic remediation

Ghostbusters are not a fifth owner. They're the COO's intervention
surface for when the CSM-led routing has structurally failed.

CEO is not in the escalation chain.
Ghostbusters report to COO. COO handles whatever remediation is needed
at executive level. CEO involvement signals catastrophic system failure.
```

## Escalation events — logged, not just suggested

When the system's directive recommends escalation (Tier 2/3/4), this is logged as an event with a timestamp. Escalation is a tracked workflow state, not advisory text.

Escalation event record:

```
escalation_tier: 2 | 3 | 4
triggered_at: timestamp
triggered_by: directive that fired (e.g., "5d boundary breach on customer-side blocker")
target_role: "CSM Manager" | "Head of CS" | "Ghostbuster"
acknowledgement_state: "pending" | "acknowledged" | "resolved"
acknowledgement_at: timestamp (when target party confirmed engagement)
```

This makes escalation visible:
- The CSM sees "Escalation triggered to CSM Manager (pending acknowledgement)"
- The CSM Manager sees the escalated accounts in their own brief, waiting for their engagement
- If acknowledgement doesn't happen within an SLA (24h for Tier 2, 48h for Tier 3, immediate for Tier 4), the system surfaces this — escalation that's gone unnoticed becomes its own visible problem

For the v1 demo: the system doesn't actually send Slack/email notifications. It surfaces escalation state visually so the workflow loop is visible.

## Customer-facing SLA per tier

The customer-facing SLA is independent of the ownership model. It's about the customer's experience:

```
Senior Migration: 48-hour response SLA on customer-initiated escalation
Churn Watch:      24-hour response SLA on customer-initiated escalation
Standard Flow:    72-hour response SLA on customer-initiated escalation
```

The CSM owns hitting these SLAs. They route to the appropriate function for substance, but the response itself is the CSM's accountability.

## What this layer changes about the system

- **Single ownership.** One CSM per account. No co-owners. No diffused accountability. This is the cleanest possible operational principle and the most aligned with how Deel actually operates.

- **Routing replaces co-ownership.** Specialists, AEs, Implementation Leads are engaged with accounts but don't own them. The CSM directs them. The data model reflects this — owners are flat (one CSM), engagements are routing relationships (a list).

- **Escalation chain is finite.** Four tiers, ending at Ghostbusters. CEO is not in the chain. This makes Ghostbusters the visible break-glass surface for when the line org has failed — exactly what Westgarth's team is for.

- **Pooled vs. Named is about CSM seniority, not multiple CSMs.** The customer always has one CSM. Pooled means the assignment is rotational; Named means the CSM is dedicated. For the customer, this is invisible.
