# UI Design (Visual Layer)

**Layer 6 of the Migration Control System. Defines the visual philosophy, the constraint set, and the key screen specifications. Provides Claude Code (or any builder) with enough discipline to make consistent visual decisions across the build without specifying every component.**

---

## Visual philosophy

The app is **operational software, not a dashboard.** It exists to help someone do their job in the next hour, not to summarize quarterly metrics for an executive. Every visual decision should reinforce *"this is a tool I work with"* rather than *"this is a report I read."*

Three principles:

- **Information density without clutter.** Linear's lesson: dense layouts can feel calm if hierarchy is right. Lots of signal per pixel, almost no decorative chrome. White space is generous but not airy. The viewer should be able to scan a queue of 12 accounts in under 5 seconds and know which one needs them.

- **Restraint with color.** Color is reserved for *state signals*: tier color, health pill, action state badge, urgency. Everything else is grayscale. The result: when something is red, it actually means red. When everything is colored, nothing is.

- **Clarity over cleverness.** Stripe's lesson: typography hierarchy and consistent spacing do more visual work than ornament. Numbers are right-aligned, labels are quiet, primary content is heavy. Readability beats personality.

A small nod to Deel: rounded corners (small radius, not pill-shaped), soft shadows where surfaces stack, friendly type sizes (not aggressively small). The goal isn't to mimic Deel — it's to not look hostile to people who use Deel daily.

What the app should *not* look like:
- A reporting dashboard (no large hero numbers, no bar charts dominating layout)
- A B2C consumer product (no oversized illustrations, no playful copy, no marketing-style hero images)
- An enterprise legacy tool (no busy gradients, no skeuomorphism, no sidebars within sidebars)

---

## The constraint set

### Color system

```
Grayscale (the bulk of the UI):
  bg-canvas       → near-white, slight warmth (#FAFAF9 or similar)
  bg-surface      → white (cards, panes)
  bg-surface-alt  → very light gray for stripe rows (#F5F5F4)
  border-soft     → light gray (#E7E5E4)
  border-default  → medium gray (#D6D3D1)
  text-primary    → near-black (#1C1917)
  text-secondary  → medium gray (#57534E)
  text-tertiary   → light gray (#A8A29E) — labels, metadata

Semantic state colors (used sparingly):
  health-green    → calm green, not bright (#16A34A range)
  health-amber    → warm amber, not yellow (#D97706 range)
  health-red      → red but not aggressive (#DC2626 range)

Tier colors (used as left-edge stripes on cards, not fills):
  tier-senior     → deep blue (#1E40AF)
  tier-churn      → red-orange (#EA580C)
  tier-standard   → soft gray-blue (#64748B)

Flag colors (used as small chips):
  flag-legal      → purple (#7C3AED)
  flag-protected  → soft amber (#CA8A04)

Accent (primary action color):
  accent          → Deel-style blue, calmed (#2563EB or similar)
```

Color rule: **most pixels are grayscale. Color exists to mark state. If a screen has more than ~15% colored pixels, something is wrong.**

### Typography

```
Type stack:
  Primary:    Inter, system-ui, sans-serif
  Mono:       JetBrains Mono, ui-monospace (for clocks, IDs, values)

Type scale:
  text-xs     → 11px — labels, metadata
  text-sm     → 13px — body, table rows
  text-base   → 14px — primary content
  text-md     → 16px — section headings
  text-lg     → 18px — page titles, account names
  text-xl     → 22px — top bar, primary heading

Weight:
  regular     → body
  medium      → labels, secondary emphasis
  semibold    → headings, primary content
  bold        → reserved for true emphasis (rare)

Line-height:
  Tight:      → 1.2 for headings
  Comfortable → 1.5 for body
```

Typography rule: **two weights per screen, three at most.** No italic. No underline (except for links on hover).

### Spacing scale

```
4px base unit. Multiples only.

Common values:
  space-1   → 4px   — internal padding for chips
  space-2   → 8px   — tight spacing within components
  space-3   → 12px  — standard component padding
  space-4   → 16px  — between components
  space-6   → 24px  — between sections
  space-8   → 32px  — between page regions
```

Spacing rule: **dense but not cramped.** A card has 12-16px internal padding, not 24-32px. Linear-density.

### Borders, corners, shadows

```
Corner radius:
  radius-sm   → 4px  — chips, small buttons
  radius-md   → 6px  — cards, panes, modals
  radius-lg   → 8px  — top-level surfaces (rare)

  No pill-shaped (full radius) elements — too consumer-product.

Shadows (used sparingly):
  shadow-soft → very subtle, for floating panels (right pane, modals)
                e.g., 0 1px 3px rgba(0,0,0,0.04)
  shadow-md   → for the auto-promotion banner specifically (the
                load-bearing visual moment), slightly more prominent

  Most surfaces use borders, not shadows.

Borders:
  Default border-default 1px on cards, panes, table rows.
  Inactive borders fade to border-soft.
  Active selection: 2px accent color on left edge of selected card.
```

### Motion

Motion is functional, not decorative. Three approved motions:

- **Pulsing** for ≤3 red queue items: subtle scale + opacity oscillation, 2s cycle. Not aggressive.
- **Auto-promotion banner appearance:** slides in from top of right pane, 200ms ease-out, soft shadow.
- **Queue resort** when state changes (e.g., Northwind flips): cards animate to new positions over 400ms ease-in-out.

No fade-ins on page load, no hover scale effects, no parallax. The app should feel solid, not springy.

---

## Reference points

What the app pulls from, in order of influence:

1. **Linear** (linear.app) — left-rail queue + right-pane detail, color-coded states, minimal chrome, typography hierarchy. The structural reference.
2. **Stripe** (dashboard.stripe.com) — clarity, restraint with color, typography hierarchy, table density. The clarity reference.
3. **Deel** (deel.com product UI) — softness in corners, friendly type sizes. The accessibility reference.

What the app explicitly does *not* pull from:
- Tableau / Looker (too dashboard-shaped, too analytics-coded)
- Salesforce (too busy, too many UI layers)
- Notion (too document-shaped, not operational enough)
- Standard CRM tools (too field-heavy, not state-driven)

---

## Key screen specifications

Three screens specced in detail. The rest of the app inherits from these.

### Screen 1: Migration Lead view (densest, primary demo screen)

**Layout structure:**
- Top bar: app name, role selector, settings/demo controls, ~56px height
- Below top bar: split layout
- Left rail (queue): ~360px wide, scrollable, accounts grouped by tier
- Right pane (detail): flex-grow, scrollable, content for selected account

**Card structure (left rail):**
- Left edge: 4px tier-color stripe (senior=blue, churn=red-orange, standard=gray-blue)
- Health pill (colored dot, 8px) at start of card name line
- Account name in text-base semibold
- Tier label + flag chips (e.g., "Standard · Legal Esc.") in text-xs medium, text-secondary
- Most-pressing-clock in text-xs in mono, accent color when urgent
- Card padding: space-3 (12px)
- Card height: comfortable but compact, ~64-72px
- Selected card: 2px accent border on left edge replaces tier stripe

**Right pane structure:**
- Header band: account name (text-lg semibold), profile context line (track_mix, countries, workers, ARR) in text-sm text-secondary
- Auto-promotion banner: when present, sits directly under header band, soft yellow background, shadow-md, 24px padding
- Three info cards stacked: Health, Active actions, Owners. Each is a bordered card with internal section header
- Cards separated by space-4 (16px)
- Right pane padding: space-6 (24px)

**Sphere — the canonical empty/healthy state:**
- Card shows: green pill, name, tier label, "No active intervention" in text-xs
- Right pane on selection: profile context, then a single calm-toned card stating "*Account in steady state. The system is monitoring; no intervention recommended.*" Plus the health card showing all green. No active actions card if there are no active actions — instead a one-line `No active actions.`

### Screen 2: CSM view (relationship-shaped lens)

Same shell. Differences:

- Queue contents: only this CSM's portfolio
- Queue sort: by health degradation + customer-facing SLA pressure
- Right pane emphasis: health is the largest card (positioned first); active actions becomes secondary; the customer-facing SLA clock surfaces prominently in the header band
- Exec sponsor engagement state called out as a header-line element when amber/red

The CSM doesn't see the full action list — they see the relationship state. Action detail is one click away (link in the action summary), but the default view is relationship-shaped.

### Screen 3: VP Operations view (cross-functional pressure)

Same shell. Differences:

- Queue contents: cross-functional stuck-states + auto-promoted accounts with cross-functional channel active
- Queue sort: by time-in-stuck-state + ARR at risk
- Cards show: account name, ARR, which functions are in conflict ("Legal + Payroll, 4 days"), time-in-stuck-state
- Right pane emphasis: which functions are involved, what each is waiting on, recommended cross-functional move
- Heatmap-style visual showing which functions are most loaded across the cohort (small grid at top of pane)

This is the most "zoomed out" view — fewer accounts visible, more aggregate context.

---

## Critical visual moments

### The auto-promotion banner

Load-bearing moment. When Halfbrick loads pre-promoted, or when Northwind flips live during demo:

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠  Health degraded — auto-promoted to Churn Watch tier          │
│    Originally tiered as: Standard Flow                          │
└─────────────────────────────────────────────────────────────────┘
```

Specs:
- Background: soft yellow (#FEF3C7 or similar)
- Border: 1px solid amber (#D97706 at 30% opacity)
- Border-radius: radius-md (6px)
- Padding: 16px horizontal, 12px vertical
- Icon: ⚠ symbol or equivalent in amber, 16px
- First line: text-sm semibold, text-primary
- Second line: text-xs regular, text-secondary
- Shadow-md when first appearing (to draw the eye on initial render)
- Slides in from top of right pane on live flip (200ms ease-out)
- Persistent — does not auto-dismiss

This is the visual moment Westgarth sees when the demo button is pressed. It has to feel definitive — the system caught it, and is telling you exactly what happened.

### The pulsing red queue items

When ≤3 cards are red:
- Subtle scale animation on the health pill: 1.0 → 1.15 → 1.0, 2-second cycle, ease-in-out
- No card-level pulse (just the pill)
- Pulsing is suggestive, not aggressive — viewer should notice it without being assaulted

When >3 cards are red:
- Pulsing turns off across all cards
- A static badge surfaces above the queue: *"4 accounts at risk"* in red text-xs

### The Northwind live flip

Sequenced animation when demo button pressed:

```
T+0ms      Button pressed, button shows loading state
T+200ms    Northwind's first signal flips (Tickets) green → amber → red
            (with 200ms each transition)
T+800ms    Second signal (Milestone) flips green → amber → red
T+1400ms   Third signal (Stakeholder) flips green → amber → red
T+1600ms   Overall health computes red, banner slides in from top
T+1800ms   Queue resorts — Northwind animates to top of Churn Watch group
T+2200ms   Animation complete, button returns to default state
```

Total ~2.2 seconds. Slow enough that the viewer follows the cause-and-effect; fast enough that it doesn't drag.

### Empty-state for Sphere (the calm message)

When a healthy account is selected:

```
┌─ Account in steady state ──────────────────────────────────────┐
│                                                                │
│ The system is monitoring this account. No intervention is      │
│ recommended at this time.                                      │
│                                                                │
│ Tenure: 28 months · No active friction surfaces · Track A      │
│ dominant · Last health check: 2 hours ago                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

Specs:
- Calm tone — no warning chrome, no green checkmark celebration
- Background: bg-surface (white)
- Border: 1px border-soft
- Padding: 24px
- Body: text-sm text-primary
- Metadata: text-xs text-tertiary

This card replaces the "Active actions" card for healthy accounts. Health card stays, showing all green.

---

## What this layer changes about the system

- **Visual restraint as design discipline.** Most operational software fails by adding ornament. This layer locks the constraint: grayscale + state colors only, two type weights, dense but not cramped. Constraint is the design.

- **The auto-promotion banner is treated as the load-bearing moment.** It gets shadow-md (more prominence), it slides in, it persists. Everything else is allowed to be quiet because this one moment carries the demonstration.

- **Empty states are first-class.** Sphere isn't decorated; it's calmly stated. The system proves it's watching by showing the watching state explicitly. This is rare in operational software and should be visible as a design choice.

- **Motion is functional.** Only three motion patterns approved: pulsing on red, banner slide-in, queue resort. Everything else is solid. The app feels stable, not springy.

---

## What's deliberately not specified

- Component-level details (button states, hover treatments, focus rings) — Claude Code applies the constraint set to make these consistent
- Mobile responsiveness — out of scope for the demo (Westgarth views on desktop/laptop)
- Accessibility deep specs (ARIA, keyboard nav) — Claude Code should default to standard practice, not specced here
- Brand identity (logo, app name styling) — Claude Code can produce a simple wordmark; not the focus
- Onboarding/help UI — not present in the demo, no need to design

These are deliberate omissions. Constraining what's specified makes Layer 6 short enough to be a real design constraint, not a 30-page document.
