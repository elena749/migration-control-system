# Role-Shaped Views (Rendering Layer — View Design)

**Layer 5a of the Migration Control System. Defines the shell, the role-specific content cuts, and the design rules that make the multi-role view system work. Layer 5b designs the demo flow on top; Layer 5c produces the per-account derivation that fills the views with data.**

---

## The shell

One UI pattern, used across all roles. The shell is constant; the content varies.

```
┌─────────────────────────────────────────────────────────────────┐
│  [Top bar: Migration Control System]   Viewing as: [role ▼]    │
├──────────────────────────┬──────────────────────────────────────┤
│                          │                                      │
│  LEFT RAIL (queue)       │  RIGHT PANE (detail)                 │
│  ─────────────────       │  ──────────────────                  │
│                          │                                      │
│  Sorted by               │  Content for the                     │
│  attention-needed,       │  selected queue item                 │
│  descending              │                                      │
│                          │  Three info layers:                  │
│  Cards show:             │  • Health (Layer 2)                  │
│  • tier color stripe     │  • Active actions (Layer 4)          │
│  • customer name         │  • Owners + specialists (Layer 3)    │
│  • health pill           │                                      │
│  • most-urgent clock     │  Customer profile context            │
│                          │  always visible at top               │
│                          │                                      │
└──────────────────────────┴──────────────────────────────────────┘
```

**Top bar role selector** — for demo purposes, a simple dropdown lets the viewer switch between roles. Real production would use auth; demo uses an explicit selector so a viewer can see the same data through different lenses by clicking once. The selector states the current role explicitly: *"Viewing as: Migration Lead"*.

**Left rail (queue)** — list of accounts visible to the current role, filtered and sorted by role-specific logic (next section). Cards are uniform in structure; what populates them is consistent across roles.

**Right pane (detail)** — when a queue item is selected, the right pane renders the detail. The detail has three primary information layers (health, actions, owners) and customer profile context. Some layers may be more prominent depending on role.

---

## What each role sees, and the question their view answers

The morning-standup question for each role is the design anchor. The view is shaped to answer that question fastest.

### CSM view

*Question: "Which of my customers needs my attention today?"*

```
Queue contents:    Customers in this CSM's portfolio (Named) or queue (Pooled)
Queue sort:        By health degradation + customer-facing SLA pressure
Right pane focus:  Health signals prominent; customer-facing SLA clock surfaced;
                   exec sponsor engagement state featured

Surfacing logic:
  - Red health customers float to top
  - Customer-facing SLA approaching 24h limit (Churn Watch tier) flagged
  - Auto-promoted customers labeled "Just promoted to Churn Watch"
  - Stable green customers shown at bottom, not hidden
```

The CSM doesn't primarily need action-state visibility — that's the Migration Lead's concern. The CSM needs *relationship* visibility: who's silent, who's degrading, who needs a call.

### AE view

*Question: "Which commercial decisions are mine to make right now?"*

```
Queue contents:    Customers in this AE's region (Pooled) or named portfolio
Queue sort:        By disposition decision urgency + Track B SLA pressure
Right pane focus:  Disposition recommendation prominent; repricing position
                   (current / list / Deel-equivalent rate) visible;
                   bundle-upgrade path surfaced if applicable

Surfacing logic:
  - Accounts with Track B worker quote-acceptance windows approaching float to top
  - Auto-promoted accounts where disposition needs re-evaluation flagged
  - Renewal prep window (90d ahead) for Track A surfaces with countdown
  - Hold-disposition accounts (Contract-Protected flag) shown but de-emphasized
```

The AE needs commercial-decision visibility, not relationship state. The repricing position with its three-number anchor is the central artifact in the right pane.

### Migration Lead view

*Question: "Which actions in my cohort are stuck and what's blocking them?"*

```
Queue contents:    All accounts in this Migration Lead's cohort assignment
Queue sort:        By count and severity of BLOCKED BUT DRIVEN actions, then
                   by 5-day boundary breach proximity
Right pane focus:  Active actions list prominent (with state badges, age,
                   blocker category); friction surface registry visible;
                   specialist engagement state surfaced

Surfacing logic:
  - Accounts with actions past 5-day boundary float to top, flagged red
  - Actions in BLOCKED BUT DRIVEN > 3 days surfaced with blocker category
  - Actions in ESCALATING shown with destination and time-in-state
  - Accounts where specialists are not yet engaged but flag triggers exist:
    flagged as "specialist engagement pending"
```

This is the most action-dense view because the Migration Lead is the operational throat-to-choke. They need the most granular state visibility of any customer-facing role.

### Specialist view (Payroll Implementation per-country, Legal Ops, Compliance, etc.)

*Question: "What's in my queue, oldest first?"*

```
Queue contents:    Actions across all accounts assigned to this specialist's
                   function or country specialty
Queue sort:        By age of action + 5-day boundary proximity
Right pane focus:  Action detail (what's needed, what's blocked, who's the
                   account-side owner pinging me); related friction surface
                   context

Surfacing logic:
  - Action-centric, not account-centric (specialist sees actions, not customers)
  - 5-day boundary breach is the dominant urgency signal
  - Cross-account pattern indicators if the same blocker appears in 3+ actions
  - Brief account context (tier, ARR) for each action so specialist can prioritize
```

The specialist is the only role whose queue is action-shaped rather than account-shaped. They're not relationship owners; they're queue workers. The view reflects this.

### Function lead view (Director of Payroll Implementation, etc.)

*Question: "Where is my function under load and where are systemic patterns?"*

```
Queue contents:    Aggregate state across the function's actions
Queue sort:        By load (count of active actions per specialist) and by
                   pattern emergence (same blocker across ≥3 actions)
Right pane focus:  Capacity heatmap (which specialists are saturated); pattern
                   detection (recurring blockers); systemic escalation candidates

Surfacing logic:
  - This is the only view where the queue is not customers or actions but
    *people in the function* (specialists), with their load
  - Pattern indicators surface when same blocker recurs across accounts —
    this is the signal that triggers function-head-level intervention
  - Systemic patterns (5+ accounts, same blocker) flagged as
    "candidate for break-glass escalation"
```

This view is structurally different from the others. It's not "customer-shaped" or "action-shaped" — it's "function-shaped," looking at the function's own state. Function leads aren't running individual cases; they're running their team.

### VP Operations view

*Question: "Which stuck-states span functions and need cross-functional unsticking?"*

```
Queue contents:    Cross-functional stuck-state actions (Layer 4 routing
                   level 2) + auto-promoted Churn Watch accounts where
                   cross-functional channel has activated
Queue sort:        By time-in-stuck-state + ARR at risk
Right pane focus:  Which functions are in conflict; what each function is
                   waiting on; recommended cross-functional move

Surfacing logic:
  - Only stuck-states that have routed to VP Operations show here
  - Single-function escalations are filtered out (those are function-lead
    territory)
  - Auto-promotion events with cross-functional channel activation listed
  - Pattern indicators: if 3+ accounts have the same cross-functional
    stuck-state, surface as systemic
```

VP Operations is the second-highest level of escalation in Layer 3. Their view filters out everything that doesn't need them.

### Ghostbuster view (referenced, not centerpiece)

*Question: "Where has every other layer failed and what needs intervention?"*

The Ghostbuster view exists for completeness but is not a primary daily-use view. It surfaces only:
- Actions in 5-day boundary breach where escalation has not resolved
- Cross-functional stuck-states that have aged past 7 days
- Systemic patterns (5+ account recurrence) that no function lead has owned

This view is reactive, not primary. It's the break-glass surface — what shows up when the rest of the system has structurally failed for some specific issue. Not designed for morning use; designed for the "something has gone deeply wrong" moment.

---

## Design rules across all views

### Sorting rule (constant across roles)

The queue is *always sorted by attention-needed, descending*. Whatever urgency means for that role (health degradation, SLA pressure, action age, function load), it determines sort order. Nothing else competes — no alphabetical, no recency, no manual ordering.

### Pulsing rule

Red items in the queue pulse subtly to draw attention — but only when count of pulsing items is ≤ 3. Above that threshold, pulsing turns off and a static badge surfaces the count: *"4 accounts at risk"* with the pulsing-off behavior preserving signal value (when there are too many fires, pulsing all of them is noise).

### Auto-promotion banner

When an account auto-promotes (Standard → Churn Watch via Layer 2's 2+ red rule), a yellow warning banner appears in the right pane:

> *"Health degraded — auto-promoted to Churn Watch tier. Originally tiered as: Standard Flow."*

The "Originally tiered as" annotation preserves the history without implying the promotion is reversible. The rule fired; the system records why.

### Empty / "do nothing" states

Healthy accounts (Sphere as canonical example) appear in the queue at the bottom — not hidden, not collapsed, not visually buried. They show as: green health pill, no urgency badge, no flags. The queue communicates *"this is fine, nothing needed today"* by showing the account in a low-emphasis row, not by removing it.

This is a deliberate design choice. A healthy account that disappears from the queue creates the illusion that the system isn't watching it. Showing it at the bottom proves the system is aware and has affirmatively decided no intervention is needed.

The right pane for a healthy account explicitly states this: *"No active intervention recommended. Account in steady state."* The system makes its non-action visible.

### Tooltips

Every signal pill, state badge, and clock value supports tooltip-on-hover with the underlying detail. Health signal tooltips show the notes from Layer 2 (e.g., *"Brazil eSocial sync running 3 days behind schedule. Local payroll partner engaged."*). Action state tooltips show the blocker category, current owner, and time-in-state. Tooltips are progressive disclosure — they prevent the main view from getting cluttered while keeping the detail one hover away.

### Two demonstrations of the auto-promotion mechanic

The demo includes two parallel demonstrations of dynamic tier reassignment:

**Halfbrick (pre-baked, historical):** Loads with the demo, already auto-promoted on Day 14. Shown in the Migration Lead view's queue with the auto-promotion banner visible in the right pane. Demonstrates that the system has already caught drift in a Standard account in the recent past.

**Northwind (live-fire, button-triggered):** A demo button in the top bar — *"Simulate health degradation: Northwind"* — flips Northwind's signals to 2+ red on click. The auto-promotion fires in real time during the demo. Demonstrates the system catching a Senior Migration account drifting *now*, with the banner appearing during the Loom recording.

Two scenarios, two stories: historical proof + live demonstration.

---

## What this layer produces

A view-rendering specification that answers, for each role:

- What goes in the queue (filter)
- How it sorts (urgency definition)
- What the right pane emphasizes (information hierarchy)
- What the morning-standup question is (the design anchor for any future change)

Layer 5b uses this to design the demo flow — which views become the centerpiece, what path through them tells the story in 90 seconds. Layer 5c uses this plus Layers 1-4 to derive the actual per-account data that fills these views.

---

## What this layer changes about the system

- **Same shell, different content cuts.** One UI pattern, six role-specific content rules. Vastly cheaper to build than six separate UIs, and it demonstrates that the underlying data model is sound — the same Layer 1-4 data feeds all six views.

- **The morning-standup question is the design anchor.** Each role's view is shaped to answer one question fastest. If a future change to the view doesn't help that question, it doesn't belong. This is the discipline that prevents view bloat over time.

- **Empty/healthy states are visible, not hidden.** The system proves it's watching healthy accounts by showing them — not by suppressing them. This is a small design choice with a load-bearing trust effect.

- **Sorting is non-negotiable.** Every queue is sorted by attention-needed, descending. This eliminates the most common operational dashboard failure mode (stale alphabetical or recency-based sorts that bury urgency).
