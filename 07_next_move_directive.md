# Next Move Directive System (Actionability Layer)

**Layer 7 of the Migration Control System. Converts state into directive. For every account, the system generates a single sentence answering: "What is the next move on this account, by when, by whom?"**

---

## The principle

A dashboard shows state. An operating system tells you what to do.

The Next Move directive is the system's actionability commitment. Every account, every state, produces a clear directive:
- What action is needed
- Who owns it
- By when

If the system can't generate a clear directive, that's itself a signal — the account is in a state the system doesn't have a pattern for, and the CSM needs to design the next move themselves.

## How directives are generated

Per-account directive logic, in order:

1. **Healthy + no actions:** "No action required. Re-check at next scheduled health review."

2. **Auto-promoted (recent):** Surface the auto-promotion as the operational frame. Directive concerns the retention play.

3. **Cross-functional escalation past 7 days:** Surface Ghostbuster intervention as the directive.

4. **Active actions exist:** Find the most pressing action (by urgency: fiveDayBoundaryBreach > BLOCKED_BUT_DRIVEN > ESCALATING > ACTING > age tiebreak). Apply the action-specific directive template.

5. **Track B quote SLA in 7-day window:** If less than 3 days remain, the directive concerns the commercial decision.

6. **Customer-facing SLA active and breaching 50%:** The directive concerns the customer response.

## Directive templates

### Healthy state
"No action required. Re-check at next scheduled health review."

### Auto-promoted (within last 30 days)
"Account auto-promoted {N} days ago. Retention play active.
CSM driving exec sponsor engagement and unblocking compounding actions.
Cross-functional channel {active|standby}."

### Active action — ACTING state
"Continue execution on {actionDescription}.
{ownerRole} drives to completion by {nextMoveBy}."

### Blocked customer-side (< 3 days)
"Drive customer-side response on {actionDescription} by {nextMoveBy}.
{ownerRole} owns. CSM coordinates."

### Blocked customer-side (3-5 days)
"Customer-side blocker {N} days old on {actionDescription}.
Escalate to customer exec sponsor by {nextMoveBy} if {ownerRole} cannot unstick."

### Blocked customer-side (5+ days, past boundary)
"Customer-side blocker past 5-day boundary on {actionDescription}.
Engage customer exec sponsor today. CSM Manager engagement required
if no resolution by EOD."

### Blocked Deel-internal
"Deel-internal blocker on {actionDescription}.
{ownerRole} drives resolution. CSM escalates to function head by
{nextMoveBy} if not resolved."

### Blocked third-party
"Third-party blocker on {actionDescription}.
{ownerRole} drives partner coordination.
Status update to CSM by {nextMoveBy}."

### Blocked legal/compliance
"Legal/compliance review pending on {actionDescription}.
{ownerRole} drives to position.
CSM informs customer of expected timeline by {nextMoveBy}."

### Escalating (< 5 days)
"{ownerRole} actively driving cross-functional resolution on {actionDescription}.
Status update to CSM by {nextMoveBy}."

### Escalating (5-7 days)
"Escalation aging — {N} days in cross-functional channel on {actionDescription}.
Head of CS engagement recommended by {nextMoveBy}."

### Escalating (7+ days, past Ghostbuster threshold)
"Escalation past 7-day boundary on {actionDescription}.
Ghostbuster intervention recommended. COO awareness required."

### Track B quote in 7-day window (< 3 days remaining)
"Track B re-quote pending customer response on {affectedCountries}.
{N} days remaining on 7-day window. AE prepares fall-through plan
by EOD if no response within 48h."

### Customer-facing SLA breaching 50% of window
"Customer-facing SLA active ({N} hours into {responseWindowHours}h window).
CSM drives response by EOD."

## Routing state — what each routed relationship is waiting on

Each routing relationship (CSM routes to AE, Payroll IM, Compliance, etc.) has its own micro-state that the system surfaces:

Routing state record:

```
role: "AE" | "Payroll IM (BR)" | "Compliance" | etc.
reason: what this party is engaged for
waiting_on: "customer" | "deel-internal" | "third-party" | null
waiting_since_days: how long the current wait has been
last_action: brief description of the most recent move
next_action_owner: who's expected to move next
```

The CSM's morning brief surfaces this state for each routed relationship. Not just "Payroll IM (BR) is engaged" — but "Payroll IM (BR) is waiting on customer for 3 days; last action: ping sent Tuesday; next action: customer exec sponsor engagement."

This makes the directive concrete. The CSM knows not just *what to do globally* but *where each thread is stuck and who needs to move it forward*.

## Timeframe ("nextMoveBy") values

The system uses a small vocabulary of timeframes for clarity:

```
"EOD today"        — same business day
"EOD tomorrow"     — next business day
"within 48h"       — two business days
"by [day name]"    — within current week
"this week"        — within current week, no specific day
"by [date]"        — specific date for longer-horizon items
```

These are friendly, operationally meaningful, and can be computed from the action's age and the standard timing rules in Layer 4.

## What this layer changes about the system

- **The system stops being a dashboard.** Reading the screen tells you state. Reading the directive tells you action.

- **Accountability is unambiguous.** Every directive names an owner. The owner is always the CSM unless routing has explicitly transferred next-move responsibility (e.g., AE for commercial decisions, Payroll IM for partner-side coordination).

- **The Ghostbuster role becomes visible.** The directive system makes break-glass escalation an explicit category, not an afterthought. Westgarth's team appears in the directive when the system has structurally failed.

- **The "no action" directive is a real directive.** Sphere isn't ignored. It's actively recommended for non-action. This is the empty-state-as-content principle, made directive.

- **Directives are generated, not stored.** The next move is computed at render time from state. This means the directive can't drift from the underlying state. If the state changes, the directive changes immediately and consistently.
