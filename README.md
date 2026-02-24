# Publicrata

A platform for public participation in democracy. Creating verifiable poll data about parliamentary decisions.

## Tech Stack

- **SvelteKit** (fullstack framework, TypeScript)
- **PostgreSQL** (database)
- **Drizzle ORM** (type-safe queries and migrations)
- **Lucia v3** (session-based authentication)
- **Tailwind CSS v4** (styling)
- **Bundestag DIP API** (parliamentary data)

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)

### Setup

```bash
npm install
docker compose up -d
npm run db:generate
npm run db:migrate
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `BUNDESTAG_API_KEY` | DIP API key (public key included) |
| `EID_ENABLED` | Enable eID/BundID verification (`true`/`false`) |

## Features

- **Bundestag Agenda**: Syncs Vorgaenge (parliamentary proceedings) from the DIP API
- **Public Voting**: Vote Ja/Nein/Enthaltung on Bundestag items and community proposals
- **Discussion Forum**: Threaded comments on every voting topic
- **User Proposals**: Citizens can create their own proposals for public voting
- **eID Ready**: Architecture prepared for German eID/BundID identity verification

## Syncing Bundestag Data

Trigger a sync of Bundestag Vorgaenge (requires authentication):

```bash
curl -X POST http://localhost:5173/api/bundestag/sync \
  -H "Cookie: <your-session-cookie>"
```

## Database Commands

```bash
npm run db:generate   # Generate migrations from schema changes
npm run db:migrate    # Apply migrations
npm run db:studio     # Open Drizzle Studio (DB browser)
```
