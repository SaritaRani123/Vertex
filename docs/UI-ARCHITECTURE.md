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
| **Sections** | Page header (title + Add button), table with departments and actions |
| **Components** | `Card`, `CardHeader`, `CardContent`, `Button`, `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `Badge`, `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction` |
| **Client/Server** | **"use client"** — fetches departments from API, manages delete state and confirmations |
| **Data fetch** | `fetch('/api/departments')` on component mount |
| **Interactions** | Each department row has Edit and Delete buttons. Delete button opens confirmation dialog. On confirm, sends `DELETE /api/departments/{id}` and removes from list on success. |

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
| **Layout** | Full-width page, header + table |
| **Sections** | Page header (title + Add button), table with programs and actions |
| **Components** | `Card`, `CardHeader`, `CardContent`, `Button`, `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `Badge`, `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction` |
| **Client/Server** | **"use client"** — fetches programs from API, manages delete state and confirmations |
| **Data fetch** | `fetch('/api/programs')` on component mount |
| **Interactions** | Each program row shows code, name, department, duration, and status badge. Actions column contains Edit and Delete buttons. Delete button opens confirmation dialog. On confirm, sends `DELETE /api/programs/{id}` and removes from list on success. |

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
| `Button` | Actions, navigation, delete triggers | use client (shadcn) |
| `Card` | Container for sections | Server |
| `Input` | Text fields | use client (shadcn) |
| `Label` | Form labels | use client (shadcn) |
| `Table` | Data display | Server |
| `Select` | Dropdowns (filter, department) | use client (shadcn) |
| `Badge` | Status (ACTIVE/INACTIVE) | Server |
| `AlertDialog` | Confirmation dialogs for delete operations | use client (shadcn) |
| `AlertDialogContent` | Modal dialog container | use client (shadcn) |
| `AlertDialogTrigger` | Dialog trigger control | use client (shadcn) |
| `AlertDialogCancel` | Cancel button in dialog | use client (shadcn) |
| `AlertDialogAction` | Confirm action button in dialog | use client (shadcn) |

---

## Data Flow

```
User visits page
    → Client Component fetches from API
    → Renders data in tables
    
Form/Action submission (Create/Update/Delete)
    → User clicks button or confirms dialog
    → fetch(POST|PUT|DELETE /api/...) → API → Prisma → DB
    → On success: update UI state or refetch
    → On error: show error message
    
Delete operations:
    → User clicks Delete button
    → AlertDialog confirms action
    → On confirm: fetch(DELETE /api/{resource}/{id})
    → Remove item from list state on success
```

---

## Navigation Structure

- Sidebar or top nav with links: Dashboard, Departments, Programs
- Breadcrumbs on create pages: Departments > Create
