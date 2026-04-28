# Demo Build Spec (App State Layer)

**Layer 5b of the Migration Control System. Specifies what state the app loads in, how the Northwind demo button behaves, how the reset button works, how time is mocked, and the coherence requirements that allow the demo to be a click-around experience rather than a recorded-only walkthrough.**

---

## Coherence requirement

The app must be coherent everywhere a viewer might click — not just along the demo path. The viewer gets the live link alongside the Loom and is expected to explore. This raises the design bar:

- **Every queue must have content for every role.** No empty Specialist queue, no empty Function Lead view. If we can't populate a role's queue meaningfully from the 12-account cohort, the role view either doesn't ship or shows a clearly-labeled empty state.
- **Every customer must produce a sensible right pane.** All 12 accounts have full state — health signals, owners, active actions (or explicit no-actions), profile context. Clicking Sphere doesn't break; it shows the calm "in steady state" message specified in Layer 6.
- **Every role switch must work.** Switching from Migration Lead to AE doesn't crash, doesn't show stale data, doesn't fail to filter the queue.
- **The demo button works regardless of which role is currently active.** Clicking "Simulate Northwind degradation" while viewing as CSM (where Northwind isn't visible) still triggers the flip — the viewer just won't see it on the current screen unless they switch roles.
- **Reset returns the app to a known-good initial state**, regardless of how the user has interacted with it.

This is the operational standard. The Loom can stage things; the live link must hold up.

---

## Initial load state

When the app first loads (or after Reset), the app is in this exact state. All times are computed relative to "now" so the app feels live whenever opened.

### Time mocking strategy

The app does not use absolute timestamps for state. Instead, every time-relative field is computed at load from offsets:

```
Reference time:       t = current_datetime() at load
Halfbrick promotion:  t - 14 days  ("Day 14 ago")
Meridian quote SLA:   issued = t - 6 days, deadline = t + 1 day
Northwind quote SLA:  issued = t - 14 days, accepted = t - 7 days
Action ages:          relative to t (e.g., BR eSocial blocked for 5 days = t - 5d)
Last health check:    t - 2 hours (for healthy accounts)
Renewal dates:        absolute dates from Layer 1, displayed as "in N months"
```

This means the app feels live on Tuesday in April or six months later in October. The demo doesn't go stale.

### Per-customer initial state

The 12 customers load with state derived from Layers 1-4. Layer 5c (next) produces the full per-account derivation. For Layer 5b's purposes, the load-state highlights are:

**Halfbrick — pre-baked Day-14 auto-promotion**
- Tier visible as: Standard → Churn Watch (auto-promoted)
- Auto-promotion banner visible in right pane
- Health signals: Resp amber, Tickets red, Milestone red, Stakeholder green → overall red
- Three active friction surface actions in BLOCKED BUT DRIVEN or ESCALATING states
- Position in queue: top of Churn Watch group
- Owner upgrade visible: Named CSM, Named AE, Named HR IM (per Layer 3 tier transition rule)
- Cross-functional escalation channel: active

**Meridian — Senior Migration centerpiece**
- Tier: Senior Migration
- Health: amber overall (one milestone slipping but not auto-promoted)
- Most-pressing-clock visible: a friction surface action 3 days into BLOCKED BUT DRIVEN
- Three friction surfaces active
- Track A-dominant note visible in profile context
- Position in queue: high in Senior Migration group due to amber health + ARR

**Northwind — Track B live-fire subject (pre-flip)**
- Tier: Senior Migration
- Health: all green
- Quote state: accepted
- CSM: deel_assigned
- Mixed-track context visible in profile (DK/NO Track B portion noted)
- Position in queue: bottom of Senior Migration group (calm)
- The demo button targets this account specifically

**Sphere — canonical empty/healthy state**
- Tier: Standard
- Health: all green
- No active friction surfaces
- omnipresent_only CSM (handover not started — normal for accounts not yet in active migration)
- Right pane on selection shows the calm "in steady state" message per Layer 6
- Position in queue: bottom of Standard group (or in the "healthy" section if grouping is shown)

**The other 8 customers** load with state per Layer 5c. They populate the queue meaningfully across all role views.

### Initial role on load

The app loads with **Migration Lead** as the default selected role. Reasoning: Migration Lead is the densest, most-action-rich view — it shows the system at its most operational on first impression. CSM and other views are accessible via the role selector.

### Initial selected account

On first load, the app pre-selects **Halfbrick**. Reasoning: the auto-promotion banner is the load-bearing initial visual. A viewer who lands cold should see the banner immediately as evidence that something has just happened in the system.

After role-switching, the right pane behavior follows Layer 5a: stay on currently-selected account if it's visible in the new role's queue; otherwise deselect and show empty-state.

---

## The Northwind demo button

### Button placement and labeling

- Top bar, right side, next to the role selector
- Label: **"Simulate Northwind degradation"**
- Style: secondary button (outlined, accent color), distinguishable from primary CTAs but visible
- Visible across all role views (so the demo can be triggered from any view)
- Disabled state after click until reset (prevents re-triggering and confusion)

### Button behavior on click

Sequenced animation per Layer 6's spec — the timeline:

```
T+0ms      Button clicked, transitions to disabled/loading state
T+200ms    Northwind's Tickets signal flips: green → amber → red
            (200ms transition each, so amber at T+200ms, red at T+400ms)
T+800ms    Milestone signal flips: green → amber → red
            (amber at T+800ms, red at T+1000ms)
T+1400ms   Stakeholder signal flips: green → amber → red
            (amber at T+1400ms, red at T+1600ms)
T+1600ms   Overall health computes red. Auto-promotion rule fires.
            Auto-promotion banner slides into right pane (200ms ease-out).
T+1800ms   Queue resorts: Northwind animates from Senior Migration position
            to top of Churn Watch group (400ms ease-in-out).
T+2200ms   Animation complete. Northwind is in Churn Watch.
            Button now reads "Reset demo" or remains disabled.
```

**Total: ~2.2 seconds.** Slow enough to follow cause-and-effect; fast enough to not drag.

### What changes in Northwind's state after the flip

- Tier: Senior Migration → Churn Watch (auto-promoted)
- Health overall: green → red
- Health signals: green/green/green/green → green/red/red/red (Responsiveness stays green; the other three flip)
- Disposition recommendation: re-evaluation flagged (per Layer 3 tier transition trigger)
- Owners: ownership upgrade event triggers (Pooled → Named for Standard accounts; Northwind was already Senior Migration with Named owners, so the change is only the Churn Watch retention specialist pairing per Layer 3)
- Cross-functional escalation channel: activates (per Layer 3 tier transition trigger)
- New active actions appear in Northwind's right pane reflecting the Track B portion failure: DK/NO worker tickets surge, partner-side milestone slip
- Auto-promotion banner appears with text: *"Health degraded — auto-promoted to Churn Watch tier. Originally tiered as: Senior Migration."*

### Visibility constraint

The button triggers the flip regardless of which role is currently active. If the viewer is on the CSM view (where Northwind may not be visible) when they click, the flip happens in the underlying data, the queue updates if Northwind belongs to that CSM's portfolio, and the button updates to its post-flip state. Switching to Migration Lead or VP Operations after the flip shows Northwind in its post-flip state.

If the viewer is on Migration Lead view when they click, they see the full sequenced animation as specified above.

---

## The reset button

### Placement and labeling

- Top bar, right side, near the demo button (small, secondary)
- Label: **"Reset demo"**
- Visible at all times (not just after the demo button has fired)
- Subtle styling (text-button or ghost-button, not heavy)

### Behavior on click

A confirm prompt appears: *"Reset demo to initial state? Any unsaved changes will be lost."*

If confirmed:
- All state returns to the initial load state defined above
- Time mocking re-anchors to current "now"
- Selected role returns to Migration Lead
- Selected account returns to Halfbrick
- Demo button returns to enabled state
- Any other transient state (e.g., scroll position, tooltip state) clears

The reset is functionally equivalent to a hard refresh, but doesn't actually reload the page. Critical for re-recording the Loom: you can flip Northwind, narrate the moment, then reset and re-record the take without any session breakage.

---

## Role-switching behavior

When the role selector changes:

- Queue contents update to the new role's filter
- Queue re-sorts by the new role's urgency definition
- Right pane: if currently-selected account is still visible in the new queue, stay on it; if not, deselect and show role-default empty state
- No animation or transition — hard cut keeps the viewer focused on what's on screen, not on motion
- Loading state: under 100ms — should feel instant

The role selector itself is a simple dropdown: **"Viewing as: [Role Name] ▼"**. Click to expand, options listed: Migration Lead, CSM, AE, Specialist, Function Lead, VP Operations. (Ghostbuster view is included if Layer 5c has data for it; otherwise omitted.)

---

## What the app does NOT do

Explicit non-features for the demo build:

- **No auth.** The role selector is the auth substitute. Anyone with the URL can switch roles.
- **No persistence.** State exists only in memory. Closing the tab loses any user-driven changes (which is fine — there are no user-driven changes worth preserving in a demo).
- **No backend.** All data is client-side (a static data file or in-memory state).
- **No real-time updates.** The clocks are computed from offsets at load; they don't tick. If a viewer leaves the app open for an hour, action ages don't grow. This is acceptable for a demo.
- **No notifications.** Toast messages, badges, alerts — none. The app's communication is the queue and the right pane.
- **No mobile responsive layout.** Desktop-only.
- **No editing.** The viewer can't change health states, can't reassign owners, can't resolve actions. The system is read-only except for the demo button and reset.

---

## Coherence checklist (verify before deploy)

Before pushing the live link to anyone, verify these manually:

- [ ] All 6 role views load without crashing
- [ ] Switching between any two roles works in either direction
- [ ] All 12 accounts produce a coherent right pane in the Migration Lead view
- [ ] Sphere's empty-state message displays correctly when selected
- [ ] Halfbrick's auto-promotion banner is visible on initial load
- [ ] The Northwind demo button fires the full sequence to completion
- [ ] After Northwind flip, Northwind appears in Churn Watch group
- [ ] Reset button returns the app to initial state cleanly
- [ ] No console errors in browser dev tools at any state
- [ ] The most-pressing-clock on Meridian's card updates correctly relative to "now"
- [ ] Tooltips appear and contain the correct notes from Layer 2

This is the manual verification before the link goes out. There is no formal test suite for a demo artifact — the checklist is the test.

---

## What this layer changes about the system

- **The app is a click-around artifact, not a Loom-only recording.** This raises the design bar — every state must be coherent everywhere — but it also raises the demonstration value. The viewer doesn't just watch; they use.

- **Time is mocked relative to "now."** This makes the artifact ageless — it doesn't go stale tomorrow or in six months. Whoever opens it sees a "live" system whenever they look.

- **The reset button is a first-class feature.** A demo without easy reset is single-use; a demo with reset is rehearsable, recordable, and replayable. Treat it as load-bearing infrastructure, not as polish.

- **The button labeling is explicit.** "Simulate Northwind degradation" tells the viewer exactly what's happening. This is a demo, not a fake live system. Hiding the button or labeling it ambiguously would be dishonest about what the artifact is.
