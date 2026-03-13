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
| 6 | Courses List | `/courses` | View all courses and manage CRUD |
| 7 | Create Course | `/courses/create` | Form to add a new course |
| 8 | Semesters List | `/semesters` | View semester periods |
| 9 | Create Semester | `/semesters/create` | Form to add a new semester |
| 10 | Terms List | `/terms` | View course-semester assignments |
| 11 | Create Term | `/terms/create` | Assign a course to a semester |

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

### 6. Courses List (`/courses`)

| Item | Description |
|------|-------------|
| **Layout** | Full-width table with action buttons |
| **Sections** | Header (title + add button), table with course fields and actions |
| **Components** | `Card`, `Table`, `Button`, `AlertDialog` |
| **Client/Server** | **"use client"** — fetches courses from API, handles delete/refresh |
| **Data fetch** | `fetch('/api/courses')` on mount |
| **Interactions** | Edit and delete courses; delete uses confirmation dialog |

---

### 7. Create Course (`/courses/create`)

| Item | Description |
|------|-------------|
| **Layout** | Centered form, max-width container |
| **Sections** | Name, code, description, prerequisites, credits, lecture hours, lab hours, status, program dropdown |
| **Components** | `Card`, `Field`, `Input`, `Select`, `Button` |
| **Client/Server** | **"use client"** — form state, program dropdown fetch, submission | 
| **Data** | `GET /api/programs` for dropdown; `POST /api/courses` on submit |

---

### 8. Semesters List (`/semesters`)

| Item | Description |
|------|-------------|
| **Layout** | Full-width page with table |
| **Sections** | Header + add button, table with year + type + actions |
| **Components** | `Card`, `Table`, `Button`, `AlertDialog` |
| **Client/Server** | **"use client"** — fetches semesters, delete actions |
| **Data fetch** | `fetch('/api/semesters')` |

---

### 9. Create Semester (`/semesters/create`)

| Item | Description |
|------|-------------|
| **Layout** | Centered form |
| **Sections** | Year, type dropdown |
| **Components** | `Card`, `Field`, `Input`, `Select`, `Button` |
| **Client/Server** | **"use client"** — submission to API |
| **Data** | `POST /api/semesters` |

---

### 10. Terms List (`/terms`)

| Item | Description |
|------|-------------|
| **Layout** | Full-width table |
| **Sections** | Header + add button, table with course and semester mapping |
| **Components** | `Card`, `Table`, `Button`, `AlertDialog` |
| **Client/Server** | **"use client"** — fetches terms, delete actions |
| **Data fetch** | `fetch('/api/terms')` |

---

### 11. Create Term (`/terms/create`)

| Item | Description |
|------|-------------|
| **Layout** | Centered form |
| **Sections** | Semester select, course select |
| **Components** | `Card`, `Field`, `Select`, `Button` |
| **Client/Server** | **"use client"** — selection fetch and submission |
| **Data** | `POST /api/terms` |

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
