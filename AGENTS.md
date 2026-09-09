# Ascendia Agent Instructions

## Product mission

Ascendia is a South African personal-money operating system. It should help a user plan where money should go, understand what is happening, receive trustworthy guidance, and act on decisions through spending guardrails.

The product is organised around four capabilities:

1. **Plan** — budgets, obligations, goals, envelopes, safe-to-spend.
2. **Understand** — accounts, transactions, merchants, categories, recurring spend, trends and insights.
3. **Advise (Maven)** — contextual recommendations and explanations derived from trusted financial facts.
4. **Control (SpendGate)** — rules, thresholds, nudges, warnings and user-approved spending decisions.

## Engineering principles

- **Spec before implementation.** Material features begin with a specification, implementation plan and task breakdown under `specs/`.
- **One issue, one workspace, one PR.** A delivery issue owns one isolated branch/worktree and converges through one reviewable pull request unless the spec explicitly requires staged PRs.
- **Financial calculations are deterministic.** Balances, totals, allocations, obligations, safe-to-spend, rule states and other financial facts must be computed by deterministic code with tests. AI may interpret trusted facts; it must not invent or silently recalculate them.
- **AI is advisory, not authoritative.** AI output must be traceable to supplied facts, clearly separated from calculated values, and safe to ignore without corrupting financial state.
- **Privacy and security are product requirements.** Never log secrets, banking credentials, access tokens, full account identifiers or unnecessary personal financial data. Prefer redaction and least-privilege boundaries by default.
- **User-controlled actions.** Recommendations must not mutate budgets, goals or SpendGate rules without an explicit user action unless a future spec defines a clearly consented automation.
- **Preserve provenance.** Imported banking records need stable source identifiers and idempotent ingestion so reconciliation and duplicate prevention are possible.
- **Brownfield before rewrite.** Existing Ascendia, SpendGate and related implementations are source material. Reuse working code deliberately; do not rewrite merely to fit a preferred architecture.
- **Small vertical slices.** Prefer end-to-end behaviour that can be demonstrated and tested over broad layers of unfinished infrastructure.
- **South African context matters.** Currency, banking terminology, privacy expectations and integrations should be designed for South African users first while keeping domain boundaries extensible.

## Spec-driven workflow

Before implementing a material issue:

1. Read the linked GitHub issue and relevant product/domain docs.
2. Locate or create the matching `specs/<id>-<slug>/` package.
3. Ensure `spec.md` describes outcomes and acceptance criteria before technical design is chosen.
4. Ensure `plan.md` captures architecture, migration impact, security/privacy impact, data contracts and testing strategy.
5. Ensure `tasks.md` is executable in small, verifiable slices.
6. Implement only tasks belonging to the active spec/workspace.
7. Run the repository's relevant checks and add focused tests for changed financial behaviour.
8. Converge implementation against the spec, plan and tasks before opening or finalising the PR.

## Workspace rules

- Use an isolated Codex/Git worktree for each active delivery issue when practical.
- Branch naming: `spec/<issue-or-spec-id>-<slug>` for product work; `fix/<issue-id>-<slug>` for defects; `chore/<slug>` for non-product maintenance.
- Do not share uncommitted implementation state between workspaces.
- Parallel workspaces must own non-overlapping task sets or explicitly document coordination points.
- The PR must link the issue and spec package and state what was verified.

## Pull request quality bar

A PR for product behaviour should include:

- linked issue and spec;
- completed acceptance criteria;
- tests or verification evidence;
- migration/data impact where applicable;
- security/privacy notes for banking, auth or AI changes;
- screenshots or recordings for meaningful UI changes;
- explicit deferred work rather than hidden TODOs.

## Repository direction

Do not assume the current single Next.js application is the final architecture. The workspace/monorepo shape, service boundaries and migration of SpendGate/Investec Budgeter assets must be decided through specs and ADRs before broad restructuring.
