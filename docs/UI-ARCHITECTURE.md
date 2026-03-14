# UI Architecture Document
## College Scheduling System — Vertex

---

## Main Screens

| # | Screen | Route | Purpose |
|---|--------|-------|---------|
| 1 | Dashboard | `/` | Overview with links to modules |
| 2 | Departments List | `/departments` | View all departments in a table |
| 3 | Create Department | `/departments/create` | Form to add a new department |
| 4 | Edit Department | `/departments/[id]/edit` | Form to update a department |
| 5 | Programs List | `/programs` | View all programs with department filter |
| 6 | Create Program | `/programs/create` | Form to add a new program |
| 7 | Edit Program | `/programs/[id]/edit` | Form to update a program |
| 8 | Courses List | `/courses` | View all courses and manage CRUD |
| 9 | Create Course | `/courses/create` | Form to add a new course |
| 10 | Edit Course | `/courses/[id]/edit` | Form to update a course (including prerequisites) |
| 11 | Semesters List | `/semesters` | View semester periods |
| 12 | Create Semester | `/semesters/create` | Form to add a new semester |
| 13 | Edit Semester | `/semesters/[id]/edit` | Form to update a semester |
| 14 | Terms List | `/terms` | View course–semester assignments |
| 15 | Create Term | `/terms/create` | Assign a course to a semester |
| 16 | Edit Term | `/terms/[id]/edit` | Change semester or course for a term |

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
| **Interactions** | Each department row has **Edit** (navigates to `/departments/[id]/edit`) and **Delete** buttons. Delete opens confirmation dialog. On confirm, sends `DELETE /api/departments/{id}`. On success, item is removed from list. On **400** (e.g. department has programs), the **API error message** is shown in the UI (e.g. toast or inline). |

---

### 3. Create Department (`/departments/create`)

| Item | Description |
|------|-------------|
| **Layout** | Centered form, max-width container |
| **Sections** | Page header, form (name, code), submit/cancel buttons |
| **Components** | `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Field`, `FieldLabel`, `Input`, `FieldError`, `Button` |
| **Client/Server** | **"use client"** — form state, **field-level validation**, submit handler |
| **Data** | Form submits via `POST /api/departments`. **Validation:** client-side checks on submit; API may return 400 with `details` array — each `path`/`message` is mapped to **fieldErrors** and shown under the corresponding field via **FieldError**. |

---

### 4. Edit Department (`/departments/[id]/edit`)

| Item | Description |
|------|-------------|
| **Layout** | Same as Create Department |
| **Sections** | Page header, form pre-filled with current name/code, submit/cancel |
| **Components** | Same as Create; **FieldError** for per-field errors |
| **Client/Server** | **"use client"** — loads department via `GET /api/departments/[id]`, submits via `PUT /api/departments/[id]` |
| **Validation** | Same field-level validation and API error mapping as Create. |

---

### 5. Programs List (`/programs`)

| Item | Description |
|------|-------------|
| **Layout** | Full-width page, header + table |
| **Sections** | Page header (title + Add button), table with programs and actions |
| **Components** | `Card`, `CardHeader`, `CardContent`, `Button`, `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `Badge`, `AlertDialog` (full set) |
| **Client/Server** | **"use client"** — fetches programs from API (optionally with `?department_id=`), manages delete state and confirmations |
| **Data fetch** | `fetch('/api/programs')` or `fetch('/api/programs?department_id=...')` on mount |
| **Interactions** | Each program row shows code, name, department, duration, status badge. **Edit** → `/programs/[id]/edit`. **Delete** → confirmation dialog; on confirm, `DELETE /api/programs/{id}`. On **400** (e.g. program has courses), the **API error message** is shown. |

---

### 6. Create Program (`/programs/create`)

| Item | Description |
|------|-------------|
| **Layout** | Centered form, max-width container |
| **Sections** | Page header, form (name, code, duration, department, status), buttons |
| **Components** | `Card`, `Field`, `FieldLabel`, `Input`, `Select`, `FieldError`, `Button` |
| **Client/Server** | **"use client"** — form state, department fetch for dropdown, **field-level validation** |
| **Data** | `GET /api/departments` for dropdown; `POST /api/programs` on submit. API 400 `details` mapped to **fieldErrors** and shown with **FieldError**. |

---

### 7. Edit Program (`/programs/[id]/edit`)

| Item | Description |
|------|-------------|
| **Layout** | Same as Create Program |
| **Sections** | Form pre-filled; submit updates via PUT |
| **Components** | Same as Create Program; **FieldError** for per-field errors |
| **Data** | `GET /api/programs/[id]` to load; `PUT /api/programs/[id]` on submit. Same validation/error display as Create. |

---

### 8. Courses List (`/courses`)

| Item | Description |
|------|-------------|
| **Layout** | Full-width table with action buttons |
| **Sections** | Header (title + add button), table with course fields (including **prerequisites** as chips) and actions |
| **Components** | `Card`, `Table`, `Button`, `AlertDialog`, **Tooltip** (for prerequisite chips) |
| **Client/Server** | **"use client"** — fetches courses from API, handles delete/refresh |
| **Data fetch** | `fetch('/api/courses')` on mount |
| **Interactions** | **Edit** → `/courses/[id]/edit`. **Delete** → confirmation dialog. If the course is a **prerequisite** of other courses, the confirmation dialog **lists those courses** and states that deleting will remove this course from their prerequisites. On confirm, `DELETE /api/courses/{id}`; API returns **200** with `message` and `removedFromPrerequisites`. UI shows a **success message** (e.g. “Course deleted; removed from prerequisites of N course(s)”). If API returns **400** (e.g. course assigned to terms), the **API error message** is shown. **Prerequisite chips** on the list show a **tooltip** on hover (e.g. course name, description, credits). |

---

### 9. Create Course (`/courses/create`)

| Item | Description |
|------|-------------|
| **Layout** | Centered form, max-width container |
| **Sections** | Name, code, description, **prerequisites (multi-select)**, credits, lecture hours, lab hours, status, program dropdown |
| **Components** | `Card`, `Field`, `FieldLabel`, `Input`, `Select`, **CourseMultiSelect**, `FieldError`, `Button` |
| **Client/Server** | **"use client"** — form state, program dropdown fetch, **prerequisites** via **CourseMultiSelect** (searchable multi-select; options from `GET /api/courses`; selected shown as badges with **tooltips** on hover — name, description, credits, etc.) |
| **Data** | `GET /api/programs` for program dropdown; `GET /api/courses` for prerequisite options; `POST /api/courses` on submit. **Validation:** field-level errors and API `details` mapped to **fieldErrors**; **FieldError** under each field. |

---

### 10. Edit Course (`/courses/[id]/edit`)

| Item | Description |
|------|-------------|
| **Layout** | Same as Create Course |
| **Sections** | Form pre-filled; prerequisites editable via same multi-select |
| **Components** | Same as Create Course; **CourseMultiSelect**, **FieldError**, tooltips on selected prerequisites |
| **Data** | `GET /api/courses/[id]` to load; `PUT /api/courses/[id]` on submit. Same validation and error display as Create. |

---

### 11. Semesters List (`/semesters`)

| Item | Description |
|------|-------------|
| **Layout** | Full-width page with table |
| **Sections** | Header + add button, table with year + type + actions |
| **Components** | `Card`, `Table`, `Button`, `AlertDialog` |
| **Client/Server** | **"use client"** — fetches semesters, delete actions |
| **Data fetch** | `fetch('/api/semesters')` |
| **Interactions** | **Edit** → `/semesters/[id]/edit`. **Delete** → confirmation; on 400 (semester has term assignments), show **API error message**. |

---

### 12. Create Semester (`/semesters/create`)

| Item | Description |
|------|-------------|
| **Layout** | Centered form |
| **Sections** | Year, type dropdown |
| **Components** | `Card`, `Field`, `FieldLabel`, `Input`, `Select`, `FieldError`, `Button` |
| **Client/Server** | **"use client"** — submission to API, **field-level validation** |
| **Data** | `POST /api/semesters`. API 400 `details` → **fieldErrors** + **FieldError**. |

---

### 13. Edit Semester (`/semesters/[id]/edit`)

| Item | Description |
|------|-------------|
| **Layout** | Same as Create Semester |
| **Sections** | Form pre-filled with year and type |
| **Data** | `GET /api/semesters/[id]` to load; `PUT /api/semesters/[id]` on submit. Same validation/error display as Create. |

---

### 14. Terms List (`/terms`)

| Item | Description |
|------|-------------|
| **Layout** | Full-width table |
| **Sections** | Header + add button, table with semester (year/type) and course (name/code) and actions |
| **Components** | `Card`, `Table`, `Button`, `AlertDialog` |
| **Client/Server** | **"use client"** — fetches terms (with semester_year, semester_type, course_name, course_code), delete actions |
| **Data fetch** | `fetch('/api/terms')` |
| **Interactions** | **Edit** → `/terms/[id]/edit`. **Delete** → confirmation; on confirm, `DELETE /api/terms/[id]`. |

---

### 15. Create Term (`/terms/create`)

| Item | Description |
|------|-------------|
| **Layout** | Centered form |
| **Sections** | Semester select, course select |
| **Components** | `Card`, `Field`, `FieldLabel`, `Select`, `FieldError`, `Button` |
| **Client/Server** | **"use client"** — fetches semesters and courses for dropdowns, **field-level validation** |
| **Data** | `GET /api/semesters`, `GET /api/courses` for dropdowns; `POST /api/terms` on submit. API errors mapped to **fieldErrors** + **FieldError**. |

---

### 16. Edit Term (`/terms/[id]/edit`)

| Item | Description |
|------|-------------|
| **Layout** | Same as Create Term |
| **Sections** | Pre-filled semester and course; user can change either |
| **Data** | `GET /api/terms/[id]` to load; `PUT /api/terms/[id]` on submit. Same validation/error display as Create. |

---

## Component Summary

| Component | Use | Client/Server |
|-----------|-----|---------------|
| `Button` | Actions, navigation, delete triggers | use client (shadcn) |
| `Card` | Container for sections | Server |
| `Input` | Text fields | use client (shadcn) |
| `Label` / `FieldLabel` | Form labels | use client (shadcn) |
| `Field` | Wrapper for label + input + error | use client (project) |
| **`FieldError`** | Displays per-field validation message under input | use client (project) |
| `Table` | Data display | Server |
| `Select` | Dropdowns (filter, department, program, semester, course, status) | use client (shadcn) |
| **`CourseMultiSelect`** | Searchable multi-select for course prerequisites; options from `/api/courses`; selected as badges with tooltips | use client (project) |
| `Badge` | Status (ACTIVE/INACTIVE/ARCHIVED), prerequisite chips | Server |
| **`Tooltip`** | Hover info for prerequisite chips and selected courses (name, description, credits, etc.) | use client (shadcn) |
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

Form submission (Create / Edit)
    → User fills form; optional client-side validation on submit
    → fetch(POST or PUT /api/...) → API (Zod validation) → Prisma → DB
    → On success: redirect to list or stay with success feedback
    → On 400: API returns { error, code: "VALIDATION_ERROR", details: [{ path, message }] }
        → UI maps details to fieldErrors by path
        → FieldError components show message under each field

Delete operations
    → User clicks Delete → AlertDialog confirms action
    → On confirm: fetch(DELETE /api/{resource}/{id})
    → On success:
        • List: remove item from state or refetch
        • Course: if API returns 200 with removedFromPrerequisites, show success message (e.g. “Removed from prerequisites of N course(s)”)
    → On 400: show API error message (e.g. department has programs, program has courses, semester has terms, course assigned to terms)

Course delete (prerequisite flow)
    → Before confirm: if this course is a prerequisite of others, confirmation dialog lists those courses and explains that deleting will remove it from their prerequisites
    → On confirm: API updates those courses’ prerequisites and deletes the course; response includes removedFromPrerequisites
    → UI shows success message with that count
```

---

## Validation and Errors

- **Client-side:** Forms may validate required fields, formats, and ranges on submit before calling the API.
- **Server-side:** All create/update bodies are validated with **Zod** in `lib/validations/`. Invalid requests return **400** with `code: "VALIDATION_ERROR"` and optional `details` array.
- **Field-level display:** The UI keeps a `fieldErrors` state (e.g. `Record<string, string>`). When the API returns `details`, each `path` (e.g. `["name"]`) is mapped to a field key and the `message` is shown in a **FieldError** under that input. This applies to all create/edit forms (departments, programs, courses, semesters, terms).

---

## Navigation Structure

- **Sidebar or top nav:** Dashboard, Departments, Programs, Courses, Semesters, Terms.
- **List pages:** “Add” or “Create” button links to the create route; each row has **Edit** (edit route) and **Delete** (confirmation then API).
- **Breadcrumbs:** e.g. Departments > Create, Courses > Edit.

---

## Reference

- **API contract:** See **`docs/API_SPECIFICATION.md`** for endpoints, request/response bodies, query parameters, and delete constraints.
- **Types:** `lib/api-types.ts` — request/response and error types.
- **Validation schemas:** `lib/validations/` — Zod schemas used by the API.
