# Ascendia Product Vision

## Product thesis

Ascendia is a South African personal-money operating system that closes the loop between financial data and financial behaviour.

Most personal-finance products stop at categorisation and dashboards. Ascendia should help a user answer four progressively more useful questions:

1. **Plan — Where should my money go?**
2. **Understand — What is actually happening with my money?**
3. **Advise — What should I change next?**
4. **Control — How do I stick to that decision?**

The long-term loop is:

`Connect → Normalise → Plan → Observe → Understand → Advise → Act → Learn`

## Product capabilities

### Plan

The planning domain is informed by the Investec Budgeter work and should eventually own:

- income planning;
- fixed obligations;
- flexible spending allocations;
- goals and savings commitments;
- budget periods;
- envelopes/categories;
- reserves;
- safe-to-spend calculations.

### Understand

The Ascendia intelligence domain should own:

- accounts and balances;
- transaction ingestion and normalisation;
- merchants and categories;
- recurring-payment detection;
- subscriptions;
- trends and deviations;
- cash-flow observations;
- explainable financial insights.

### Advise — Maven

Maven is the user-facing coaching capability, not a separate product. It should turn trusted calculated facts into contextual, actionable guidance.

Examples include:

- explaining why discretionary cash is lower than expected;
- identifying lifestyle creep;
- recommending a realistic adjustment to a category;
- explaining the impact of a decision on a goal or obligation;
- proposing, but not silently applying, a SpendGate rule.

### Control — SpendGate

SpendGate becomes Ascendia's execution and guardrail capability. It should support progressively stronger interventions:

1. Observe
2. Nudge
3. Warn
4. Require a user decision
5. Enforce only where technically supported and explicitly consented

SpendGate rules should be usable before hard transaction blocking exists.

## Existing product assets

The programme should treat existing projects as prototypes and reusable assets rather than independent products competing for delivery time.

| Existing work | Contribution to Ascendia |
| --- | --- |
| Ascendia | authenticated finance UX, Investec connection, dashboards, analysis, existing financial/AI integration |
| Investec Budgeter | planning model, budget periods, obligations, allocations, safe-to-spend thinking, reconciliation workflow |
| Mzansi Money Maven | recommendation/coaching concepts and South African financial guidance |
| SpendGate / SpendGate Monorepo | programmable spending rules, shared Investec integration, multi-client experimentation, rule-engine direction |

No migration is assumed. Each reusable asset must be inventoried and either **reuse**, **adapt**, **rewrite with reason**, or **retire**.

## Product principles

- Useful before intelligent: deterministic money management must work without AI.
- Explainable before clever: the user should be able to understand where every important number came from.
- Actionable over decorative: insights should lead to a decision, adjustment or reassurance.
- Calm financial UX: surface exceptions and decisions rather than forcing users to inspect dashboards constantly.
- User autonomy: the system proposes and explains; the user controls consequential changes.
- Privacy by design: minimise sensitive data, protect credentials, redact logs and isolate banking integrations.
- South Africa first: design around ZAR, local banking integrations and local financial realities without making the core domain impossible to extend.

## Initial release horizon

### R0 — Programme Foundation

- establish product constitution and spec-driven delivery process;
- inventory existing repos and reusable assets;
- decide canonical workspace architecture;
- define core financial domain and security boundaries;
- establish GitHub Project and release workflow.

### R1 — Connected Money

- authenticated user;
- connect supported Investec account in sandbox/controlled environment;
- idempotently import accounts and transactions;
- normalise and persist trusted transaction data;
- provide a usable transaction/account view.

### R2 — Plan

- budget period;
- planned income and obligations;
- flexible allocations;
- safe-to-spend;
- transaction-to-plan reconciliation.

### R3 — Understand

- reliable categorisation and merchant normalisation;
- recurring spend/subscription signals;
- explainable trends, deviations and financial observations.

### R4 — Maven

- contextual recommendations based only on trusted calculated facts;
- recommendation explanations and evidence;
- user-approved plan adjustments.

### R5 — SpendGate

- configurable category/merchant/rule guardrails;
- thresholds, nudges and warnings;
- rule-state history;
- user-approved transfers/adjustments between allocations where supported.

### R6 — Learn

- compare planned versus actual outcomes;
- evaluate whether recommendations helped;
- propose next-period adjustments without silently applying them.

## Non-goals for the foundation phase

- merging all existing repositories immediately;
- supporting every South African bank;
- building web and mobile clients simultaneously;
- allowing an LLM to be the source of truth for financial values;
- attempting hard payment blocking before the banking/payment capabilities and consent model are proven;
- broad productisation before the system works reliably for a real user's monthly money cycle.
