# Ujima Loaning App API

Backend API for an ethical SACCO loaning workflow based on `Ujima_AI_Governance_Deliverables.md`.

## Stack

- Node.js
- Express
- TypeScript
- Drizzle ORM
- PostgreSQL
- Zod validation

## Quick Start

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run dev
```

The API runs on `http://localhost:4000` by default.

## Main Routes

- `GET /health`
- `POST /api/members`
- `GET /api/members/:id`
- `POST /api/consents`
- `POST /api/loans/applications`
- `GET /api/loans/applications/:id`
- `POST /api/loans/applications/:id/triage`
- `POST /api/loans/applications/:id/decision`
- `GET /api/audits`
- `POST /api/agents/scout/messages`
- `POST /api/agents/guardian/triage/:applicationId`
- `POST /api/agents/hunter/briefings/:applicationId`

## Governance Built Into the API

- Credit score cannot be the sole denial reason.
- Occupation-only denial is blocked by service rules.
- Consent is required before transaction-history based triage.
- High-value and vulnerable-household cases are escalated to human review.
- Every major workflow writes an audit log.
- Agent handoffs preserve explicit RANK/TRAIL/HUNT boundaries from the dossier.
