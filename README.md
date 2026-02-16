# Secureit CRM API (NestJS + Prisma)

A small CRM-style REST API built with **NestJS**, **Prisma**, and **PostgreSQL**. It includes JWT authentication, role-based access control (ADMIN/EMPLOYEE), and basic resources for **Users**, **Customers**, and **Tasks**.

## Tech stack

- NestJS (TypeScript)
- Prisma (with `@prisma/adapter-pg`)
- PostgreSQL
- JWT auth (`passport-jwt`)
- Swagger/OpenAPI at `/api`

## Project structure

- `Secure-task-api/` — the NestJS application
- `Secure-task-api/prisma/` — Prisma schema + migrations
- `Secure-task-api/generated/prisma/` — generated Prisma client output

## Prerequisites

- Node.js (LTS recommended)
- PostgreSQL database

## Environment variables

Create an `.env` file in either:

- `Secure-task-api/.env` (preferred), or
- repo root `.env`

Required:

- `DATABASE_URL` — Postgres connection string (e.g. `postgresql://user:pass@localhost:5432/mini_crm?schema=public`)
- `JWT_SECRET` — secret used to sign/verify JWTs (use a strong value in production)

## Setup

```bash
cd Secure-task-api
npm install
```

## Database (Prisma)

Run migrations (creates/updates tables):

```bash
cd Secure-task-api
npx prisma migrate dev
```

Generate Prisma client (usually not needed manually if your workflow already does it):

```bash
cd Secure-task-api
npx prisma generate
```

## Run the API

Development (watch mode):

```bash
cd Secure-task-api
npm run start:dev
```

The server listens on:

- `http://localhost:3000`

Swagger UI:

- `http://localhost:3000/api`

## Auth & roles

- JWT Bearer auth is required for protected routes.
- Roles:
  - `ADMIN`
  - `EMPLOYEE`

Typical flow:

1. Register a user
2. Login to get `accessToken`
3. Use Swagger “Authorize” with `Bearer <token>`

## Main routes (high level)

- `POST /auth/register`
- `POST /auth/login`
- `GET /users` (ADMIN only)
- `PATCH /users/:id` (ADMIN only; update role)
- `GET /customers` (protected)
- `POST /customers` (ADMIN only)
- `GET /tasks` (ADMIN/EMPLOYEE; employees get their assigned tasks)
- `POST /tasks` (ADMIN only)
- `PATCH /tasks/:id/status` (ADMIN/EMPLOYEE; employees can update their own tasks)

## Tests

```bash
cd Secure-task-api
npm test
npm run test:e2e
```

## Notes

- Local env loading: the Prisma service attempts to load both `Secure-task-api/.env` and the repo-root `.env` for convenience.
- Default JWT secret fallback exists for local dev, but you should set `JWT_SECRET` explicitly.
