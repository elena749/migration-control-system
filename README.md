# Migration Control System

Built against the Omnipresent → Deel acquisition as a live test case.
Designed to be the operating layer for any future post-acquisition migration.

## Layer reference

01_customer_dataset.md       — Customer profiles and migration state, 12 accounts
02_tiering_and_health.md     — Static tier assignment + dynamic health system
03_owner_assignment.md       — Routing rules: who owns each account, how escalation flows
04_clock_state.md            — Action state machine and internal timing rules
05a_role_views.md            — View design across six migration-work roles
05b_demo_flow.md             — Narrative arc through the artifact (forthcoming)
05c_per_account_data.md      — Concrete per-account derivation (forthcoming)

## How to read

Start with whichever layer matches your question. Each layer is self-contained
with bridges to neighboring layers where relevant. Read 01-04 in order to
understand the operating model; read 05a-c in order to understand how it
becomes a usable interface.
