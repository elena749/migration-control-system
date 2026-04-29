# Action State Machine (Internal Timing Layer)

**Layer 4 of the Migration Control System. Governs how Deel's internal owners hold and move actions through migration. Produces per-action state data that Layer 5 renders into role-shaped views for the people doing migration work — CSMs, AEs, Migration Leads, specialists, and function leads — each seeing the cut of the data shaped to their job.**

---

## What "action" means in this system

An *action* is a discrete unit of work attached to an account: resolving a friction surface, completing a Track B quote re-issuance, executing an escalation, preparing a renewal milestone, drafting a contract amendment.

Each account has multiple actions in flight at any time. The state machine applies *per action*, not per account. An account can have one action in ACTING state and another in BLOCKED BUT DRIVEN simultaneously — the account-level view (Layer 5) aggregates across them.

Actions are owned by the Layer 3 customer-facing owners (Account Owner / Commercial Owner / Migration Lead) or by the consultative specialists (Legal Ops, Payroll Implementation, Compliance team, etc.) when work is in their function.

---

## The four-state machine

Every action is in exactly one of four states at any time.

**ACTING** — Owner is executing. Status fresh (updated within last 48 hours). The default productive state.

**ESCALATING** — Ownership is moving up the chain. Owner has formally handed off to a higher authority per the Layer 3 escalation paths. The action is in transit between owners.

**BLOCKED BUT DRIVEN** — Waiting on external input, but actively pushed. Has a defined next step and an active human pushing it. Blocker is categorized (see below).

**PASSIVE OWNERSHIP** — *Forbidden state.* No action, no escalation, no clarity. The system is designed so this state is unreachable in practice — the timing rules below force every action out of passivity within bounded time.

The artifact's distinctive design choice is that PASSIVE OWNERSHIP is treated as a system failure to be prevented, not a status to be tolerated. The 48h visibility enforcement (below) is the mechanism that makes this state unreachable.

---

## The three timing rules

These rules layer on top of the state machine. They apply to *individual internal actions within Deel's control*. They do not apply to multi-stage workstreams (renewal preparation, contract negotiation) which decompose into multiple individually-bounded actions, and they do not govern customer-facing windows (which Layer 3 owns).

```
48h    → VISIBILITY ENFORCEMENT
         If no status update in 48 hours, system prompts owner for:
         - Status (still working / blocked / waiting)
         - Defined next step
         - Expected next-update timestamp

         If owner doesn't respond to prompt within 24h additional window:
         → action automatically transitions to ESCALATING
         → original owner is notified that ownership has been moved
         → Layer 3 escalation routing determines the destination
```

```
2–3d   → ESCALATION OBLIGATION
         If owner cannot progress (lack of authority, capacity, dependency,
         or external blocker), they must formally escalate within 2–3
         working days, with:
         - Reason for escalation
         - What's needed to unblock
         - Who should take over (if applicable)
```

```
5d     → RESOLUTION BOUNDARY
         All individual actions inside Deel's control must complete within
         5 working days.

         Past 5 days = system failure, not task failure.

         The diagnosis is that routing failed (wrong owner, wrong escalation
         path, missing capacity), not that the owner failed. Auto-escalate
         to function-level resource when the 5-day boundary is breached.
```

The 5-day boundary applies to *individual actions*, not to multi-stage workstreams or customer-facing decision windows. Renewal preparation runs over weeks; it decomposes into many 5-day-bounded actions. The Track B quote-acceptance window is 7 days per affected worker (or per affected country), and applies to the Track B portion of mixed-track customers. It is a *customer-side* clock, not a Deel-internal action — Layer 5 surfaces it for visibility, but Layer 4's 5-day rule does not constrain it.

---

## Internal action timing vs customer-facing SLAs

Two parallel timing systems coexist in the artifact, governed by different layers.

**Internal action timing (this layer):** How long an internal owner can hold an action before being required to update, escalate, or hand off. Governed by the 48h / 2–3d / 5d cascade above.

**Customer-facing SLAs (Layer 3):** How fast Deel must respond to customer-initiated communication. Default per CS norms; on Churn Watch tier, tightens to 24h.

These are independent systems that share information. A single account can have:

- An internal action ("draft Track B re-quote") in ACTING state, day 2 of internal 5-day boundary
- A customer-facing SLA clock running because the customer's CFO emailed a question

The internal action might be progressing fine while the customer-facing SLA is being missed. Layer 5 (the rendering layer) surfaces both clocks per account and flags whichever is more urgent.

This layer (Layer 4) does not track customer-facing SLAs — Layer 3 owns them. This layer tracks only internal action state.

---

## Blocker categorization (forced choice)

When an action enters BLOCKED BUT DRIVEN state, the owner picks exactly one category. The category determines the escalation route.

```
1. CUSTOMER-SIDE      Missing data, delayed approval, unclear requirements,
                      non-responsive customer stakeholders.

2. DEEL-INTERNAL      Function dependency, missing internal approval,
                      capacity constraint, awaiting another team's output.

3. THIRD-PARTY        Banking/payroll partner delay, government systems,
                      vendor dependencies outside Deel's direct control.

4. LEGAL/COMPLIANCE   Regulatory uncertainty, contract constraints,
                      ongoing legal/compliance review.
```

Forced choice (exactly one) prevents "blocked" from becoming a generic excuse field. Every blocker has a destination via the escalation routing below.

---

## Next Move per action

Every action carries enough context to generate a directive — the next move someone needs to make. The action's data record includes the inputs; the directive itself is generated at render time by Layer 7 logic.

Each action has:

```
description: what needs to happen on this account
state: ACTING | BLOCKED_BUT_DRIVEN | ESCALATING
if BLOCKED: blockerCategory (CUSTOMER_SIDE / DEEL_INTERNAL /
            THIRD_PARTY / LEGAL_COMPLIANCE)
ageDays: how long this action has been in its current state
fiveDayBoundaryBreach: boolean, true if past 5d
ownerRole: who's accountable for the next move on this action
trackContext: A | B | mixed (if applicable)
countryContext: country code(s) if applicable
```

The action data record contains the *inputs* for directive generation. The Next Move directive itself (the sentence telling someone what to do) is computed at render time, not stored. This keeps the system honest — the directive can never drift from the action's actual state.

## Pattern-based directive generation

Each combination of (state, blocker category, age) maps to a directive template. Layer 7 specifies the templates. Layer 4's contribution is making sure every action carries enough state for the templates to fire correctly.

The key invariant: every action in the system can produce a directive. There is no action state for which the system has nothing to say. If the system can't generate a directive, the action data record is incomplete — that's a system bug, not a user-facing limitation.

---

## Escalation routing (by trigger and blocker type)

Routes go to *functions*, not function heads. Function-head escalation is reserved for systemic patterns (Layer 3 principle: function heads are destinations for systemic issues, not first-line escalation routes for single-account problems).

```
TRIGGER                                              ROUTES TO
─────────────────────────────────────────────────    ─────────────────────────

Customer-side blocker
  Customer's legal team delaying MSA                 CSM holds + AE engages for
                                                     commercial pressure

  Customer's exec sponsor goes silent                CSM + AE (joint commercial
                                                     pressure on relationship)

Deel-internal blocker
  Legal Ops capacity (single account)                Legal Ops team
                                                     (Layer 3: function-head only
                                                      if pattern across accounts)

  Country payroll setup blocker                      Payroll Implementation
  (e.g., Brazil eSocial sync issue)                  per-country specialist
                                                     (Layer 3: Director of Payroll
                                                      Implementation if systemic)

  Worker contract template gap                       HR Implementation team
                                                     + Legal Ops for review

Third-party blocker
  Banking/payroll partner issue                      Payroll Implementation
                                                     per-country specialist
                                                     drives partner engagement

  Government system / regulatory delay               Compliance team

Legal/compliance blocker
  Ongoing regulatory review                          Compliance team

  Contract drafting / amendment                      Legal Ops team

Cross-functional stuck-state
  Issue spans 2+ functions, no single function       VP Operations (Layer 2
  can own resolution                                 escalation per Layer 3)

Pattern across multiple accounts
  Same blocker recurring across 5+ accounts          COO / Ghostbusters team
                                                     (break-glass, systemic only)
```

Single-account escalations route to functions. Cross-functional stuck-states route to VP Operations. Systemic patterns across accounts route to break-glass.

---

## What this layer produces

Per action, the state machine produces a record:

```
{
  account_id:           string
  action_id:            string
  action_type:          string   (friction_surface | quote_workflow |
                                   escalation | renewal_prep | etc.)
  state:                'ACTING' | 'ESCALATING' | 'BLOCKED_BUT_DRIVEN'
  blocker_category:     'CUSTOMER' | 'DEEL_INTERNAL' | 'THIRD_PARTY' |
                        'LEGAL_COMPLIANCE' | null
  current_owner:        role (Layer 3 vocabulary)
  last_update_at:       timestamp
  hours_in_current_state: number
  visibility_prompt_fired: boolean
  five_day_boundary_breach: boolean
}
```

This per-action record is the input to Layer 5's rendering. Layer 5 reads across all actions for all accounts in the cohort and produces role-shaped views — for CSMs (their accounts), AEs (their commercial decisions), Migration Leads (their cohort), specialists (their queue by function), function leads (load and patterns within their function), and VP Operations (cross-functional stuck-states). The same per-action data is queryable through different lenses depending on who is looking and what they need to do next.

PASSIVE OWNERSHIP does not appear in this output because the timing rules prevent it from being reachable. Any action that would otherwise drift into passivity is forced into ESCALATING by the 48h visibility rule.

---

## What this layer changes about the system

- **Visibility is enforced, not requested.** The 48h rule means every owner answers to the system about whether they're still moving the work. Silence has a concrete consequence (loss of ownership), not a soft one (a flag).

- **Routing failure is named as such.** "Past 5 days = system failure, not task failure" is the load-bearing reframe. It moves the diagnosis from "the owner is at fault" to "the system routed this badly." This is the conceptual move that makes the artifact a Ghostbuster-grade tool rather than a CSM-management tool.

- **Forbidden state is structurally prevented, not policed.** PASSIVE OWNERSHIP is unreachable because every path out of ACTING leads somewhere — escalation, blocked-but-driven, or auto-escalation via visibility breach. The system doesn't need to detect passivity because it can't happen.

- **The state machine is queryable from many angles.** Per-action records are what Layer 5 consumes. Each role in migration work — CSM, AE, Migration Lead, specialist, function lead, VP Operations — sees a different cut of the same data, shaped to the question they need to answer.
