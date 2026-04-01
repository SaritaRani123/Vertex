# API endpoints — quick reference

Single-page index of all REST routes in Vertex. **Base URL (local):** `http://localhost:3000`

For request/response bodies, validation rules, delete constraints, and error shapes, see **[docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md)**.

---

## Conventions

| Item | Detail |
|------|--------|
| **Session** | HTTP-only cookie **`programs_session`**, set by **login** or **register**, cleared by **logout**. |
| **JSON** | Use `Content-Type: application/json` for bodies unless noted. |
| **Scheduling modules** | `/api/departments`, `/api/programs`, `/api/courses`, `/api/semesters`, `/api/terms` — see [Scheduling APIs access](#scheduling-apis-access). |

### Scheduling APIs access

| Methods | Who |
|---------|-----|
| `GET`, `PUT` | Any signed-in user (`ADMIN` or `STAFF`) |
| `POST`, `DELETE` | **`ADMIN` only** (staff get **403**) |

Unauthenticated calls → **401**.

---

## 1. Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | No | Register user; first user in DB is `ADMIN`; sets session cookie. |
| `POST` | `/api/auth/login` | No | Email + password; sets session cookie. |
| `POST` | `/api/auth/logout` | Optional | Ends session; clears cookie. |
| `GET` | `/api/auth/me` | **Required** | Current user (`id`, `email`, `name`, `role`). |

---

## 2. Departments

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/departments` | List all (`{ "data": [...] }`). |
| `POST` | `/api/departments` | Create (**ADMIN**). |
| `GET` | `/api/departments/:id` | Get one. |
| `PUT` | `/api/departments/:id` | Update. |
| `DELETE` | `/api/departments/:id` | Delete (**ADMIN**); blocked if department has programs. |

---

## 3. Programs

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/programs` | List (`{ "data": [...] }`). Query: **`?department_id=<int>`** optional filter. |
| `POST` | `/api/programs` | Create (**ADMIN**). |
| `GET` | `/api/programs/:id` | Get one. |
| `PUT` | `/api/programs/:id` | Partial update. |
| `DELETE` | `/api/programs/:id` | Delete (**ADMIN**); blocked if program has courses. |

---

## 4. Courses

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/courses` | List all. |
| `POST` | `/api/courses` | Create (**ADMIN**). |
| `GET` | `/api/courses/:id` | Get one. |
| `PUT` | `/api/courses/:id` | Partial update. |
| `DELETE` | `/api/courses/:id` | Delete (**ADMIN**); **200** + message; strips prerequisite refs; blocked if assigned to terms. |

---

## 5. Semesters

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/semesters` | List all. |
| `POST` | `/api/semesters` | Create (**ADMIN**). |
| `GET` | `/api/semesters/:id` | Get one. |
| `PUT` | `/api/semesters/:id` | Partial update. |
| `DELETE` | `/api/semesters/:id` | Delete (**ADMIN**); blocked if semester has term rows. |

---

## 6. Terms (course–semester links)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/terms` | List assignments (includes semester year/type, course name/code on list items). |
| `POST` | `/api/terms` | Create (**ADMIN**). |
| `GET` | `/api/terms/:id` | Get one. |
| `PUT` | `/api/terms/:id` | Partial update. |
| `DELETE` | `/api/terms/:id` | Delete assignment (**ADMIN**). |

---

## 7. Permission requests (staff ↔ admin)

| Method | Path | Who | Description |
|--------|------|-----|-------------|
| `GET` | `/api/permission-requests` | Signed in | **ADMIN:** all requests. **STAFF:** own only. |
| `POST` | `/api/permission-requests` | **STAFF** | Submit create/delete request for a module. |
| `PUT` | `/api/permission-requests/:id/review` | **ADMIN** | Approve or reject pending request. |

---

## Status codes (short)

| Code | Typical use |
|------|-------------|
| **200** | OK (GET, PUT); course DELETE returns JSON body. |
| **201** | Created (POST scheduling resources, register, permission request create). |
| **204** | No content (**DELETE** except course — course uses **200**). |
| **400** | Validation / business rule (`VALIDATION_ERROR` + optional `details`). |
| **401** | Not signed in (`UNAUTHORIZED`). |
| **403** | Signed in but not allowed (`FORBIDDEN`). |
| **404** | Not found (`NOT_FOUND`). |
| **500** | Server error (`INTERNAL_ERROR`). |

---

## Related files

| Area | Location |
|------|----------|
| Route handlers | `app/api/**/route.ts` |
| Session & roles | `lib/auth.ts` |
| JSON helpers / errors | `lib/api-utils.ts` |
| Shared types | `lib/api-types.ts` |
| Zod schemas | `lib/validations/` |
