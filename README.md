# Vertex — College Scheduling System

Vertex is a full-stack web app for managing **departments**, **programs**, **courses**, **semesters**, and **term** assignments (which course runs in which semester). It includes **role-based access**: administrators can create and delete records directly; staff use the same data with an approval workflow for destructive actions.

Built with **Next.js** (App Router), **React**, **TypeScript**, **Prisma**, and **PostgreSQL**.

---

## Features

- **Dashboard** — Entry point with links to each module.
- **Departments, programs, courses, semesters, terms** — List, create, edit, and delete (subject to role and delete rules below).
- **Courses** — Prerequisites as multi-select by course code; tooltips on list and forms; special delete behavior that cleans prerequisite references.
- **Terms** — Links a course to a semester; list view shows semester year/type and course identifiers.
- **Authentication** — Email/password sign-up and sign-in via static pages under `/sign-in.html` and `/sign-up.html`; **HTTP-only session cookie** (`programs_session`).
- **Roles** — `ADMIN` and `STAFF`. The **first user** registered in an empty database becomes `ADMIN`; later registrations default to `STAFF` unless you pass `role` on register (used cautiously).
- **Staff workflow** — Staff may **GET** and **PUT** scheduling resources but not **POST** or **DELETE** on module APIs; they can submit **permission requests** for create/delete; admins **review** those requests via the API.

Field-level validation uses **Zod** on the server; the UI maps API validation errors to form fields.

---

## Prerequisites

- **Node.js** (compatible with Next.js 16; LTS recommended)
- **PostgreSQL** database and connection string

---

## Setup

```bash
npm install
```

Create a **`.env`** file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Apply the schema to your database (pick one approach your team uses):

```bash
npx prisma generate
npx prisma migrate deploy
```

For local prototyping you may use `npx prisma db push` instead of migrate; align with your team’s workflow.

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up the first user to bootstrap an **ADMIN** account, or open [http://localhost:3000/sign-in.html](http://localhost:3000/sign-in.html) if users already exist.

---

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js development server (Turbopack) |
| `npm run build` | Production build (runs TypeScript check) |
| `npm run start` | Production server (after `build`) |
| `npm run lint` | ESLint |
| `npm run db:generate` | `prisma generate` |
| `npm run db:push` | `prisma db push` |
| `npm run db:tables` | Generate client + push schema |

---

## Documentation

| Document | Contents |
|----------|----------|
| [API-endpoints.md](API-endpoints.md) | **Quick index + JSON examples** — all API routes by category with sample request/response payloads |

Shared TypeScript types for API payloads and errors live in **`lib/api-types.ts`**. Zod schemas for request bodies are in **`lib/validations/`**.

---

## Tech stack

- Next.js 16, React 19, TypeScript  
- Prisma 7 + `@prisma/adapter-pg` + `pg`  
- Tailwind CSS 4, shadcn-style UI components  
- Zod for validation  

---

## Repository

Team/project details live with your course or org; this README describes the application only.
