# Programs API — quick reference

**Base URL:** use your deployed server (example: `https://your-host.example.com`). All paths below are relative to that base.

**Auth:** Sign in with `POST /api/auth/login` or `POST /api/auth/register`. The server sets an HTTP-only cookie named **`programs_session`**. Send that cookie on later requests (typical browser behavior). There is no API-key header in this app.

**Format:** Use `Content-Type: application/json` for bodies. Responses are JSON unless noted.

**Roles:** Users are **`ADMIN`** or **`STAFF`**.

- **Read** most data (`GET`), and **update** departments/programs/semesters/terms (`PUT`): any signed-in user.
- **Create** or **delete** departments, programs, calendar semesters, or term links: **`ADMIN` only**.
- **Courses:** **`GET` / `POST` / `PUT`**: any signed-in user. **`DELETE` course**: **`ADMIN` only**.
- **Permission requests:** **`STAFF`** can submit; **`ADMIN`** reviews.

If you are not logged in → **401**. If your role is not allowed → **403**.

More detail on bodies and errors: **[docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md)** (if included with the project).

---

## Authentication

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/auth/register` | Sign up. First user in the database becomes admin. Sets session cookie. |
| POST | `/api/auth/login` | Email + password. Sets session cookie. |
| POST | `/api/auth/logout` | Clears session. |
| GET | `/api/auth/me` | Current user (needs cookie). |

**Google / GitHub (browser only):** redirect users to `GET /api/auth/oauth/google` or `GET /api/auth/oauth/github`. Optional query: `?returnTo=/some-path`. Callback URLs are `/api/auth/oauth/google/callback` and `/api/auth/oauth/github/callback` — these must match what is configured in Google/GitHub.

---

## Departments

| Method | Path |
|--------|------|
| GET | `/api/departments` — list |
| POST | `/api/departments` — create (admin) |
| GET | `/api/departments/:id` |
| PUT | `/api/departments/:id` |
| DELETE | `/api/departments/:id` — admin; blocked if programs still use it |

---

## Programs

| Method | Path |
|--------|------|
| GET | `/api/programs` — list; optional `?department_id=` |
| POST | `/api/programs` — create (admin) |
| GET | `/api/programs/:id` |
| PUT | `/api/programs/:id` |
| DELETE | `/api/programs/:id` — admin; blocked if program still has courses |
| GET | `/api/programs/:id/curriculum` — full curriculum (semesters, courses, elective groups) |

---

## Courses

| Method | Path |
|--------|------|
| GET | `/api/courses` — list |
| POST | `/api/courses` — create |
| GET | `/api/courses/:id` |
| PUT | `/api/courses/:id` — update |
| DELETE | `/api/courses/:id` — **admin only**; may fail if course is still linked to a term offering |

---

## Elective groups (per program semester)

| Method | Path |
|--------|------|
| POST | `/api/program-semesters/:id/elective-groups` — create a group on that curriculum semester |

---

## Semesters (calendar: year + fall/winter/summer)

| Method | Path |
|--------|------|
| GET | `/api/semesters` |
| POST | `/api/semesters` — admin |
| GET | `/api/semesters/:id` |
| PUT | `/api/semesters/:id` |
| DELETE | `/api/semesters/:id` — admin; blocked if used by term links |

---

## Terms (link a course to a calendar semester)

| Method | Path |
|--------|------|
| GET | `/api/terms` |
| POST | `/api/terms` — admin |
| GET | `/api/terms/:id` |
| PUT | `/api/terms/:id` |
| DELETE | `/api/terms/:id` — admin |

---

## Permission requests (staff asks admin to create/delete)

| Method | Path |
|--------|------|
| GET | `/api/permission-requests` — staff see their own; admin sees all |
| POST | `/api/permission-requests` — staff only; `module` + `action` (create/delete) |
| PUT | `/api/permission-requests/:id/review` — admin only; approve or reject |

---

## Common HTTP status codes

| Code | Meaning (short) |
|------|------------------|
| 200 | OK |
| 201 | Created |
| 204 | Success, no body (some deletes) |
| 400 | Bad request / validation |
| 401 | Not signed in |
| 403 | Not allowed for your role |
| 404 | Not found |
| 500 | Server error |
