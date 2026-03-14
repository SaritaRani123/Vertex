# Vertex — College Scheduling System

A web app to manage departments, programs, courses, semesters, and term (course–semester) assignments. Built with **Next.js**, **Prisma**, and **PostgreSQL**.

## Run the project

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Set up `.env` with `DATABASE_URL` for your database and run migrations if needed.

## What’s inside

- **Dashboard** — Links to each module.
- **Departments** — CRUD; list, create, edit, delete.
- **Programs** — CRUD with optional department filter.
- **Courses** — CRUD with prerequisites (multi-select) and tooltips.
- **Semesters** — CRUD (year + type: FALL / WINTER / SUMMER).
- **Terms** — Assign courses to semesters; list, create, edit, delete.

All create/edit forms use field-level validation and show API errors under the relevant fields.

## Docs

- **[API Specification](docs/API_SPECIFICATION.md)** — Endpoints, request/response bodies, errors, delete rules.
- **[UI Architecture](docs/UI_ARCHITECTURE.md)** — Screens, routes, components, and workflows.

## Tech

- Next.js (App Router), React, TypeScript
- Prisma + PostgreSQL
- shadcn/ui–style components
