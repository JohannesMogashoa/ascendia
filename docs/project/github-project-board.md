# Ascendia GitHub Project Board

## Project

**Name:** Ascendia — Personal Money OS

**Purpose:** one portfolio-level execution board for the unified Ascendia programme. The board tracks outcomes and delivery across product domains; repository issues/specs remain the executable unit of work.

## Recommended views

### 1. Delivery Board

Board grouped by **Status**.

Use for daily execution and work-in-progress control.

### 2. Product Roadmap

Board or table grouped by **Product Area**, ordered by **Phase** and **Priority**.

Use to ensure Plan, Understand, Maven and SpendGate evolve as one product rather than independent feature piles.

### 3. Spec Pipeline

Table filtered to Type = Feature / Enabler / Research and not Released, showing **Spec Status**, **Workspace**, **Size**, **Priority** and **Release**.

Use to see where work is stuck between idea and implementation.

### 4. Current Release

Table filtered to the active **Release** value and non-Parked items.

### 5. Decisions & Research

Table filtered to Type = Decision / Research.

## Fields

### Status

- Inbox
- Discovery
- Specifying
- Planned
- Ready
- In Progress
- Blocked
- Review
- Released
- Parked

### Product Area

- Core Money
- Banking
- Plan
- Understand
- Maven
- SpendGate
- Experience
- Platform

### Type

- Epic
- Feature
- Enabler
- Research
- Decision
- Bug
- Polish
- Documentation

### Phase

- R0 Programme Foundation
- R1 Connected Money
- R2 Plan
- R3 Understand
- R4 Maven
- R5 SpendGate
- R6 Learn
- Later

### Spec Status

- Not Required
- Needed
- Draft
- Clarifying
- Approved
- Implementing
- Converging
- Complete

### Workspace

- None
- Local
- Codex Worktree
- Manual Worktree
- Cloud

### Priority

- P0
- P1
- P2
- P3

### Size

- XS
- S
- M
- L
- XL

### Release

Use release names/milestones as the programme develops, starting with `R0 Foundation`.

## WIP rules

- Maximum **2 implementation workspaces** in progress at once for a solo developer unless one is purely automated verification/research.
- Only one P0 product feature should be the primary evening objective at a time.
- `Ready` means the spec/plan/task package is sufficient to start without rediscovering requirements.
- `Review` means implementation is complete and convergence/PR review is the remaining work.
- `Released` means available in the intended environment and verified; merge alone is not release.

## Issue conventions

Use concise prefixes while the programme is forming:

```text
[EPIC] Core Money Platform
[FOUNDATION] Inventory reusable finance assets
[SPEC] Connected Money ingestion
[DECISION] Canonical workspace architecture
[BUG] Duplicate transaction reconciliation
```

Each material feature issue should include:

- Problem
- Desired outcome
- Product area
- Acceptance evidence
- Out of scope
- Dependencies
- Spec path (once created)

## Relationship to specs

The GitHub Project is the portfolio/execution view. It should not duplicate the detailed requirements in `specs/`.

Use this hierarchy:

```text
GitHub Project item
  └── GitHub issue (delivery intent/status)
      └── specs/<id>-<slug>/ (durable specification/plan/tasks)
          └── branch/worktree (isolated implementation)
              └── pull request (review + convergence evidence)
```

## Automation ideas

Configure GitHub Project workflows where available so that:

- newly added programme issues enter `Inbox`;
- an opened PR linked to an issue moves the item toward `Review`;
- merged PRs do not automatically imply `Released` unless the deployment/release criterion is also satisfied;
- closed-as-not-planned items move to `Parked` rather than appearing delivered.

The board should optimise flow and visibility; it should not become a second requirements database.
