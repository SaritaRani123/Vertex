# REST API Specification — Vertex College Scheduling System

This document defines all REST endpoints for the Vertex project. Use it to integrate with the API (e.g. from other dashboards, scripts, or frontends).

---

## Base URL and testing

| Environment | Base URL |
|-------------|----------|
| Local dev   | `http://localhost:3000` |

**Run the app:** From the project root run `npm run dev`. The API is served by the same Next.js server.

**Testing:**
- **GET (list/single):** Open the URL in a browser, e.g. `http://localhost:3000/api/departments`
- **POST / PUT / DELETE:** Use **curl**, **Postman**, **Insomnia**, or **Thunder Client** with `Content-Type: application/json` for request bodies.

**Example (curl):**
```bash
# List departments
curl http://localhost:3000/api/departments

# Create department
curl -X POST http://localhost:3000/api/departments \
  -H "Content-Type: application/json" \
  -d '{"name":"Computer Science","code":"CS"}'

# Create course (prerequisites are course codes, e.g. ["CS101"])
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"name":"Data Structures","code":"CS201","program_id":1,"credits":3,"lecture_hours":2,"lab_hours":0,"prerequisites":["CS101"]}'
```

---

## Response and error conventions

### Success responses

| Method | Status | Body |
|--------|--------|------|
| GET (list)   | 200 | `{ "data": [ ... ] }` |
| GET (single) | 200 | Single resource object |
| POST         | 201 | Created resource object |
| PUT          | 200 | Updated resource object |
| DELETE       | 204 | No body (except **courses** — see below) |

### Course DELETE (special case)

Deleting a course **removes it from the prerequisites** of any other course that listed it. The API returns **200** with a JSON body (not 204):

```json
{
  "message": "Course deleted. It has been removed from the prerequisites of 2 course(s).",
  "removedFromPrerequisites": 2
}
```

If the course was not a prerequisite elsewhere:

```json
{
  "message": "Course deleted successfully.",
  "removedFromPrerequisites": 0
}
```

### Error responses

| Status | When | Body shape |
|--------|------|------------|
| **400** | Validation error (invalid body or business rule) | `{ "error": "Message", "code": "VALIDATION_ERROR", "details": [{ "path": ["field"], "message": "Field error" }] }` |
| **404** | Resource not found (invalid ID or missing record) | `{ "error": "Message", "code": "NOT_FOUND" }` |
| **500** | Server error | `{ "error": "Message", "code": "INTERNAL_ERROR" }` |

All request bodies are validated with **Zod**. Validation errors return **400** with `details` listing field-level messages (e.g. `"Name is required"`, `"Code is required"`). Types are defined in `lib/api-types.ts`.

---

## Departments

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET    | `/api/departments`     | List all departments |
| GET    | `/api/departments/:id` | Get one department |
| POST   | `/api/departments`     | Create department |
| PUT    | `/api/departments/:id` | Update department |
| DELETE | `/api/departments/:id` | Delete department |

**POST / PUT body (DepartmentInput):**
```json
{
  "name": "string (required)",
  "code": "string (required)"
}
```

**Response (DepartmentResponse):** `id`, `name`, `code`, `created_at`, `updated_at`.

**Delete constraint:** If the department has any **programs**, the API returns **400** with:
`"Cannot delete this department because it has programs. Remove or reassign the programs first."`

---

## Programs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET    | `/api/programs`     | List all programs (optional filter below) |
| GET    | `/api/programs/:id` | Get one program |
| POST   | `/api/programs`     | Create program |
| PUT    | `/api/programs/:id` | Update program |
| DELETE | `/api/programs/:id` | Delete program |

**GET /api/programs** optional query:
- `department_id` — integer; filter programs by department.

**POST body (ProgramInput):**
```json
{
  "name": "string (required)",
  "code": "string (required)",
  "duration_years": "number (required, min 1)",
  "status": "ACTIVE | INACTIVE (optional, default ACTIVE)",
  "department_id": "number (required)"
}
```

**PUT body:** Same fields as POST; all optional (partial update).

**Response (ProgramResponse):** `id`, `name`, `code`, `duration_years`, `status`, `department_id`, `created_at`, `updated_at`. List endpoint returns `ProgramListItem[]` (includes `department_name`).

**Delete constraint:** If the program has any **courses**, the API returns **400** with:
`"Cannot delete this program because it has courses. Remove or reassign the courses first."`

---

## Courses

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET    | `/api/courses`     | List all courses |
| GET    | `/api/courses/:id` | Get one course |
| POST   | `/api/courses`     | Create course |
| PUT    | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course (and remove from other courses’ prerequisites) |

**POST body (CourseInput):**
```json
{
  "name": "string (required)",
  "code": "string (required)",
  "description": "string | null (optional)",
  "prerequisites": "string[] (optional, default []) — array of course codes",
  "credits": "number (required, >= 0)",
  "lecture_hours": "number (required, >= 0)",
  "lab_hours": "number (required, >= 0)",
  "status": "ACTIVE | INACTIVE | ARCHIVED (optional, default ACTIVE)",
  "program_id": "number (required)"
}
```

**PUT body:** Same fields as POST; all optional (partial update).

**Response (CourseResponse):** `id`, `name`, `code`, `description`, `prerequisites` (string[] of codes), `credits`, `lecture_hours`, `lab_hours`, `status`, `program_id`, `program_name`, `created_at`, `updated_at`.

**Delete behavior:**
1. The API finds all courses that list this course’s **code** in `prerequisites`.
2. It removes that code from each of those courses’ `prerequisites` array.
3. It then deletes the course.
4. Returns **200** with `{ "message", "removedFromPrerequisites" }` (see “Course DELETE” above).

**Delete constraint:** If the course is still assigned to any **terms** (semester–course assignment), the API returns **400** with:
`"Cannot delete course while it is assigned to terms. Remove it from all terms first."`

---

## Semesters

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET    | `/api/semesters`     | List all semesters |
| GET    | `/api/semesters/:id` | Get one semester |
| POST   | `/api/semesters`     | Create semester |
| PUT    | `/api/semesters/:id` | Update semester |
| DELETE | `/api/semesters/:id` | Delete semester |

**POST body (SemesterInput):**
```json
{
  "year": "number (required, 1900–3000)",
  "type": "FALL | WINTER | SUMMER (required)"
}
```

**PUT body:** `year` and/or `type` (optional).

**Response (SemesterResponse):** `id`, `year`, `type`, `created_at`, `updated_at`.

**Delete constraint:** If the semester has any **term assignments**, the API returns **400** with:
`"Cannot delete this semester because it has term assignments. Remove the term assignments first."`

---

## Terms (course–semester assignments)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET    | `/api/terms`     | List all term assignments (with semester year/type and course name/code) |
| GET    | `/api/terms/:id` | Get one term |
| POST   | `/api/terms`     | Create term (assign course to semester) |
| PUT    | `/api/terms/:id` | Update term (change semester or course) |
| DELETE | `/api/terms/:id` | Delete term assignment |

**POST body (TermInput):**
```json
{
  "semester_id": "number (required)",
  "course_id": "number (required)"
}
```

**PUT body:** `semester_id` and/or `course_id` (optional).

**Response (TermResponse):** `id`, `semester_id`, `course_id`, `created_at`. List endpoint includes `semester_year`, `semester_type`, `course_name`, `course_code`.

---

## Type definitions

All request/response types are defined in **`lib/api-types.ts`** (e.g. `DepartmentInput`, `DepartmentResponse`, `CourseInput`, `CourseResponse`, `ValidationErrorResponse`). Use these for type-safe integration; the API does not use `any`.

---

## Summary: delete constraints and messages

| Resource   | Blocked when                    | API response (400) message |
|-----------|----------------------------------|-----------------------------|
| Department| Has programs                     | Cannot delete this department because it has programs. Remove or reassign the programs first. |
| Program   | Has courses                      | Cannot delete this program because it has courses. Remove or reassign the courses first. |
| Course    | Assigned to terms                | Cannot delete course while it is assigned to terms. Remove it from all terms first. |
| Course    | Used as prerequisite             | Not blocked; API removes it from other courses’ prerequisites and returns 200 with message. |
| Semester  | Has term assignments             | Cannot delete this semester because it has term assignments. Remove the term assignments first. |
