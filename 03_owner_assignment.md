# Owner Assignment (Routing Layer)

**Layer 3 of the Migration Control System. Defines who owns each account through migration, how seniority routing depends on tier, what specialists get pulled in by flag, and what changes operationally when health auto-promotes an account.**

---

## The three customer-facing owner roles

Every account in the migration cohort has three owners, regardless of tier. These are roles, not titles — who fills each role depends on tier (next section).

**Account Owner (CSM)** — owns the customer relationship end-to-end through migration. Single point of contact for the customer. Responsible for relationship health, exec sponsor engagement, and overall migration confidence.

**Commercial Owner (Account Executive)** — owns repricing decisions, contract terms, bundle-upgrade plays. Loops in for any commercial conversation. Responsible for the disposition outcome (hold / convert / release) and for the Deel-equivalent rate anchor on Track B re-quotes.

**Migration Lead (HR Implementation Manager)** — responsibility hat worn by the HR Implementation Manager assigned to the migration cohort. Owns operational execution: friction surface resolution, milestone tracking, cross-functional coordination. The "get it done" role. Dissolves into normal CS ownership once migration completes — temporary by design.

These three are the customer-facing owners. Specialists pulled in by flag (next section) are consultative, not co-owners.

---

## Tier-driven seniority routing

Tier doesn't change *what* is owned — it changes *who* (seniority and dedication model) owns it.

```
Senior Migration:
  Account Owner    → Named CSM (dedicated portfolio)
  Commercial Owner → Named AE (regional, deal authority)
  Migration Lead   → Named HR IM (dedicated to account)

Churn Watch:
  Account Owner    → Named CSM (dedicated)
  Commercial Owner → Named AE (commercial retention authority)
  Migration Lead   → Named HR IM (dedicated)
  + Cross-functional escalation auto-active on entry

Standard Flow:
  Account Owner    → Pooled CSM (queue-based)
  Commercial Owner → Regional AE (queue-based)
  Migration Lead   → Pooled HR IM (queue-based)
```

**Named vs Pooled** is the structural distinction. A Named owner has the account in their dedicated portfolio with continuity of relationship. A Pooled owner takes accounts from a queue — the account still has an owner at any given moment, but continuity across interactions is not guaranteed.

The routing pattern reflects how SaaS CS organizations typically structure CSM assignment based on account value and complexity. It is consistent with Luke Ferrel's publicly described portfolio-and-incentive model at Deel, though specific internal terminology may differ.

---

## Flag-driven specialist routing

Stackable flags from Layer 2 pull in additional specialists alongside the three customer-facing owners. Specialists are consultative resources the Migration Lead engages for specific friction surfaces — they do not replace the three owners.

```
Legal Escalation flag (sku_mismatch_flag = TRUE):
  + US PEO complications     → Head of US Legal team
  + Multi-jurisdictional     → Legal Ops team
                               escalates to General Counsel for systemic issues
  + Contract drafting        → Legal Ops team

Contract-Protected flag (track_a_dominant + multi-year contract):
  + Contract review on any change  → Legal Ops team
  + Renewal preparation 90d ahead  → Account Owner + Commercial Owner pair
                                     (joint planning workstream)

High-risk country exposure (BR, IN, NG, AE, TR + others
flagged as high-risk in Layer 1):
  + Country-specific payroll work  → Payroll Implementation per-country specialist
                                     reports up to Director of Payroll Implementation
  + Country compliance review      → Compliance team
                                     escalates to Chief Compliance Officer for
                                     systemic regulatory issues
  + Immigration / visa work        → Global Mobility team
                                     (sits within Global Immigration Sales scope
                                     under Head of Enterprise Sales)
```

**Multiple flags stack.** An account with Legal Escalation + high-risk country exposure pulls in both Legal Ops and the relevant Payroll Implementation specialists. The Migration Lead coordinates across all consultative resources; the customer experiences a single throat-to-choke.

---

## Tier transition triggers

When health auto-promotes an account from Standard Flow → Churn Watch (Layer 2 mechanic), the ownership model changes operationally. The auto-promotion is not just a status change — it is an event with concrete downstream consequences.

```
Standard Flow → Churn Watch (auto-promotion event):

  Ownership upgrade (Pooled → Named):
    + Account Owner: Pooled CSM → Named CSM
    + Commercial Owner: Regional AE → Named AE
                        (with retention decision authority)
    + Migration Lead: Pooled HR IM → Named HR IM

  Cross-functional escalation activates:
    + VP Operations notified of tier transition
    + Cross-functional escalation channel opens for the account

  Workflow intensity changes:
    + Customer-initiated communication: 24h response SLA
    + Internal sync cadence: weekly → twice-weekly
    + Bundle-upgrade play unlocked as alternative to fee retention

  Disposition recommendation:
    + System recommends re-evaluating disposition
      (most auto-promoted accounts move from 'convert' to active retention)
```

Cross-functional escalation activates **on tier transition events**, not on steady-state Churn Watch tier alone. Accounts that entered Churn Watch at intake (e.g., short-tenure high-volatility accounts) are in steady-state retention work and do not trigger the cross-functional channel — they are owned within the CS retention workstream.

---

## Escalation paths

Three levels of escalation, in order. Function heads are destinations for systemic issues, not first-line escalation routes for single-account problems.

### Level 1: In-function escalation

```
Customer relationship issues:
  CSM → CSM team lead → Director-level inside CS org
  → Global Head of Customer Success only for systemic issues

Commercial / pricing disputes:
  AE → AE team lead → Director-level inside Sales
  → Head of Enterprise Sales only for systemic issues

Country-specific payroll:
  Payroll IM → Payroll Ops manager
  → Director of Payroll Implementation only for systemic issues

Country compliance / regulatory:
  Compliance team → Compliance ops manager
  → Chief Compliance Officer only for systemic issues

Legal / contract disputes:
  Legal Ops → Legal Ops manager
  → General Counsel only for systemic issues

US PEO-specific issues:
  US Legal team → routes through Head of US Legal

Immigration / visa:
  Global Mobility team → routes through Head of Enterprise Sales
                         (Global Immigration Sales scope)

Worker re-papering / data migration:
  HR Implementation Manager (the Migration Lead)
  → HR Implementation team lead
```

### Level 2: Cross-functional escalation

When Level 1 routes don't resolve, or when an issue spans multiple functions and no single function-head can own it:

```
→ VP Operations (oversees 11 ops verticals — payroll, HR, compliance,
   FinCrime, support, expansion, immigration, benefits, fintech, etc.)
```

This is where stuck-state cross-functional issues land before any executive escalation. Auto-promoted Churn Watch accounts activate this channel by default.

### Level 3: Break-glass

```
→ COO / Ghostbusters team
```

Reserved for problems where Level 1 and Level 2 cannot resolve. Never first-line escalation. The break-glass route exists as the structural backstop, not as a routine path.

---

## What this layer changes about the system

- **Logic, not hardcoded assignments.** Layer 3 specifies the routing rules. Per-account assignments are derived from Layer 2 (tier + flags) by application code or LLM at runtime — they live in Layer 5 (demo flow) where they're rendered for the UI. This makes the system reusable for the next acquisition without re-editing the routing layer.

- **Three owners, never more.** Specialists are consultative resources, not co-owners. Customers always have one Account Owner, one Commercial Owner, one Migration Lead — even when six specialists are engaged behind the scenes. This is the throat-to-choke principle that survives complexity.

- **Tier transitions are events.** When Halfbrick auto-promotes on Day 14, ownership changes — Pooled becomes Named, cross-functional channel activates, SLAs tighten, disposition gets re-evaluated. Layer 4 (clock state) will surface the timing of these transitions; Layer 5 (demo flow) will surface the operational consequences. The transition is not a label change, it is a workflow event.

- **The Migration Lead role is temporary by design.** It dissolves at migration completion into normal CS ownership. This is consistent with how acquisition migrations actually work — the dedicated migration-execution role exists for the cohort window, then the account becomes a normal Deel CS account. Don't model it as permanent infrastructure; that would over-engineer the layer.
