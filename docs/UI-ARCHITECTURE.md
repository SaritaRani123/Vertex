# UI Architecture Document
## College Scheduling System — Programs Module

---

## Main Screens (5)

| # | Screen | Route | Purpose |
|---|--------|-------|---------|
| 1 | Dashboard | `/` | Overview with links to modules |
| 2 | Departments List | `/departments` | View all departments in a table |
| 3 | Create Department | `/departments/create` | Form to add a new department |
| 4 | Programs List | `/programs` | View all programs with department filter |
| 5 | Create Program | `/programs/create` | Form to add a new program |

---

## Screen Details

### 1. Dashboard (`/`)

| Item | Description |
|------|-------------|
| **Layout** | Centered grid, 2 columns on desktop |
| **Sections** | Hero section, navigation cards |
| **Components** | `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Button`, `Link` |
| **Client/Server** | **Server Component** (default) — no interactivity |
| **Data** | None (static links) |

---

### 2. Departments List (`/departments`)

| Item | Description |
|------|-------------|
| **Layout** | Full-width page, header + table section |
| **Sections** | Page header (title + Add button), table with departments |
| **Components** | `Card`, `CardHeader`, `CardContent`, `Button`, `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `Badge` |
| **Client/Server** | **Server Component** — fetches departments from API on server |
| **Data fetch** | `fetch('/api/departments')` or `prisma.departments.findMany()` in Server Component |

---

### 3. Create Department (`/departments/create`)

| Item | Description |
|------|-------------|
| **Layout** | Centered form, max-width container |
| **Sections** | Page header, form (name, code), submit/cancel buttons |
| **Components** | `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Field`, `FieldLabel`, `Input`, `Button` |
| **Client/Server** | **"use client"** — form state, validation, submit handler |
| **Data** | Form submits via `POST /api/departments` (from Client Component) |

---

### 4. Programs List (`/programs`)

| Item | Description |
|------|-------------|
| **Layout** | Full-width page, header + filter + table |
| **Sections** | Page header, department filter dropdown, table |
| **Components** | `Card`, `CardHeader`, `CardContent`, `Button`, `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `Table`, `Badge` |
| **Client/Server** | **Server Component** (list) + **"use client"** (filter) — filter is client, table data server-fetched |
| **Data** | Server: `prisma.programs.findMany({ include: { department: true } })`; filter passes `?department=id` |

---

### 5. Create Program (`/programs/create`)

| Item | Description |
|------|-------------|
| **Layout** | Centered form, max-width container |
| **Sections** | Page header, form (name, code, duration, department, status), buttons |
| **Components** | `Card`, `Field`, `FieldLabel`, `Input`, `Select`, `Button` |
| **Client/Server** | **"use client"** — form state, department fetch for dropdown |
| **Data** | `GET /api/departments` for dropdown; `POST /api/programs` on submit |

---

## Component Summary

| Component | Use | Client/Server |
|-----------|-----|---------------|
| `Button` | Actions, navigation | use client (shadcn) |
| `Card` | Container for sections | Server |
| `Input` | Text fields | use client (shadcn) |
| `Label` | Form labels | use client (shadcn) |
| `Table` | Data display | Server |
| `Select` | Dropdowns (filter, department) | use client (shadcn) |
| `Badge` | Status (ACTIVE/INACTIVE) | Server |

---

## Data Flow

```
User visits page
    → Server Component fetches from Prisma (or API)
    → Renders HTML with data
    → Client components (forms, filters) hydrate
    → On submit: fetch(POST /api/...) → API → Prisma → DB
    → Redirect or refetch
```

---

## Navigation Structure

- Sidebar or top nav with links: Dashboard, Departments, Programs
- Breadcrumbs on create pages: Departments > Create
