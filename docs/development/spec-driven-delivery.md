# Spec-Driven Delivery

## Why this process exists

Ascendia combines banking integration, financial calculations, AI interpretation and programmable spending behaviour. Those concerns are easy to blur when implementation starts from ad-hoc prompts. The delivery process therefore makes intent and acceptance criteria durable before code is changed.

GitHub issues track delivery intent and status. Spec Kit artifacts define the feature contract. Git branches/worktrees isolate implementation. Pull requests provide convergence evidence.

## Tooling direction

Use GitHub Spec Kit as the default SDD harness and Codex as the primary coding-agent integration.

For an existing checkout, bootstrap on a dedicated setup branch/worktree rather than directly on the default branch:

```bash
uv tool install specify-cli
specify version
specify init --here --force --integration codex
specify extension add git
```

Review all generated changes before merging. The repository already contains application code, so treat initialization as brownfield adoption rather than greenfield generation.

## Delivery unit

The normal delivery unit is:

`GitHub issue → spec package → isolated workspace → implementation → convergence → PR → merge`

A material feature should have a stable spec folder:

```text
specs/
  001-connected-money/
    spec.md
    plan.md
    tasks.md
    research.md          # optional
    data-model.md        # optional
    contracts/           # optional API/event contracts
    checklists/          # optional quality gates
```

Do not use the spec folder merely as generated documentation. It is the contract the implementation must satisfy.

## Lifecycle

### 1. Intake

A GitHub issue captures the problem, desired outcome and product area. It should avoid premature implementation detail unless a constraint is already decided.

Board status: **Inbox** or **Discovery**.

### 2. Specify

Run the Spec Kit specify workflow to create/refine `spec.md`.

The spec should answer:

- who has the problem;
- what behaviour/outcome is required;
- user journeys and edge cases;
- acceptance criteria;
- what is explicitly out of scope;
- privacy/security expectations;
- financial correctness expectations;
- what evidence proves completion.

Board status: **Specifying**.

### 3. Clarify / assess

Use clarification/assessment when requirements are ambiguous, consequential or likely to produce architecture churn. Banking, auth, financial rules and AI behaviour should default toward clarification rather than assumptions.

### 4. Plan

Create `plan.md` only after the specification is stable enough to design against.

The plan should include:

- impacted applications/packages/services;
- domain model changes;
- API/event/data contracts;
- data migration and backward compatibility;
- security/privacy boundaries;
- deterministic calculation rules;
- AI inputs/outputs and guardrails where applicable;
- observability;
- test strategy;
- rollout/rollback considerations;
- existing code to reuse/adapt/retire.

Board status: **Planned**.

### 5. Task

Create `tasks.md` as small verifiable slices. Prefer vertical slices that leave the repository in a valid state.

Each task should make clear:

- files/modules likely affected where useful;
- completion evidence;
- dependencies;
- whether it can run in parallel;
- tests/checks required.

Board status: **Ready** when the first implementation task is unblocked.

### 6. Workspace

Start one isolated workspace for the issue/spec. Prefer Codex Worktree mode or a manual Git worktree.

Recommended naming:

```text
spec/<issue-or-spec-id>-<slug>
```

Examples:

```text
spec/12-connected-money
spec/18-safe-to-spend
spec/27-spendgate-thresholds
```

The workspace owns that spec's implementation state. Do not switch unrelated work into the same worktree.

Board status: **In Progress**.

### 7. Implement

Implementation follows `tasks.md`. New discoveries that change product behaviour should update the spec/plan rather than living only in chat history.

For parallel agents, split only tasks that have clear ownership boundaries. Examples:

- API contract + contract tests;
- web UI consuming an already-agreed contract;
- isolated data migration tooling;
- independent test/verification work.

Avoid parallel agents editing the same domain model or migration chain unless coordination is explicit.

### 8. Converge

Run Spec Kit convergence before final review. Resolve drift between specification, plan, tasks and code. A feature is not complete merely because tests pass if it does not satisfy the specified outcome.

Board status: **Review**.

### 9. Pull request

A PR should link:

- the delivery issue;
- the spec folder;
- material ADRs/contracts;
- verification evidence.

The PR description should state:

- outcome delivered;
- acceptance criteria status;
- tests/checks run;
- security/privacy implications;
- financial-calculation implications;
- screenshots/recordings where relevant;
- deferred work.

### 10. Release / learn

After merge, move to **Released** only when the behaviour is usable in the intended environment, not simply merged to the default branch. Capture follow-up observations as new issues rather than quietly expanding the completed spec.

## Fast path

Not every change needs the full ceremony. A tiny typo, dependency housekeeping change or obvious low-risk defect may use a normal issue/PR workflow.

Use the full SDD path when the work introduces or changes any of:

- user-facing financial behaviour;
- domain rules or calculations;
- banking/auth integration;
- persisted financial data;
- AI recommendation behaviour;
- SpendGate rules/actions;
- architecture boundaries;
- meaningful cross-workspace contracts.

## Decision records

Architecture decisions with consequences beyond one feature should live under:

```text
docs/adr/
```

Use ADRs for decisions such as:

- monorepo/workspace shape;
- canonical backend/runtime;
- authentication provider;
- financial calculation ownership;
- event/outbox strategy;
- AI provider boundary;
- web/mobile client strategy;
- bank-provider abstraction.

A spec may propose an ADR; the ADR should not be hidden inside an implementation task.
