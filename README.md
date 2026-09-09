# Ascendia

Ascendia is a personal-finance management application built around authenticated financial data, Investec integration, dashboards, and analysis workflows.

The repository started from the T3 stack, but it now contains application-specific account, connect, dashboard, and analysis experiences together with Prisma persistence and financial/AI integrations.

## Current application areas

```text
/                 authentication entry point
/account          account-related experience
/connect          financial connection flow
/dashboard        finance dashboard
/analysis         analysis experience
/api              application/server endpoints
```

Authenticated users are redirected from the landing page to the dashboard.

## Tech stack

- Next.js 15 + React 19
- TypeScript
- NextAuth 5
- Prisma 6
- tRPC 11 + TanStack Query
- Investec API client
- OpenAI SDK
- AG Charts
- TanStack Form
- Tailwind CSS 4 + daisyUI
- Zod / SuperJSON
- Biome

## Engineering focus

- authenticated personal-finance workflows;
- external banking integration through the Investec API;
- typed server/client communication with tRPC;
- relational persistence through Prisma;
- dashboard/chart presentation of financial information;
- AI-assisted analysis capabilities through OpenAI;
- environment validation and server-only boundaries for sensitive integrations.

## Getting started

```bash
npm install
npm run dev
```

Prisma client generation runs automatically after install. Database helpers are available through:

```bash
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:studio
```

Configure the authentication, database, Investec, and OpenAI environment variables required by the parts of the application you are exercising.

## Quality checks

```bash
npm run typecheck
npm run check
npm run build
```

## Project status

Ascendia should be read as an evolving finance application rather than a generic T3 starter. This README intentionally describes the route and integration architecture visible in the repository without claiming financial features that are not implemented in code.
