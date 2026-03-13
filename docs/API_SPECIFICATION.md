# REST API Specification — Programs Module

This document defines the REST endpoints exposed for integration by other dashboards.

---

## Where & how to test

**Base URL (local dev):** `http://localhost:3000`

1. **Start the app:** From the project root run `pnpm dev`. The API is served by the same Next.js server.
2. **In the browser:** Open `http://localhost:3000/api/departments` or `http://localhost:3000/api/programs` to run **GET** (list) requests.
3. **Other methods (POST, PUT, DELETE):** Use **curl**, **Postman**, **Insomnia**, or VS Code **Thunder Client**.

**Example requests (PowerShell):**

```powershell
# List departments
Invoke-RestMethod -Uri "http://localhost:3000/api/departments" -Method GET

# Create department
Invoke-RestMethod -Uri "http://localhost:3000/api/departments" -Method POST -ContentType "application/json" -Body '{"name":"Computer Science","code":"CS"}'

# Get one (replace ID with a real id from the list)
Invoke-RestMethod -Uri "http://localhost:3000/api/departments/YOUR_ID" -Method GET

# List programs (optional filter)
Invoke-RestMethod -Uri "http://localhost:3000/api/programs" -Method GET
Invoke-RestMethod -Uri "http://localhost:3000/api/programs?department_id=YOUR_DEPT_ID" -Method GET

# Create program
Invoke-RestMethod -Uri "http://localhost:3000/api/programs" -Method POST -ContentType "application/json" -Body '{"name":"B.Tech","code":"BTECH","duration_years":4,"department_id":"YOUR_DEPT_ID"}'
```

**Example requests (curl, Bash/WSL):**

```bash
curl http://localhost:3000/api/departments
curl -X POST http://localhost:3000/api/departments -H "Content-Type: application/json" -d "{\"name\":\"Computer Science\",\"code\":\"CS\"}"
curl http://localhost:3000/api/programs
```

---

## Departments

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/departments` | Get all departments |
| GET | `/api/departments/:id` | Get department by ID |
| POST | `/api/departments` | Create department |
| PUT | `/api/departments/:id` | Update department |
| DELETE | `/api/departments/:id` | Delete department |

---

## Programs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/programs` | Get all programs |
| GET | `/api/programs/:id` | Get program by ID |
| POST | `/api/programs` | Create program |
| PUT | `/api/programs/:id` | Update program |
| DELETE | `/api/programs/:id` | Delete program |

---

## Courses

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/courses` | Get all courses |
| GET | `/api/courses/:id` | Get course by ID |
| POST | `/api/courses` | Create course |
| PUT | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |

---

## Semesters

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/semesters` | Get all semesters |
| GET | `/api/semesters/:id` | Get semester by ID |
| POST | `/api/semesters` | Create semester |
| PUT | `/api/semesters/:id` | Update semester |
| DELETE | `/api/semesters/:id` | Delete semester |

---

## Terms

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/terms` | Get all term assignments |
| GET | `/api/terms/:id` | Get term assignment by ID |
| POST | `/api/terms` | Assign course to semester |
| DELETE | `/api/terms/:id` | Remove term assignment |

---

## HTTP Status Codes

| Code | Usage |
|------|--------|
| 200 | Success (GET, PUT) |
| 201 | Created (POST) |
| 204 | No content (DELETE) |
| 400 | Bad request — invalid input (validation failed) |
| 404 | Not found — resource does not exist |
| 500 | Internal server error |

---

## IDs

Resource IDs are **auto-increment integers** (1, 2, 3, …). After changing to integer IDs, run `pnpm db:push` (or your migration) to apply the schema; existing UUID data will not be compatible and may need to be recreated.

## Validation

- All request bodies are validated with **Zod**.
- Invalid data is rejected with **400** and a JSON body describing validation errors.
- No `any` types; all input and response types are defined in TypeScript and exported from `lib/api-types.ts` and used in route handlers.
