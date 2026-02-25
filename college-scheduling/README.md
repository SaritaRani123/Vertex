# College Scheduling – Programs Management Module

Next.js (App Router) application for managing **Departments → Programs → Semesters → Subjects → Prerequisites**, with PostgreSQL (Neon), Prisma, NextAuth (role-based), Zod validation, and shadcn/ui.

## Stack

- **Next.js 14** (TypeScript, App Router)
- **Tailwind CSS** + **shadcn/ui** (Radix UI)
- **Prisma ORM** + **PostgreSQL** (Neon)
- **REST API** Route Handlers under `app/api/`
- **Zod** for request validation
- **NextAuth** with role-based access (Admin / User)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. PostgreSQL / Neon

- Create a PostgreSQL database (e.g. on [Neon](https://neon.tech)).
- Copy the connection string (with `?sslmode=require` for Neon).

### 3. Environment variables

Copy the example env and set your values:

```bash
cp .env.example .env
```

Edit `.env`:

- **`DATABASE_URL`** – PostgreSQL connection string (Neon or local).
- **`NEXTAUTH_URL`** – App URL (e.g. `http://localhost:3000`).
- **`NEXTAUTH_SECRET`** – Random secret (e.g. `openssl rand -base64 32`).
- **`ADMIN_SECRET`** – Password that grants **Admin** role when signing in. If not set or wrong, user gets **User** role.

### 4. Prisma

Generate the client and push the schema to the database:

```bash
npx prisma generate
npx prisma db push
```

Optional: run migrations instead of push:

```bash
npx prisma migrate dev --name init
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with any email and the password set in `ADMIN_SECRET` to get Admin access and use CRUD.

## Auth & access

- **Sign in**: `/login` – any email + password. If password equals `ADMIN_SECRET`, role is **Admin**; otherwise **User**.
- **Admin**: Can use all management pages and APIs (departments, programs, semesters, subjects, prerequisites).
- **User**: Can open the app but middleware blocks management routes and API; they will get 401/403 on those.

## Project structure

```
college-scheduling/
├── app/
│   ├── api/                    # REST route handlers
│   │   ├── auth/[...nextauth]/
│   │   ├── departments/
│   │   ├── programs/
│   │   ├── semesters/
│   │   ├── subjects/
│   │   └── prerequisites/
│   ├── departments/            # List, create, edit
│   ├── programs/               # List, create, edit
│   ├── semesters/              # List (semesters auto-created with program)
│   ├── subjects/               # List, create, edit
│   ├── prerequisites/         # List, add, delete
│   ├── login/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                     # shadcn-style components
│   ├── tables/
│   ├── forms/
│   └── modals/
├── prisma/
│   └── schema.prisma
├── types/
│   └── index.ts
├── utils/
│   ├── prisma.ts
│   ├── validation.ts
│   ├── auth.ts
│   └── cn.ts
├── middleware.ts               # NextAuth + role check
├── .env.example
└── package.json
```

## API overview

- **Departments**: `GET/POST /api/departments`, `GET/PUT/DELETE /api/departments/[id]`
- **Programs**: `GET/POST /api/programs`, `GET/PUT/DELETE /api/programs/[id]` (creating a program auto-creates semesters by duration)
- **Semesters**: `GET /api/semesters?programId=...`
- **Subjects**: `GET/POST /api/subjects`, `GET/PUT/DELETE /api/subjects/[id]`
- **Prerequisites**: `GET/POST /api/prerequisites`, `GET/DELETE /api/prerequisites/[id]`

All mutation endpoints require an **Admin** session. Validation is done with Zod; invalid input returns 400, missing resources 404, server errors 500.

## Business rules

- **Department**: unique name.
- **Program**: unique name per department; semesters are created automatically based on `duration` (e.g. 4 years → 8 semesters).
- **Subject**: unique code; belongs to a semester.
- **Prerequisite**: subject depends on another; no self-dependency; prerequisite must be from an earlier semester; no circular dependencies (enforced in API).

## Scripts

- `npm run dev` – development server
- `npm run build` – production build
- `npm run start` – start production server
- `npx prisma generate` – generate Prisma client
- `npx prisma db push` – push schema to DB (no migrations)
- `npx prisma migrate dev` – run migrations (dev)
- `npx prisma studio` – open Prisma Studio
