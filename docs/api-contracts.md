# KesselOps — Complete API Contracts

> **Version:** 1.0 · **Base URL:** `http://localhost:8080/api`
> **Auth:** All endpoints (except `/api/auth/*`) require `Authorization: Bearer <JWT>`
> **Content-Type:** `application/json` (unless stated otherwise)
>
> Related docs:
> - [`domain-model.md`](./domain-model.md) — Entity definitions (35 entities, 23 enums)
> - [`system-design.md`](./system-design.md) — Architecture & tech stack
> - [`feature-analysis-kano.md`](./feature-analysis-kano.md) — KANO model & sponsor alignment

---

## Response Envelope (All Endpoints)

```json
// Success
{
  "success": true,
  "data": { ... },
  "message": "Operation completed",
  "timestamp": "2026-02-09T14:30:00Z"
}

// Error
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Shift with id 42 not found",
    "field": null
  },
  "timestamp": "2026-02-09T14:30:00Z"
}

// Paginated
{
  "success": true,
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 20,
    "totalElements": 142,
    "totalPages": 8
  },
  "timestamp": "2026-02-09T14:30:00Z"
}
```

### Common Query Parameters (Paginated Endpoints)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | `0` | Zero-based page index |
| `size` | int | `20` | Page size (max 100) |
| `sort` | string | varies | Sort field + direction, e.g. `createdAt,desc` |

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK — successful GET, PUT, PATCH |
| `201` | Created — successful POST |
| `204` | No Content — successful DELETE |
| `400` | Bad Request — validation failure |
| `401` | Unauthorized — missing/invalid JWT |
| `403` | Forbidden — insufficient role |
| `404` | Not Found — resource doesn't exist |
| `409` | Conflict — business rule violation (e.g. shift overlap) |
| `422` | Unprocessable Entity — semantically invalid (e.g. close already-closed check) |
| `500` | Internal Server Error |

---

## Table of Contents

- [AUTH — Authentication & Session](#auth--authentication--session)
- [Service A — Operations](#service-a--operations-comkesselopsoperations)
  - [A1: Users](#a1-users)
  - [A2: Venues](#a2-venues)
  - [A3: Shifts](#a3-shifts)
  - [A4: Shift Assignments](#a4-shift-assignments)
  - [A5: Shift Handovers](#a5-shift-handovers)
  - [A6: Checklists](#a6-checklists)
  - [A7: Task Items](#a7-task-items)
  - [A8: Photo Proofs](#a8-photo-proofs)
  - [A9: Training Modules](#a9-training-modules)
  - [A10: Staff Progress](#a10-staff-progress)
- [Service B — Inventory & Prediction](#service-b--inventory--prediction-comkesselopsinventory)
  - [B1: Products](#b1-products)
  - [B2: Suppliers](#b2-suppliers)
  - [B3: Supplier Products](#b3-supplier-products)
  - [B4: Stock Logs](#b4-stock-logs)
  - [B5: Orders](#b5-orders)
  - [B6: Order Items](#b6-order-items)
  - [B7: Predictions & Weather](#b7-predictions--weather)
- [Service C — Digital Menu](#service-c--digital-menu-comkesselopsmenu)
  - [C1: Menu Items](#c1-menu-items)
  - [C2: Recipes](#c2-recipes)
  - [C3: Recipe Ingredients](#c3-recipe-ingredients)
  - [C4: Menu Syndication](#c4-menu-syndication)
- [Service D — Guest Experience](#service-d--guest-experience-comkesselopsguest)
  - [D1: Guest Profiles](#d1-guest-profiles)
  - [D2: Reservations](#d2-reservations)
  - [D3: Guest Evaluations](#d3-guest-evaluations)
  - [D4: Guest Checks](#d4-guest-checks)
  - [D5: Guest Check Items](#d5-guest-check-items)
- [Service E — Social & Marketing](#service-e--social--marketing-comkesselopssocial)
  - [E1: Social Posts](#e1-social-posts)
  - [E2: Media](#e2-media)
  - [E3: Review Responses](#e3-review-responses)
- [Service F — AI Configuration](#service-f--ai-configuration-comkesselopsai)
  - [F1: Prompt Templates](#f1-prompt-templates)
  - [F2: AI Generation (Orchestration)](#f2-ai-generation-orchestration)
  - [F3: AI Usage Logs](#f3-ai-usage-logs)
- [Cross-Domain Internal Calls](#cross-domain-internal-calls-service-to-service)
- [WebSocket Endpoints](#websocket-endpoints)
- [API Count Summary](#api-count-summary)

---

---

## AUTH — Authentication & Session

> **Controller:** `AuthController.java` (in `com.kesselops.shared.security`)
> **Purpose:** User authentication, token management, session info.

---

### `POST /api/auth/register`

**Purpose:** Register a new user account (Owner self-registration, or Manager inviting staff).

**Auth:** None (for owner self-registration) OR `OWNER`/`MANAGER` (for inviting staff).

**Request Body:**
```json
{
  "firstName": "Max",
  "lastName": "Müller",
  "email": "max@oscho-bar.de",
  "password": "securePass123!",
  "role": "STAFF",
  "phone": "+49 170 1234567",
  "venueId": 1
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 5,
    "firstName": "Max",
    "lastName": "Müller",
    "email": "max@oscho-bar.de",
    "role": "STAFF",
    "venueId": 1,
    "isActive": true,
    "createdAt": "2026-02-09T10:00:00Z"
  }
}
```

**Validation:**
- `email` — unique, valid format
- `password` — min 8 chars, 1 uppercase, 1 digit
- `role` — one of: `OWNER`, `MANAGER`, `STAFF`, `TRAINEE`
- `venueId` — required for `STAFF`/`TRAINEE`, must exist

---

### `POST /api/auth/login`

**Purpose:** Authenticate user and receive JWT tokens.

**Auth:** None.

**Request Body:**
```json
{
  "email": "max@oscho-bar.de",
  "password": "securePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g...",
    "expiresIn": 3600,
    "tokenType": "Bearer",
    "user": {
      "id": 5,
      "firstName": "Max",
      "lastName": "Müller",
      "email": "max@oscho-bar.de",
      "role": "STAFF",
      "venueId": 1,
      "isActive": true
    }
  }
}
```

**Error:** `401` if credentials invalid, `403` if account deactivated.

---

### `POST /api/auth/refresh`

**Purpose:** Refresh an expired access token using a valid refresh token.

**Auth:** None (refresh token in body).

**Request Body:**
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...(new)...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g...(rotated)...",
    "expiresIn": 3600
  }
}
```

---

### `POST /api/auth/logout`

**Purpose:** Invalidate the current refresh token (server-side blacklist).

**Auth:** Bearer token.

**Request Body:**
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g..."
}
```

**Response:** `204 No Content`

---

### `GET /api/auth/me`

**Purpose:** Get currently authenticated user's profile.

**Auth:** Bearer token.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 5,
    "firstName": "Max",
    "lastName": "Müller",
    "email": "max@oscho-bar.de",
    "role": "STAFF",
    "phone": "+49 170 1234567",
    "venueId": 1,
    "venue": {
      "id": 1,
      "name": "OSCHO Café & Bar",
      "type": "BAR"
    },
    "isActive": true,
    "createdAt": "2026-02-09T10:00:00Z"
  }
}
```

---

### `PUT /api/auth/change-password`

**Purpose:** Change the authenticated user's password.

**Auth:** Bearer token.

**Request Body:**
```json
{
  "currentPassword": "oldPass123!",
  "newPassword": "newSecurePass456!"
}
```

**Response:** `200 OK`

---

---

## Service A — Operations (`com.kesselops.operations`)

> **Entities:** User, Role, Venue, Shift, ShiftType, ShiftAssignment, AssignmentStatus, ShiftHandover, Checklist, ChecklistCategory, TaskItem, TaskStatus, PhotoProof, TrainingModule, TrainingType, StaffProgress, ProgressStatus
>
> **Controllers:** UserController, VenueController, ShiftController, ChecklistController, HandoverController, TrainingController

---

### A1: Users

> **Controller:** `UserController.java`
> **Purpose:** CRUD operations on staff users. Owners manage all users; managers manage their venue's staff.

---

#### `GET /api/users`

**Purpose:** List all users. Paginated. Filterable by venue, role, active status.

**Auth:** `OWNER`, `MANAGER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Filter by venue |
| `role` | String | Filter by role: `OWNER`, `MANAGER`, `STAFF`, `TRAINEE` |
| `isActive` | Boolean | Filter by active status |
| `search` | String | Search by firstName, lastName, or email (partial match) |
| `page`, `size`, `sort` | — | Pagination |

**Response:** `200 OK` — Paginated list of users.

---

#### `GET /api/users/{id}`

**Purpose:** Get a single user by ID. Includes their venue info.

**Auth:** `OWNER`, `MANAGER`, or the user themselves.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 5,
    "firstName": "Max",
    "lastName": "Müller",
    "email": "max@oscho-bar.de",
    "role": "STAFF",
    "phone": "+49 170 1234567",
    "venueId": 1,
    "isActive": true,
    "createdAt": "2026-02-09T10:00:00Z",
    "updatedAt": "2026-02-09T10:00:00Z"
  }
}
```

---

#### `PUT /api/users/{id}`

**Purpose:** Update user details (name, phone, role). Email change not allowed.

**Auth:** `OWNER`, `MANAGER` (for their venue's staff), or the user themselves (name/phone only).

**Request Body:**
```json
{
  "firstName": "Maximilian",
  "lastName": "Müller",
  "phone": "+49 170 9999999",
  "role": "MANAGER"
}
```

**Response:** `200 OK` — Updated user object.

---

#### `PATCH /api/users/{id}/deactivate`

**Purpose:** Soft-delete a user (set `isActive = false`). Does NOT delete. User can no longer log in.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { "id": 5, "isActive": false },
  "message": "User deactivated"
}
```

---

#### `PATCH /api/users/{id}/activate`

**Purpose:** Re-activate a previously deactivated user.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`

---

### A2: Venues

> **Controller:** `VenueController.java`
> **Purpose:** Manage venue (restaurant/bar/café) profiles. Foundation entity — almost everything is venue-scoped.

---

#### `POST /api/venues`

**Purpose:** Create a new venue. Only owners can create venues.

**Auth:** `OWNER`

**Request Body:**
```json
{
  "name": "OSCHO Café & Bar",
  "address": "Theodor-Heuss-Straße 4",
  "city": "Stuttgart",
  "type": "BAR",
  "timezone": "Europe/Berlin"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "OSCHO Café & Bar",
    "address": "Theodor-Heuss-Straße 4",
    "city": "Stuttgart",
    "type": "BAR",
    "timezone": "Europe/Berlin",
    "createdAt": "2026-02-09T10:00:00Z"
  }
}
```

---

#### `GET /api/venues`

**Purpose:** List all venues the authenticated user has access to.

**Auth:** `OWNER` (all their venues), `MANAGER`/`STAFF`/`TRAINEE` (only their assigned venue).

**Response:** `200 OK` — Array of venue objects.

---

#### `GET /api/venues/{id}`

**Purpose:** Get a single venue with details.

**Auth:** User must belong to this venue (or be `OWNER`).

**Response:** `200 OK` — Venue object.

---

#### `PUT /api/venues/{id}`

**Purpose:** Update venue details.

**Auth:** `OWNER`

**Request Body:** Same structure as POST (partial update supported).

**Response:** `200 OK` — Updated venue object.

---

#### `GET /api/venues/{id}/staff`

**Purpose:** List all active staff members for this venue.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    { "id": 5, "firstName": "Max", "lastName": "Müller", "role": "STAFF", "isActive": true },
    { "id": 6, "firstName": "Lisa", "lastName": "Schmidt", "role": "MANAGER", "isActive": true }
  ]
}
```

---

#### `GET /api/venues/{id}/dashboard`

**Purpose:** Get a dashboard summary for this venue — today's shift, active checklists, low-stock alerts, open guest checks.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "venueId": 1,
    "venueName": "OSCHO Café & Bar",
    "activeShift": { "id": 12, "type": "EVENING", "staffCount": 4 },
    "checklistsToday": { "total": 3, "completed": 1, "pending": 2 },
    "lowStockAlerts": 3,
    "openGuestChecks": 5,
    "revenueToday": 1240.50,
    "pendingReservations": 4
  }
}
```

**Internal Calls:** This endpoint internally calls:
- `ShiftService.getActiveShift(venueId)`
- `ChecklistService.getTodaySummary(venueId)`
- `ProductService.getLowStockCount(venueId)` (cross-domain → Inventory)
- `GuestCheckService.getOpenCheckCount(venueId)` (cross-domain → Guest)
- `GuestCheckService.getRevenueToday(venueId)` (cross-domain → Guest)
- `ReservationService.getPendingCount(venueId)` (cross-domain → Guest)

---

### A3: Shifts

> **Controller:** `ShiftController.java`
> **Purpose:** Create, view, and manage shifts. Shifts are the core time unit of operations.

---

#### `POST /api/shifts`

**Purpose:** Create a new shift for a venue.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "venueId": 1,
  "startTime": "2026-02-09T17:00:00Z",
  "endTime": "2026-02-10T01:00:00Z",
  "type": "EVENING",
  "notes": "Valentine's week — expect high traffic"
}
```

**Validation:**
- `startTime` must be before `endTime`
- `type` — one of: `MORNING`, `AFTERNOON`, `EVENING`, `NIGHT`
- No overlapping shifts of same type at same venue

**Response:** `201 Created` — Shift object with `id`.

---

#### `GET /api/shifts`

**Purpose:** List shifts. Paginated. Filterable by venue, date range, type.

**Auth:** `OWNER`, `MANAGER`, `STAFF` (own venue only)

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required. Filter by venue |
| `from` | DateTime | Start of date range (inclusive) |
| `to` | DateTime | End of date range (inclusive) |
| `type` | String | Filter by shift type |
| `page`, `size`, `sort` | — | Pagination (default sort: `startTime,asc`) |

**Response:** `200 OK` — Paginated list of shifts.

---

#### `GET /api/shifts/{id}`

**Purpose:** Get a single shift with all details including assigned staff, checklists, and handover.

**Auth:** User must belong to the shift's venue.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 12,
    "venueId": 1,
    "startTime": "2026-02-09T17:00:00Z",
    "endTime": "2026-02-10T01:00:00Z",
    "type": "EVENING",
    "notes": "Valentine's week — expect high traffic",
    "isActive": true,
    "durationHours": 8.0,
    "createdAt": "2026-02-08T12:00:00Z",
    "assignments": [
      { "id": 20, "userId": 5, "userName": "Max Müller", "role": "STAFF", "status": "CONFIRMED" },
      { "id": 21, "userId": 6, "userName": "Lisa Schmidt", "role": "MANAGER", "status": "CONFIRMED" }
    ],
    "checklists": [
      { "id": 30, "category": "OPENING", "title": "Opening Checklist", "isCompleted": true, "completionPercentage": 100.0 },
      { "id": 31, "category": "HACCP", "title": "HACCP Hygiene Check", "isCompleted": false, "completionPercentage": 40.0 }
    ],
    "handover": null
  }
}
```

---

#### `PUT /api/shifts/{id}`

**Purpose:** Update shift details (times, type, notes). Cannot change venue.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "startTime": "2026-02-09T16:00:00Z",
  "endTime": "2026-02-10T02:00:00Z",
  "type": "EVENING",
  "notes": "Updated: extended by 1 hour"
}
```

**Response:** `200 OK` — Updated shift object.

---

#### `DELETE /api/shifts/{id}`

**Purpose:** Delete a shift. Only if no checklists or guest checks are linked.

**Auth:** `OWNER`, `MANAGER`

**Response:** `204 No Content`

**Error:** `409 Conflict` if shift has linked checklists, guest checks, or handovers.

---

#### `GET /api/shifts/active`

**Purpose:** Get the currently active shift for a venue (where now() is between startTime and endTime).

**Auth:** Any authenticated user in that venue.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required |

**Response:** `200 OK` — Single shift object (or `null` in data if no active shift).

---

#### `GET /api/shifts/{id}/revenue`

**Purpose:** Get total revenue generated during this shift.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "shiftId": 12,
    "totalRevenue": 2450.80,
    "totalChecks": 34,
    "averageCheckSize": 72.08,
    "totalTips": 198.50,
    "topSellingItems": [
      { "menuItemId": 10, "name": "Gin & Tonic", "quantitySold": 42 },
      { "menuItemId": 15, "name": "Barrel Old Fashioned", "quantitySold": 18 }
    ]
  }
}
```

**Internal Calls:** `GuestCheckService.getRevenueByShift(shiftId)` (cross-domain → Guest)

---

### A4: Shift Assignments

> **Controller:** `ShiftController.java` (nested under shifts)
> **Purpose:** Assign staff to shifts, track confirmation status.

---

#### `POST /api/shifts/{shiftId}/assignments`

**Purpose:** Assign a user to a shift. Creates assignment with `PENDING` status.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "userId": 5
}
```

**Validation:**
- User must belong to same venue as shift
- User must be active
- User must not already be assigned to an overlapping shift

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 20,
    "userId": 5,
    "shiftId": 12,
    "status": "PENDING",
    "assignedAt": "2026-02-08T12:00:00Z",
    "assignedBy": "Lisa Schmidt"
  }
}
```

---

#### `GET /api/shifts/{shiftId}/assignments`

**Purpose:** List all assignments for a shift.

**Auth:** User must belong to shift's venue.

**Response:** `200 OK` — Array of assignment objects with user details.

---

#### `PATCH /api/shifts/{shiftId}/assignments/{assignmentId}/confirm`

**Purpose:** Staff member confirms their shift assignment. Changes status `PENDING → CONFIRMED`.

**Auth:** The assigned user themselves, or `MANAGER`/`OWNER`.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": { "id": 20, "status": "CONFIRMED" },
  "message": "Shift assignment confirmed"
}
```

---

#### `PATCH /api/shifts/{shiftId}/assignments/{assignmentId}/decline`

**Purpose:** Staff member declines their shift assignment. Changes status `PENDING → DECLINED`.

**Auth:** The assigned user themselves, or `MANAGER`/`OWNER`.

**Request Body:**
```json
{
  "reason": "Sick leave"
}
```

**Response:** `200 OK`

---

#### `PATCH /api/shifts/{shiftId}/assignments/{assignmentId}/no-show`

**Purpose:** Mark an assigned staff member as no-show. Changes status `CONFIRMED → NO_SHOW`.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`

---

#### `DELETE /api/shifts/{shiftId}/assignments/{assignmentId}`

**Purpose:** Remove a shift assignment entirely.

**Auth:** `OWNER`, `MANAGER`

**Response:** `204 No Content`

---

#### `GET /api/users/{userId}/assignments`

**Purpose:** List all shift assignments for a specific user. Used for "My Shifts" view.

**Auth:** The user themselves, or `MANAGER`/`OWNER`.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `from` | DateTime | Start of date range |
| `to` | DateTime | End of date range |
| `status` | String | Filter by: `PENDING`, `CONFIRMED`, `DECLINED`, `NO_SHOW` |

**Response:** `200 OK` — Array of assignments with shift details embedded.

---

### A5: Shift Handovers

> **Controller:** `HandoverController.java`
> **Purpose:** Structured shift handover notes replacing WhatsApp chaos. Links outgoing shift to incoming shift.

---

#### `POST /api/shifts/{shiftId}/handover`

**Purpose:** Create a handover for the ending shift. Author is the current user.

**Auth:** `OWNER`, `MANAGER`, `STAFF` (if assigned to the shift)

**Request Body:**
```json
{
  "toShiftId": 13,
  "summary": "Busy night. 2 large parties. All checklists completed.",
  "openIssues": "Beer tap #3 leaking slightly. Dishwasher making noise.",
  "nextSteps": "Call technician for tap #3 in the morning. Check dishwasher filter."
}
```

**Validation:**
- `toShiftId` — must exist and belong to the same venue
- One handover per shift (no duplicates)

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 50,
    "fromShiftId": 12,
    "toShiftId": 13,
    "authorUserId": 6,
    "authorName": "Lisa Schmidt",
    "summary": "Busy night. 2 large parties. All checklists completed.",
    "openIssues": "Beer tap #3 leaking slightly. Dishwasher making noise.",
    "nextSteps": "Call technician for tap #3 in the morning. Check dishwasher filter.",
    "acknowledgedBy": null,
    "acknowledgedAt": null,
    "createdAt": "2026-02-10T01:05:00Z"
  }
}
```

---

#### `GET /api/shifts/{shiftId}/handover`

**Purpose:** Get the handover associated with this shift (as the outgoing shift).

**Auth:** User must belong to shift's venue.

**Response:** `200 OK` — Handover object (or `404` if none exists).

---

#### `GET /api/shifts/{shiftId}/incoming-handover`

**Purpose:** Get the handover created BY the previous shift FOR this shift. Used when staff opens their shift and wants to read what the previous crew left.

**Auth:** User must belong to shift's venue.

**Response:** `200 OK` — Handover object where `toShiftId = {shiftId}`.

---

#### `PATCH /api/handovers/{handoverId}/acknowledge`

**Purpose:** Incoming shift's staff acknowledges they've read the handover.

**Auth:** User must be assigned to the `toShift`.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 50,
    "acknowledgedBy": { "id": 7, "name": "Tom Weber" },
    "acknowledgedAt": "2026-02-10T05:10:00Z"
  },
  "message": "Handover acknowledged"
}
```

---

### A6: Checklists

> **Controller:** `ChecklistController.java`
> **Purpose:** Manage checklists (OPENING, CLOSING, HACCP, HANDOVER, EMERGENCY) per shift.

---

#### `POST /api/shifts/{shiftId}/checklists`

**Purpose:** Create a new checklist for a shift.

**Auth:** `OWNER`, `MANAGER`, `STAFF` (if assigned to shift)

**Request Body:**
```json
{
  "category": "HACCP",
  "title": "Evening HACCP Hygiene Check"
}
```

**Validation:**
- `category` — one of: `OPENING`, `CLOSING`, `HANDOVER`, `HACCP`, `EMERGENCY`
- Maximum 1 checklist per category per shift (except `EMERGENCY`)

**Response:** `201 Created` — Checklist object with `id`, `isCompleted: false`, `completionPercentage: 0.0`.

---

#### `GET /api/shifts/{shiftId}/checklists`

**Purpose:** List all checklists for a shift.

**Auth:** User must belong to shift's venue.

**Response:** `200 OK` — Array of checklist objects with completion percentages.

---

#### `GET /api/checklists/{id}`

**Purpose:** Get a single checklist with all its task items.

**Auth:** User must belong to checklist's venue.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 30,
    "shiftId": 12,
    "category": "HACCP",
    "title": "Evening HACCP Hygiene Check",
    "isCompleted": false,
    "completionPercentage": 40.0,
    "createdAt": "2026-02-09T17:00:00Z",
    "tasks": [
      {
        "id": 100,
        "description": "Check fridge temperature (must be ≤ 7°C)",
        "status": "DONE",
        "sortOrder": 1,
        "requiresPhoto": true,
        "completedAt": "2026-02-09T17:15:00Z",
        "completedByUserId": 5,
        "completedByName": "Max Müller",
        "photoProof": { "id": 200, "fileUrl": "https://s3.../fridge-temp.jpg" }
      },
      {
        "id": 101,
        "description": "Sanitize cutting boards",
        "status": "NOT_DONE",
        "sortOrder": 2,
        "requiresPhoto": false,
        "completedAt": null,
        "photoProof": null
      }
    ]
  }
}
```

---

#### `PATCH /api/checklists/{id}/complete`

**Purpose:** Mark checklist as completed (only if all required tasks are DONE).

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Response:** `200 OK` or `422` if not all required tasks are completed.

---

#### `DELETE /api/checklists/{id}`

**Purpose:** Delete an empty checklist (no tasks). Used if created by mistake.

**Auth:** `OWNER`, `MANAGER`

**Response:** `204 No Content`

---

### A7: Task Items

> **Controller:** `ChecklistController.java` (nested under checklists)
> **Purpose:** Individual tasks within a checklist. The atomic unit of work tracking.

---

#### `POST /api/checklists/{checklistId}/tasks`

**Purpose:** Add a new task to a checklist.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "description": "Check fridge temperature (must be ≤ 7°C)",
  "sortOrder": 1,
  "requiresPhoto": true
}
```

**Response:** `201 Created` — TaskItem with `status: "NOT_DONE"`.

---

#### `POST /api/checklists/{checklistId}/tasks/batch`

**Purpose:** Add multiple tasks at once (for template-based checklist creation).

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "tasks": [
    { "description": "Check fridge temperature", "sortOrder": 1, "requiresPhoto": true },
    { "description": "Sanitize cutting boards", "sortOrder": 2, "requiresPhoto": false },
    { "description": "Verify fire exits clear", "sortOrder": 3, "requiresPhoto": false }
  ]
}
```

**Response:** `201 Created` — Array of created TaskItems.

---

#### `PATCH /api/tasks/{taskId}/complete`

**Purpose:** Mark a task as done. Records who completed it and when.

**Auth:** `OWNER`, `MANAGER`, `STAFF`, `TRAINEE`

**Request Body (optional):**
```json
{
  "photoProofId": 200
}
```

**Validation:**
- If `requiresPhoto == true`, then `photoProofId` must be provided.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 100,
    "status": "DONE",
    "completedAt": "2026-02-09T17:15:00Z",
    "completedByUserId": 5,
    "completedByName": "Max Müller"
  }
}
```

---

#### `PATCH /api/tasks/{taskId}/skip`

**Purpose:** Skip a task with a reason. Sets status to `SKIPPED`.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "reason": "Fridge out of service today"
}
```

**Response:** `200 OK`

---

#### `PATCH /api/tasks/{taskId}/reset`

**Purpose:** Reset a task back to `NOT_DONE` (undo completion).

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`

---

### A8: Photo Proofs

> **Controller:** `ChecklistController.java` (photo upload sub-resource)
> **Purpose:** Upload photo evidence for HACCP compliance and task completion.

---

#### `POST /api/photo-proofs`

**Purpose:** Upload a photo proof image. Returns the stored photo metadata with URL.

**Auth:** `OWNER`, `MANAGER`, `STAFF`, `TRAINEE`

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | Image file (JPEG, PNG). Max 10MB. |

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 200,
    "fileUrl": "https://s3.../photo-proofs/2026/02/09/abc123.jpg",
    "mimeType": "image/jpeg",
    "fileSizeBytes": 245000,
    "uploadedAt": "2026-02-09T17:14:00Z",
    "uploadedByUserId": 5
  }
}
```

---

#### `GET /api/photo-proofs/{id}`

**Purpose:** Get photo proof metadata (including URL to download/view the image).

**Auth:** User must belong to the same venue.

**Response:** `200 OK` — PhotoProof object.

---

### A9: Training Modules

> **Controller:** `TrainingController.java`
> **Purpose:** Manage training/onboarding modules. Can be manually created or AI-generated.

---

#### `POST /api/training/modules`

**Purpose:** Create a new training module.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "title": "Bar Service Basics",
  "description": "Introduction to cocktail preparation, POS workflow, and guest interaction",
  "targetRole": "TRAINEE",
  "type": "ONBOARDING",
  "contentJson": "{ \"steps\": [...] }",
  "estimatedMinutes": 30,
  "sortOrder": 1,
  "isAIGenerated": false
}
```

**Validation:**
- `targetRole` — one of: `OWNER`, `MANAGER`, `STAFF`, `TRAINEE`
- `type` — one of: `ONBOARDING`, `HYGIENE`, `SAFETY`, `BEVERAGE`, `SERVICE`, `CHECKLIST_GUIDE`

**Response:** `201 Created` — TrainingModule object.

---

#### `POST /api/training/modules/generate`

**Purpose:** AI-generate a training module based on role, venue type, and training type. Calls AI Orchestration internally.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "targetRole": "TRAINEE",
  "type": "ONBOARDING",
  "venueId": 1
}
```

**Response:** `201 Created` — AI-generated TrainingModule with `isAIGenerated: true`.

**Internal Calls:** `AIOrchestrationService.generate(category=ONBOARDING_GUIDE, variables)` (cross-domain → AI)

---

#### `GET /api/training/modules`

**Purpose:** List all training modules. Filterable by role and type.

**Auth:** `OWNER`, `MANAGER`, `STAFF`, `TRAINEE`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `targetRole` | String | Filter by target role |
| `type` | String | Filter by training type |
| `venueId` | Long | Filter by venue |

**Response:** `200 OK` — Array of TrainingModule objects.

---

#### `GET /api/training/modules/{id}`

**Purpose:** Get a single training module with full content.

**Auth:** Any authenticated user.

**Response:** `200 OK` — Full TrainingModule object including `contentJson`.

---

#### `PUT /api/training/modules/{id}`

**Purpose:** Update a training module.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK` — Updated module.

---

#### `DELETE /api/training/modules/{id}`

**Purpose:** Delete a training module. Fails if staff progress records exist for it.

**Auth:** `OWNER`

**Response:** `204 No Content`

---

### A10: Staff Progress

> **Controller:** `TrainingController.java` (sub-resource of training)
> **Purpose:** Track individual staff member's progress through training modules.

---

#### `POST /api/training/progress`

**Purpose:** Start tracking a user's progress on a training module.

**Auth:** The user themselves, or `MANAGER`/`OWNER`.

**Request Body:**
```json
{
  "userId": 5,
  "trainingModuleId": 10
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 60,
    "userId": 5,
    "trainingModuleId": 10,
    "status": "NOT_STARTED",
    "completionPercent": 0,
    "startedAt": null,
    "completedAt": null,
    "quizScore": null
  }
}
```

---

#### `PATCH /api/training/progress/{id}/start`

**Purpose:** Mark training as started. Sets status to `IN_PROGRESS`.

**Auth:** The user themselves.

**Response:** `200 OK` — Updated progress with `startedAt` set.

---

#### `PATCH /api/training/progress/{id}/update`

**Purpose:** Update completion percentage (for incremental progress tracking).

**Auth:** The user themselves.

**Request Body:**
```json
{
  "completionPercent": 75
}
```

**Response:** `200 OK`

---

#### `PATCH /api/training/progress/{id}/complete`

**Purpose:** Mark training as completed. Records quiz score if applicable.

**Auth:** The user themselves.

**Request Body:**
```json
{
  "quizScore": 85
}
```

**Response:** `200 OK` — Status set to `COMPLETED`, `completedAt` set.

---

#### `GET /api/training/progress/user/{userId}`

**Purpose:** Get all training progress for a specific user.

**Auth:** The user themselves, or `MANAGER`/`OWNER`.

**Response:** `200 OK` — Array of StaffProgress objects with module titles embedded.

---

#### `GET /api/training/progress/module/{moduleId}`

**Purpose:** Get all staff progress for a specific module (who's completed, who's behind).

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK` — Array of StaffProgress objects with user names.

---

---

## Service B — Inventory & Prediction (`com.kesselops.inventory`)

> **Entities:** Product, ProductCategory, Supplier, SupplierType, SupplierProduct, StockLog, StockLogType, Order, OrderStatus, OrderItem, PredictiveEngine, WeatherForecast, StockPrediction, ConsumptionTrend
>
> **Controllers:** ProductController, SupplierController, OrderController, PredictionController

---

### B1: Products

> **Controller:** `ProductController.java`
> **Purpose:** Manage the inventory product catalog. Products are what you STOCK (bottles, kegs, ingredients).

---

#### `POST /api/products`

**Purpose:** Add a new product to inventory.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "name": "Hendrick's Gin 700ml",
  "sku": "GIN-HEND-700",
  "category": "SPIRITS",
  "unit": "bottle",
  "currentQuantity": 12.0,
  "reorderLevel": 3.0,
  "reorderQuantity": 6.0,
  "unitPrice": 28.50,
  "venueId": 1
}
```

**Validation:**
- `sku` — unique within venue
- `category` — one of: `SPIRITS`, `WINE`, `BEER`, `COCKTAIL_KEG`, `SOFT_DRINKS`, `BOTANICAL_BOOSTER`, `FOOD_INGREDIENT`, `CONSUMABLE`
- `reorderLevel` ≥ 0
- `unitPrice` > 0

**Response:** `201 Created` — Product object.

---

#### `GET /api/products`

**Purpose:** List all products. Paginated, filterable.

**Auth:** `OWNER`, `MANAGER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required. Filter by venue |
| `category` | String | Filter by product category |
| `isActive` | Boolean | Filter by active status (default `true`) |
| `search` | String | Search by name or SKU |
| `page`, `size`, `sort` | — | Pagination (default sort: `name,asc`) |

**Response:** `200 OK` — Paginated product list.

---

#### `GET /api/products/{id}`

**Purpose:** Get a single product with all details.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK` — Product object.

---

#### `PUT /api/products/{id}`

**Purpose:** Update product details (name, reorder levels, price, etc.).

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`

---

#### `PATCH /api/products/{id}/deactivate`

**Purpose:** Soft-deactivate a product (no longer in use, but keep history).

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`

---

#### `GET /api/products/low-stock`

**Purpose:** List all products where `currentQuantity ≤ reorderLevel`.

**Auth:** `OWNER`, `MANAGER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "name": "Hendrick's Gin 700ml",
      "currentQuantity": 2.0,
      "reorderLevel": 3.0,
      "reorderQuantity": 6.0,
      "unit": "bottle",
      "category": "SPIRITS",
      "daysUntilStockout": 3
    }
  ]
}
```

**Internal Calls:** `PredictiveEngineService.estimateDaysUntilStockout(productId)` for `daysUntilStockout`.

---

#### `POST /api/products/{id}/consume`

**Purpose:** Manually log consumption of a product. Creates a `StockLog(CONSUMPTION)`.

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Request Body:**
```json
{
  "quantity": 2.0,
  "reason": "Spillage during setup",
  "shiftId": 12
}
```

**Response:** `200 OK` — Updated product with new `currentQuantity`.

**Side Effects:**
- Creates `StockLog` with `type=CONSUMPTION`
- Pushes WebSocket event if stock drops below `reorderLevel`

---

#### `POST /api/products/{id}/restock`

**Purpose:** Log a restock (delivery received). Creates a `StockLog(RESTOCK)`.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "quantity": 6.0,
  "reason": "UNIBEV delivery received",
  "shiftId": 12
}
```

**Response:** `200 OK` — Updated product with new `currentQuantity`.

---

#### `POST /api/products/{id}/waste`

**Purpose:** Log waste/breakage. Creates a `StockLog(WASTE)`.

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Request Body:**
```json
{
  "quantity": 1.0,
  "reason": "Bottle dropped and shattered",
  "shiftId": 12
}
```

**Response:** `200 OK`

---

### B2: Suppliers

> **Controller:** `SupplierController.java`
> **Purpose:** Manage suppliers (UNIBEV, meincocktailfass, etc.) and their contact info.

---

#### `POST /api/suppliers`

**Purpose:** Add a new supplier.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "name": "UNIBEV GmbH",
  "contactPerson": "Sidney Blum",
  "email": "orders@unibev.de",
  "phone": "+49 711 555 1234",
  "address": "Industriestr. 15, 70565 Stuttgart",
  "type": "BEVERAGE_DISTRIBUTOR",
  "isPreferred": true
}
```

**Validation:**
- `type` — one of: `BEVERAGE_DISTRIBUTOR`, `FOOD_WHOLESALER`, `COCKTAIL_KEG_PROVIDER`, `CONSUMABLE_SUPPLIER`

**Response:** `201 Created` — Supplier object.

---

#### `GET /api/suppliers`

**Purpose:** List all suppliers. Filterable by type and preferred status.

**Auth:** `OWNER`, `MANAGER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `type` | String | Filter by supplier type |
| `isPreferred` | Boolean | Filter by preferred status |
| `search` | String | Search by name |

**Response:** `200 OK` — Array of suppliers.

---

#### `GET /api/suppliers/{id}`

**Purpose:** Get a single supplier with all their products.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK` — Supplier object with embedded `supplierProducts[]`.

---

#### `PUT /api/suppliers/{id}`

**Purpose:** Update supplier details.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`

---

#### `DELETE /api/suppliers/{id}`

**Purpose:** Delete supplier. Fails if open orders exist.

**Auth:** `OWNER`

**Response:** `204 No Content`

---

### B3: Supplier Products

> **Controller:** `SupplierController.java` (sub-resource)
> **Purpose:** Map which products each supplier offers, at what price, with lead times.

---

#### `POST /api/suppliers/{supplierId}/products`

**Purpose:** Link a product to a supplier with pricing and lead time.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "productId": 42,
  "supplierPrice": 22.00,
  "supplierSku": "UNIBEV-GIN-HEND",
  "leadTimeDays": 3,
  "minimumOrderQty": 6.0
}
```

**Response:** `201 Created` — SupplierProduct object.

---

#### `GET /api/suppliers/{supplierId}/products`

**Purpose:** List all products this supplier offers.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK` — Array of SupplierProduct objects with product names.

---

#### `PUT /api/suppliers/{supplierId}/products/{supplierProductId}`

**Purpose:** Update supplier pricing, lead time, or min order qty.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`

---

#### `DELETE /api/suppliers/{supplierId}/products/{supplierProductId}`

**Purpose:** Unlink a product from a supplier.

**Auth:** `OWNER`, `MANAGER`

**Response:** `204 No Content`

---

#### `GET /api/products/{productId}/suppliers`

**Purpose:** List all suppliers who offer this product (reverse lookup). Useful for finding cheapest or fastest supplier.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK` — Array of SupplierProduct objects with supplier names, sorted by `supplierPrice asc`.

---

### B4: Stock Logs

> **Controller:** `ProductController.java` (sub-resource)
> **Purpose:** Immutable audit trail of every stock change. Never edited or deleted.

---

#### `GET /api/stock-logs`

**Purpose:** List stock log events. Paginated, filterable.

**Auth:** `OWNER`, `MANAGER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required |
| `productId` | Long | Filter by product |
| `type` | String | Filter by: `CONSUMPTION`, `RESTOCK`, `ADJUSTMENT`, `WASTE`, `MENU_DEPLETION` |
| `shiftId` | Long | Filter by shift |
| `from` | DateTime | Start of date range |
| `to` | DateTime | End of date range |
| `page`, `size`, `sort` | — | Pagination (default sort: `timestamp,desc`) |

**Response:** `200 OK` — Paginated stock log list.

---

#### `GET /api/stock-logs/by-shift/{shiftId}`

**Purpose:** Get all stock movements during a specific shift. Used for shift summary.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK` — Array of StockLog objects grouped by product.

---

#### `GET /api/stock-logs/waste-summary`

**Purpose:** Waste analytics — total waste per product over a date range.

**Auth:** `OWNER`, `MANAGER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required |
| `from` | DateTime | Start |
| `to` | DateTime | End |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalWasteValue": 245.80,
    "wasteRatio": 0.032,
    "byProduct": [
      { "productId": 103, "productName": "Lime", "wastedQty": 45, "unit": "pieces", "wasteValue": 22.50 },
      { "productId": 42, "productName": "Hendrick's Gin", "wastedQty": 1, "unit": "bottle", "wasteValue": 28.50 }
    ]
  }
}
```

---

### B5: Orders

> **Controller:** `OrderController.java`
> **Purpose:** Manage supplier orders (money OUT). Full lifecycle: DRAFT → SUBMITTED → CONFIRMED → DELIVERED.

---

#### `POST /api/orders`

**Purpose:** Create a new order to a supplier. Starts as `DRAFT`.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "supplierId": 1,
  "venueId": 1,
  "expectedDelivery": "2026-02-12T10:00:00Z",
  "notes": "Urgent — running low on gin",
  "items": [
    { "productId": 42, "quantity": 6.0, "unitPrice": 22.00 },
    { "productId": 87, "quantity": 24.0, "unitPrice": 1.20 }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 80,
    "supplierId": 1,
    "supplierName": "UNIBEV GmbH",
    "venueId": 1,
    "status": "DRAFT",
    "totalAmount": 160.80,
    "isAutoGenerated": false,
    "createdAt": "2026-02-09T18:00:00Z",
    "items": [
      { "id": 1, "productId": 42, "productName": "Hendrick's Gin 700ml", "quantity": 6.0, "unitPrice": 22.00, "subtotal": 132.00 },
      { "id": 2, "productId": 87, "productName": "Tonic Water 200ml", "quantity": 24.0, "unitPrice": 1.20, "subtotal": 28.80 }
    ]
  }
}
```

---

#### `GET /api/orders`

**Purpose:** List orders. Paginated, filterable.

**Auth:** `OWNER`, `MANAGER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required |
| `supplierId` | Long | Filter by supplier |
| `status` | String | Filter by: `DRAFT`, `SUBMITTED`, `CONFIRMED`, `DELIVERED`, `CANCELLED` |
| `isAutoGenerated` | Boolean | Filter AI-suggested orders |
| `page`, `size`, `sort` | — | Pagination |

**Response:** `200 OK` — Paginated order list.

---

#### `GET /api/orders/{id}`

**Purpose:** Get a single order with all line items.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK` — Full order with embedded items.

---

#### `PATCH /api/orders/{id}/submit`

**Purpose:** Submit a draft order to the supplier. Changes status `DRAFT → SUBMITTED`.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`

---

#### `PATCH /api/orders/{id}/confirm`

**Purpose:** Mark order as confirmed by supplier. Changes status `SUBMITTED → CONFIRMED`.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`

---

#### `PATCH /api/orders/{id}/deliver`

**Purpose:** Mark order as delivered. Changes status `CONFIRMED → DELIVERED`. Automatically restocks products.

**Auth:** `OWNER`, `MANAGER`

**Request Body (optional):**
```json
{
  "actualDelivery": "2026-02-12T09:30:00Z"
}
```

**Side Effects:**
- For each `OrderItem`: calls `ProductService.restock(productId, quantity)`
- Creates `StockLog(RESTOCK)` for each item

**Response:** `200 OK`

---

#### `PATCH /api/orders/{id}/cancel`

**Purpose:** Cancel an order. Only possible if status is `DRAFT` or `SUBMITTED`.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`

---

### B6: Order Items

> **Controller:** `OrderController.java` (sub-resource)
> **Purpose:** Line items within an order. Can be modified while order is in DRAFT.

---

#### `POST /api/orders/{orderId}/items`

**Purpose:** Add a line item to a draft order.

**Auth:** `OWNER`, `MANAGER`

**Validation:** Order must be in `DRAFT` status.

**Request Body:**
```json
{
  "productId": 103,
  "quantity": 50.0,
  "unitPrice": 0.50
}
```

**Response:** `201 Created`

---

#### `PUT /api/orders/{orderId}/items/{itemId}`

**Purpose:** Update quantity or price of a line item.

**Auth:** `OWNER`, `MANAGER`

**Validation:** Order must be in `DRAFT` status.

**Response:** `200 OK`

---

#### `DELETE /api/orders/{orderId}/items/{itemId}`

**Purpose:** Remove a line item from a draft order.

**Auth:** `OWNER`, `MANAGER`

**Response:** `204 No Content`

---

### B7: Predictions & Weather

> **Controller:** `PredictionController.java`
> **Purpose:** AI/ML-powered predictions for stock, staffing, and consumption. The "smart" layer.

---

#### `GET /api/predictions/stock/{productId}`

**Purpose:** Get stock prediction for a specific product — predicted daily usage, days until stockout, recommended order quantity.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "productId": 42,
    "productName": "Hendrick's Gin 700ml",
    "currentQuantity": 2.0,
    "predictedDailyUsage": 0.7,
    "daysUntilStockout": 3,
    "recommendedOrderQty": 6.0,
    "confidenceScore": 0.85
  }
}
```

**Internal Calls:** `PredictiveEngineService.predictStock()` using `StockLog` history + `WeatherForecast`.

---

#### `GET /api/predictions/stock`

**Purpose:** Get stock predictions for ALL products at a venue.

**Auth:** `OWNER`, `MANAGER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required |

**Response:** `200 OK` — Array of `StockPrediction` objects.

---

#### `POST /api/predictions/suggest-order`

**Purpose:** Ask the prediction engine to generate a suggested order for all low-stock products.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "venueId": 1
}
```

**Response:** `201 Created` — An `Order` in `DRAFT` status with `isAutoGenerated: true`, pre-filled with optimal quantities and cheapest suppliers.

**Internal Calls:**
- `ProductService.getLowStockProducts(venueId)`
- `SupplierProductService.findCheapest(productId)`
- `PredictiveEngineService.suggestOrder(lowStockProducts)`

---

#### `GET /api/predictions/staffing`

**Purpose:** Get AI-suggested staffing levels for upcoming shifts.

**Auth:** `OWNER`, `MANAGER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required |
| `date` | Date | Target date (default: tomorrow) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "date": "2026-02-10",
    "weather": { "temperatureCelsius": 22.0, "condition": "SUNNY" },
    "reservationCount": 12,
    "suggestions": [
      { "shiftType": "MORNING", "suggestedStaff": 2, "reason": "Low reservation count, weekday" },
      { "shiftType": "EVENING", "suggestedStaff": 5, "reason": "12 reservations + sunny weather = terrace traffic" }
    ],
    "confidenceScore": 0.78
  }
}
```

**Internal Calls:**
- `WeatherService.getForecast(date)`
- `ReservationService.countByDate(venueId, date)` (cross-domain → Guest)
- `PredictiveEngineService.suggestStaffing()`

---

#### `GET /api/predictions/consumption/{productId}`

**Purpose:** Get consumption trend analysis for a product.

**Auth:** `OWNER`, `MANAGER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `days` | int | Analysis window (default: 30) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "productId": 42,
    "productName": "Hendrick's Gin 700ml",
    "averageDailyUsage": 0.7,
    "peakUsage": 1.5,
    "peakDay": "SATURDAY",
    "weekOverWeekChange": 0.12,
    "trendDirection": "UP"
  }
}
```

---

#### `GET /api/weather/forecast`

**Purpose:** Get weather forecast for venue's location. Used by prediction engine and frontend dashboard.

**Auth:** Any authenticated user.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required (uses venue's city for location) |
| `days` | int | Forecast days ahead (default: 7, max: 14) |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    { "date": "2026-02-10", "temperatureCelsius": 22.0, "condition": "SUNNY", "precipitationMm": 0.0 },
    { "date": "2026-02-11", "temperatureCelsius": 15.0, "condition": "RAINY", "precipitationMm": 12.5 }
  ]
}
```

**External Call:** Open-Meteo API (free, no API key).

---

---

## Service C — Digital Menu (`com.kesselops.menu`)

> **Entities:** MenuItem, MenuCategory, Recipe, RecipeIngredient, MenuSyndication, SyndicationTarget, SyncStatus
>
> **Controllers:** MenuItemController, RecipeController, SyndicationController

---

### C1: Menu Items

> **Controller:** `MenuItemController.java`
> **Purpose:** Manage the customer-facing digital menu. MenuItems are what you SELL.

---

#### `POST /api/menu-items`

**Purpose:** Create a new menu item.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "venueId": 1,
  "name": "Gin & Tonic",
  "description": "Hendrick's Gin with Fever-Tree Tonic, cucumber garnish",
  "price": 9.50,
  "category": "COCKTAIL",
  "imageUrl": "https://s3.../menu/gin-tonic.jpg",
  "isAvailable": true,
  "isAlcoholFree": false,
  "allergens": ["NONE"],
  "sortOrder": 1
}
```

**Validation:**
- `category` — one of: `COCKTAIL`, `BEER`, `WINE`, `BOTANICAL_BOOSTER`, `SOFT_DRINK`, `COFFEE`, `FOOD`, `SPECIAL`
- `price` > 0

**Response:** `201 Created` — MenuItem object.

---

#### `GET /api/menu-items`

**Purpose:** List menu items for a venue. Can be used for the public-facing menu OR internal management.

**Auth:** Any authenticated user (read), `OWNER`/`MANAGER` (write).

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required |
| `category` | String | Filter by category |
| `isAvailable` | Boolean | Filter by availability |
| `isAlcoholFree` | Boolean | Filter NA drinks only |
| `search` | String | Search by name or description |
| `page`, `size`, `sort` | — | Pagination (default sort: `sortOrder,asc`) |

**Response:** `200 OK` — Paginated menu items.

---

#### `GET /api/menu-items/{id}`

**Purpose:** Get a single menu item with its recipe (if exists) and availability status.

**Auth:** Any authenticated user.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 10,
    "venueId": 1,
    "name": "Gin & Tonic",
    "description": "Hendrick's Gin with Fever-Tree Tonic, cucumber garnish",
    "price": 9.50,
    "category": "COCKTAIL",
    "imageUrl": "https://s3.../menu/gin-tonic.jpg",
    "isAvailable": true,
    "isAlcoholFree": false,
    "allergens": ["NONE"],
    "sortOrder": 1,
    "createdAt": "2026-02-09T10:00:00Z",
    "recipe": {
      "id": 20,
      "preparationNotes": "Pour gin over ice, add tonic, garnish with cucumber",
      "prepTimeMinutes": 3,
      "difficultyLevel": "EASY",
      "ingredients": [
        { "id": 1, "productId": 42, "productName": "Hendrick's Gin 700ml", "quantity": 0.05, "unit": "L", "isOptional": false, "ingredientCost": 2.04 },
        { "id": 2, "productId": 87, "productName": "Fever-Tree Tonic 200ml", "quantity": 1.0, "unit": "bottle", "isOptional": false, "ingredientCost": 1.20 },
        { "id": 3, "productId": 103, "productName": "Cucumber", "quantity": 2.0, "unit": "slices", "isOptional": true, "ingredientCost": 0.10 }
      ],
      "totalCost": 3.34,
      "profitMargin": 6.16
    },
    "syndicationStatus": [
      { "target": "SPEISEKARTE_DE", "syncStatus": "SYNCED", "lastSyncedAt": "2026-02-09T12:00:00Z" },
      { "target": "GOOGLE_BUSINESS", "syncStatus": "PENDING" }
    ]
  }
}
```

---

#### `PUT /api/menu-items/{id}`

**Purpose:** Update menu item (name, price, description, availability, allergens).

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`

---

#### `PATCH /api/menu-items/{id}/availability`

**Purpose:** Toggle availability (e.g., 86'd an item — out of stock). Quick toggle without full update.

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Request Body:**
```json
{
  "isAvailable": false,
  "reason": "Out of Hendrick's Gin"
}
```

**Response:** `200 OK`

**Side Effects:** If linked to syndication targets, marks them as `OUT_OF_DATE`.

---

#### `DELETE /api/menu-items/{id}`

**Purpose:** Remove a menu item. Fails if open GuestCheckItems reference it.

**Auth:** `OWNER`

**Response:** `204 No Content`

---

#### `POST /api/menu-items/{id}/generate-description`

**Purpose:** AI-generate an appealing menu description from the item's recipe.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "generatedDescription": "Refreshing classic with premium Hendrick's Gin, topped with artisanal Fever-Tree tonic and a delicate cucumber ribbon. Crisp, botanical, and endlessly elegant."
  }
}
```

**Internal Calls:** `AIOrchestrationService.generate(category=MENU_DESCRIPTION, vars)` (cross-domain → AI)

---

#### `GET /api/menu-items/{id}/cost-breakdown`

**Purpose:** Get detailed cost-of-goods-sold (COGS) and profit margin for a menu item.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "menuItemId": 10,
    "menuItemName": "Gin & Tonic",
    "sellingPrice": 9.50,
    "ingredientCosts": [
      { "productName": "Hendrick's Gin", "quantity": 0.05, "unit": "L", "unitCost": 40.71, "lineCost": 2.04 },
      { "productName": "Fever-Tree Tonic", "quantity": 1, "unit": "bottle", "unitCost": 1.20, "lineCost": 1.20 },
      { "productName": "Cucumber", "quantity": 2, "unit": "slices", "unitCost": 0.05, "lineCost": 0.10 }
    ],
    "totalCOGS": 3.34,
    "grossProfit": 6.16,
    "grossMarginPercent": 64.8
  }
}
```

---

### C2: Recipes

> **Controller:** `RecipeController.java`
> **Purpose:** Link MenuItems to their preparation instructions. One Recipe per MenuItem.

---

#### `POST /api/menu-items/{menuItemId}/recipe`

**Purpose:** Create a recipe for a menu item (1:1 relationship).

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "preparationNotes": "Pour gin over ice in highball glass, add tonic slowly, garnish with cucumber",
  "prepTimeMinutes": 3,
  "difficultyLevel": "EASY"
}
```

**Validation:** MenuItem must not already have a recipe.

**Response:** `201 Created` — Recipe object.

---

#### `GET /api/menu-items/{menuItemId}/recipe`

**Purpose:** Get the recipe for a menu item (including ingredients).

**Auth:** Any authenticated user.

**Response:** `200 OK` — Recipe object with embedded `ingredients[]`.

---

#### `PUT /api/menu-items/{menuItemId}/recipe`

**Purpose:** Update recipe preparation notes, time, or difficulty.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`

---

#### `DELETE /api/menu-items/{menuItemId}/recipe`

**Purpose:** Delete a recipe (and all its ingredients).

**Auth:** `OWNER`

**Response:** `204 No Content`

---

### C3: Recipe Ingredients

> **Controller:** `RecipeController.java` (sub-resource)
> **Purpose:** The bridge between WHAT you sell (MenuItem/Recipe) and WHAT you stock (Product). This is the auto-depletion chain.

---

#### `POST /api/recipes/{recipeId}/ingredients`

**Purpose:** Add an ingredient to a recipe. Links a Product to a Recipe with quantity.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "productId": 42,
  "quantity": 0.05,
  "unit": "L",
  "isOptional": false
}
```

**Validation:** `productId` must exist and be active.

**Response:** `201 Created` — RecipeIngredient object.

---

#### `GET /api/recipes/{recipeId}/ingredients`

**Purpose:** List all ingredients for a recipe.

**Auth:** Any authenticated user.

**Response:** `200 OK` — Array of RecipeIngredient objects with product details.

---

#### `PUT /api/recipes/{recipeId}/ingredients/{ingredientId}`

**Purpose:** Update ingredient quantity or optional flag.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`

---

#### `DELETE /api/recipes/{recipeId}/ingredients/{ingredientId}`

**Purpose:** Remove an ingredient from a recipe.

**Auth:** `OWNER`, `MANAGER`

**Response:** `204 No Content`

---

### C4: Menu Syndication

> **Controller:** `SyndicationController.java`
> **Purpose:** Sync menu items to external platforms (speisekarte.de, Google Business, TripAdvisor).

---

#### `POST /api/menu-items/{menuItemId}/syndication`

**Purpose:** Register a menu item for syndication to an external target.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "target": "SPEISEKARTE_DE"
}
```

**Validation:**
- `target` — one of: `SPEISEKARTE_DE`, `GOOGLE_BUSINESS`, `TRIPADVISOR`, `WEBSITE`
- No duplicate target per menuItem

**Response:** `201 Created`

---

#### `POST /api/menu-items/{menuItemId}/syndication/sync`

**Purpose:** Trigger a sync of this menu item to all its registered targets.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "synced": ["SPEISEKARTE_DE", "GOOGLE_BUSINESS"],
    "failed": [],
    "pending": ["TRIPADVISOR"]
  }
}
```

---

#### `POST /api/syndication/sync-all`

**Purpose:** Bulk sync — push all menu items for a venue to all registered targets.

**Auth:** `OWNER`, `MANAGER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required |

**Response:** `200 OK` — Summary of sync results.

---

#### `GET /api/syndication/status`

**Purpose:** Get syndication status for all menu items at a venue.

**Auth:** `OWNER`, `MANAGER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required |
| `syncStatus` | String | Filter by: `PENDING`, `SYNCED`, `FAILED`, `OUT_OF_DATE` |

**Response:** `200 OK` — Array of syndication records with menu item names and statuses.

---

#### `DELETE /api/menu-items/{menuItemId}/syndication/{syndicationId}`

**Purpose:** Remove a syndication target for a menu item.

**Auth:** `OWNER`, `MANAGER`

**Response:** `204 No Content`

---

---

## Service D — Guest Experience (`com.kesselops.guest`)

> **Entities:** GuestProfile, Reservation, ReservationStatus, GuestEvaluation, GuestCheck, GuestCheckItem, GuestCheckStatus, PaymentMethod
>
> **Controllers:** GuestController, ReservationController, EvaluationController, GuestCheckController

---

### D1: Guest Profiles

> **Controller:** `GuestController.java`
> **Purpose:** Manage guest profiles with lifetime value, visit frequency, reliability scoring, and VIP detection.

---

#### `POST /api/guests`

**Purpose:** Create a new guest profile.

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Request Body:**
```json
{
  "firstName": "Anna",
  "lastName": "Weber",
  "email": "anna@example.com",
  "phone": "+49 170 5555555",
  "venueId": 1,
  "preferences": ["window seat", "no ice in drinks"],
  "notes": "Regular Tuesday evening guest"
}
```

**Response:** `201 Created` — GuestProfile with initial scores (totalVisits=0, guestScore=5.0, etc.).

---

#### `GET /api/guests`

**Purpose:** List guest profiles. Paginated, filterable, searchable.

**Auth:** `OWNER`, `MANAGER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required |
| `search` | String | Search by name, email, phone |
| `isVIP` | Boolean | Filter VIP guests only (totalSpend > threshold) |
| `minScore` | Double | Filter by minimum guest score |
| `maxNoShows` | int | Filter by maximum no-show count |
| `page`, `size`, `sort` | — | Pagination (default sort: `lastVisitAt,desc`) |

**Response:** `200 OK` — Paginated guest list.

---

#### `GET /api/guests/{id}`

**Purpose:** Get a single guest profile with full history.

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 100,
    "firstName": "Anna",
    "lastName": "Weber",
    "email": "anna@example.com",
    "phone": "+49 170 5555555",
    "venueId": 1,
    "totalVisits": 24,
    "noShowCount": 1,
    "totalSpend": 1080.50,
    "averageSpend": 45.02,
    "guestScore": 4.7,
    "isVIP": true,
    "isReliable": true,
    "preferences": ["window seat", "no ice in drinks"],
    "notes": "Regular Tuesday evening guest",
    "createdAt": "2025-06-15T10:00:00Z",
    "lastVisitAt": "2026-02-07T21:30:00Z"
  }
}
```

---

#### `PUT /api/guests/{id}`

**Purpose:** Update guest profile (contact info, preferences, notes).

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Response:** `200 OK`

---

#### `GET /api/guests/{id}/history`

**Purpose:** Get a guest's complete visit history — all reservations, evaluations, and guest checks.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "guestId": 100,
    "guestName": "Anna Weber",
    "recentReservations": [ ... ],
    "recentChecks": [ ... ],
    "evaluations": [ ... ],
    "lifetimeValue": 1080.50,
    "visitFrequency": "1.5 visits/week"
  }
}
```

---

#### `GET /api/guests/{id}/ai-insight`

**Purpose:** AI-generated natural language summary of the guest.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "insight": "Anna Weber is a VIP regular (24 visits, €1,080 lifetime spend). She prefers window seating and visits primarily on Tuesday evenings. Average spend is €45, above your venue average of €38. One no-show in 8 months — highly reliable. Consider a personalized greeting or complimentary amuse-bouche."
  }
}
```

**Internal Calls:** `AIOrchestrationService.generate(vars)` with guest profile data (cross-domain → AI).

---

### D2: Reservations

> **Controller:** `ReservationController.java`
> **Purpose:** Full reservation lifecycle: PENDING → CONFIRMED → SEATED → COMPLETED / NO_SHOW.

---

#### `POST /api/reservations`

**Purpose:** Create a new reservation.

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Request Body:**
```json
{
  "guestProfileId": 100,
  "venueId": 1,
  "reservationTime": "2026-02-10T19:30:00Z",
  "partySize": 4,
  "specialRequests": "Window table, birthday celebration",
  "tablePreference": "T5"
}
```

**Validation:**
- `reservationTime` must be in the future
- `partySize` > 0
- `guestProfileId` must exist (optional — walk-in reservations can omit this)

**Response:** `201 Created` — Reservation with `status: "PENDING"`.

---

#### `GET /api/reservations`

**Purpose:** List reservations. Paginated, filterable by venue, date, status.

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required |
| `date` | Date | Filter by date (YYYY-MM-DD) |
| `status` | String | Filter by: `PENDING`, `CONFIRMED`, `SEATED`, `COMPLETED`, `CANCELLED`, `NO_SHOW` |
| `guestProfileId` | Long | Filter by guest |
| `page`, `size`, `sort` | — | Pagination (default sort: `reservationTime,asc`) |

**Response:** `200 OK` — Paginated reservation list with guest names.

---

#### `GET /api/reservations/{id}`

**Purpose:** Get a single reservation with guest details.

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Response:** `200 OK` — Reservation with embedded guest profile summary.

---

#### `PATCH /api/reservations/{id}/confirm`

**Purpose:** Confirm a pending reservation. `PENDING → CONFIRMED`.

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Response:** `200 OK`

---

#### `PATCH /api/reservations/{id}/seat`

**Purpose:** Mark guest as seated (arrived). `CONFIRMED → SEATED`.

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Response:** `200 OK`

---

#### `PATCH /api/reservations/{id}/complete`

**Purpose:** Mark reservation as completed (guest left). `SEATED → COMPLETED`.

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Response:** `200 OK`

**Side Effects:** `GuestProfile.totalVisits++`, `GuestProfile.lastVisitAt = now()`

---

#### `PATCH /api/reservations/{id}/cancel`

**Purpose:** Cancel a reservation. Any status → `CANCELLED`.

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Request Body:**
```json
{
  "reason": "Guest called to cancel"
}
```

**Response:** `200 OK`

---

#### `PATCH /api/reservations/{id}/no-show`

**Purpose:** Mark guest as no-show. `CONFIRMED → NO_SHOW`.

**Auth:** `OWNER`, `MANAGER`

**Side Effects:**
- `GuestProfile.noShowCount++`
- `GuestProfile.guestScore` recalculated via `calculateScore()`

**Response:** `200 OK`

---

#### `GET /api/reservations/today`

**Purpose:** Get all reservations for today at a venue (dashboard widget).

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required |

**Response:** `200 OK` — Array of today's reservations sorted by time.

---

### D3: Guest Evaluations

> **Controller:** `EvaluationController.java`
> **Purpose:** REVERSE RATING — the gastronomer rates guests. Ludwig Heer's explicit request. SECRET WEAPON.

---

#### `POST /api/evaluations`

**Purpose:** Create a guest evaluation (staff rates the guest after their visit).

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Request Body:**
```json
{
  "guestProfileId": 100,
  "reservationId": 300,
  "behaviorRating": 5,
  "punctualityRating": 4,
  "overallRating": 5,
  "comment": "Very friendly, arrived 5 minutes late but otherwise perfect guest"
}
```

**Validation:**
- All ratings: integer 1–5
- `guestProfileId` required
- `reservationId` optional (walk-ins may not have one)

**Response:** `201 Created` — Evaluation object.

**Side Effects:** `GuestProfile.guestScore` is recalculated as average of all evaluations.

---

#### `GET /api/evaluations`

**Purpose:** List evaluations. Filterable by guest, venue, or evaluator.

**Auth:** `OWNER`, `MANAGER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Filter by venue (via guest's venueId) |
| `guestProfileId` | Long | Filter by guest |
| `evaluatedByUserId` | Long | Filter by staff who evaluated |
| `page`, `size`, `sort` | — | Pagination |

**Response:** `200 OK` — Paginated evaluations with guest and evaluator names.

---

#### `GET /api/guests/{guestId}/evaluations`

**Purpose:** Get all evaluations for a specific guest.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK` — Array of evaluations for this guest.

---

#### `GET /api/guests/{guestId}/score`

**Purpose:** Get the calculated guest score breakdown.

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "guestId": 100,
    "guestName": "Anna Weber",
    "overallScore": 4.7,
    "averageBehavior": 4.8,
    "averagePunctuality": 4.5,
    "averageOverall": 4.7,
    "totalEvaluations": 12,
    "noShowCount": 1,
    "isReliable": true,
    "isVIP": true
  }
}
```

---

### D4: Guest Checks

> **Controller:** `GuestCheckController.java`
> **Purpose:** The TRANSACTION entity — records "who bought what, when, and for how much." Money IN. Links to Shift (revenue per shift), User (served by), GuestProfile (lifetime value), Reservation (fulfills).

---

#### `POST /api/checks`

**Purpose:** Open a new guest check (start a tab for a table).

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Request Body:**
```json
{
  "venueId": 1,
  "shiftId": 12,
  "tableNumber": "T5",
  "guestCount": 4,
  "guestProfileId": 100,
  "reservationId": 300,
  "notes": "Birthday celebration, bring candle"
}
```

**Validation:**
- `shiftId` must be an active shift
- `guestProfileId` and `reservationId` are optional (walk-ins)
- `servedByUserId` is auto-set from JWT

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 500,
    "venueId": 1,
    "shiftId": 12,
    "servedByUserId": 5,
    "servedByName": "Max Müller",
    "guestProfileId": 100,
    "guestName": "Anna Weber",
    "reservationId": 300,
    "tableNumber": "T5",
    "guestCount": 4,
    "status": "OPEN",
    "subtotal": 0.0,
    "taxAmount": 0.0,
    "tipAmount": 0.0,
    "totalAmount": 0.0,
    "discountAmount": 0.0,
    "openedAt": "2026-02-09T19:30:00Z",
    "closedAt": null,
    "items": []
  }
}
```

---

#### `GET /api/checks`

**Purpose:** List guest checks. Paginated, filterable.

**Auth:** `OWNER`, `MANAGER`, `STAFF` (own venue only)

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required |
| `shiftId` | Long | Filter by shift |
| `status` | String | Filter by: `OPEN`, `CLOSED`, `VOID`, `REFUNDED` |
| `servedByUserId` | Long | Filter by staff member |
| `guestProfileId` | Long | Filter by guest |
| `from` | DateTime | Date range start |
| `to` | DateTime | Date range end |
| `page`, `size`, `sort` | — | Pagination |

**Response:** `200 OK` — Paginated guest check list.

---

#### `GET /api/checks/{id}`

**Purpose:** Get a single guest check with all line items.

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Response:** `200 OK` — Full GuestCheck with embedded items, guest info, and financials.

---

#### `GET /api/checks/open`

**Purpose:** Get all currently open guest checks at a venue. Used for the live floor view.

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required |

**Response:** `200 OK` — Array of open checks with table numbers and running totals.

---

#### `PATCH /api/checks/{id}/close`

**Purpose:** Close a guest check. Sets payment method, calculates totals, finalizes the transaction.

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Request Body:**
```json
{
  "paymentMethod": "CARD",
  "tipAmount": 5.00,
  "discountAmount": 0.00
}
```

**Validation:**
- `paymentMethod` — one of: `CASH`, `CARD`, `MOBILE_PAY`, `SPLIT`, `ON_HOUSE`
- Check must be in `OPEN` status
- Check must have at least one item

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 500,
    "status": "CLOSED",
    "paymentMethod": "CARD",
    "subtotal": 40.50,
    "taxAmount": 7.70,
    "tipAmount": 5.00,
    "discountAmount": 0.00,
    "totalAmount": 53.20,
    "closedAt": "2026-02-09T22:15:00Z"
  },
  "message": "Guest check closed"
}
```

**Side Effects:**
- `GuestProfile.recordVisit(totalAmount)` → updates `totalVisits`, `totalSpend`, `averageSpend`, `lastVisitAt`
- If `reservationId` exists → `Reservation.status = COMPLETED`
- For each `GuestCheckItem`:
  - `MenuItem → Recipe → RecipeIngredient[] → Product.consume(qty * item.quantity)`
  - Creates `StockLog(type=MENU_DEPLETION, shiftId)` for each product consumed
- Pushes WebSocket event for live dashboard update

**Internal Calls (cross-domain):**
- `MenuService.getRecipeIngredients(menuItemId)` → Menu
- `ProductService.consume(productId, qty)` → Inventory
- `StockService.log(MENU_DEPLETION, ...)` → Inventory

---

#### `PATCH /api/checks/{id}/void`

**Purpose:** Void an entire check (manager override — error correction). Status `OPEN → VOID`.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "reason": "Wrong table number, guest moved"
}
```

**Response:** `200 OK`

---

#### `PATCH /api/checks/{id}/refund`

**Purpose:** Refund a closed check. Status `CLOSED → REFUNDED`. Reverses financial impact.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "reason": "Guest complaint — cold food"
}
```

**Side Effects:**
- Reverses `GuestProfile.totalSpend` and `averageSpend`
- Does NOT reverse inventory depletion (food was still consumed)

**Response:** `200 OK`

---

#### `PATCH /api/checks/{id}/discount`

**Purpose:** Apply a discount to an open check.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "discountAmount": 5.00,
  "reason": "Birthday discount"
}
```

**Response:** `200 OK`

---

#### `GET /api/checks/by-shift/{shiftId}`

**Purpose:** Get all checks for a specific shift with revenue summary.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "shiftId": 12,
    "checks": [ ... ],
    "summary": {
      "totalChecks": 34,
      "totalRevenue": 2450.80,
      "averageCheckSize": 72.08,
      "totalTips": 198.50,
      "paymentBreakdown": { "CARD": 2100.30, "CASH": 280.50, "MOBILE_PAY": 70.00 }
    }
  }
}
```

---

### D5: Guest Check Items

> **Controller:** `GuestCheckController.java` (sub-resource)
> **Purpose:** Line items on a guest check — what was ordered. Links to MenuItem for pricing and depletion.

---

#### `POST /api/checks/{checkId}/items`

**Purpose:** Add an item to an open guest check.

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Request Body:**
```json
{
  "menuItemId": 10,
  "quantity": 2,
  "modifiers": "extra ice",
  "notes": ""
}
```

**Validation:**
- Check must be in `OPEN` status
- `menuItemId` must exist and be available
- `unitPrice` is auto-pulled from `MenuItem.price`

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1000,
    "guestCheckId": 500,
    "menuItemId": 10,
    "menuItemName": "Gin & Tonic",
    "quantity": 2,
    "unitPrice": 9.50,
    "lineTotal": 19.00,
    "modifiers": "extra ice",
    "notes": "",
    "orderedAt": "2026-02-09T19:45:00Z",
    "servedAt": null
  }
}
```

**Side Effects:** Updates `GuestCheck.subtotal` and `taxAmount` recalculation.

---

#### `GET /api/checks/{checkId}/items`

**Purpose:** List all items on a guest check.

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Response:** `200 OK` — Array of GuestCheckItem objects.

---

#### `PUT /api/checks/{checkId}/items/{itemId}`

**Purpose:** Update item quantity, modifiers, or notes. Only while check is `OPEN`.

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Response:** `200 OK`

---

#### `DELETE /api/checks/{checkId}/items/{itemId}`

**Purpose:** Remove an item from an open check (before closing).

**Auth:** `OWNER`, `MANAGER`

**Response:** `204 No Content`

**Side Effects:** Recalculates `GuestCheck.subtotal`.

---

#### `PATCH /api/checks/{checkId}/items/{itemId}/served`

**Purpose:** Mark an item as served (kitchen/bar fulfilled the order).

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Response:** `200 OK` — Sets `servedAt` timestamp.

---

---

## Service E — Social & Marketing (`com.kesselops.social`)

> **Entities:** SocialPost, Platform, PostStatus, Media, MediaType, ReviewResponse, ReviewResponseStatus, AIContentGenerator
>
> **Controllers:** SocialPostController, MediaController, ReviewController

---

### E1: Social Posts

> **Controller:** `SocialPostController.java`
> **Purpose:** AI-powered social media post generation, scheduling, and publishing.

---

#### `POST /api/posts`

**Purpose:** Create a social post manually (without AI).

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "venueId": 1,
  "content": "Friday vibes at OSCHO! 🍸 #stuttgart #nightlife",
  "platform": "INSTAGRAM",
  "scheduledAt": "2026-02-10T18:00:00Z",
  "mediaIds": [400, 401]
}
```

**Validation:**
- `platform` — one of: `INSTAGRAM`, `FACEBOOK`, `TIKTOK`, `GOOGLE_BUSINESS`

**Response:** `201 Created` — Post with `status: "DRAFT"`.

---

#### `POST /api/posts/generate`

**Purpose:** AI-generate a social media post from shift data, photos, or custom prompt.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "venueId": 1,
  "platform": "INSTAGRAM",
  "shiftId": 12,
  "mediaIds": [400],
  "customPrompt": "Focus on the new cocktail menu launch"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 600,
    "venueId": 1,
    "content": "Neue Cocktailkarte ist da! 🎉 Probiert unseren neuen Barrel Old Fashioned — direkt aus dem Fass serviert. Nur bei OSCHO. #stuttgart #cocktails #newmenu",
    "platform": "INSTAGRAM",
    "status": "DRAFT",
    "promptTemplateId": 5,
    "scheduledAt": null,
    "generatedFromShiftId": 12,
    "mediaIds": [400],
    "createdAt": "2026-02-09T22:00:00Z"
  }
}
```

**Internal Calls:**
- `AIOrchestrationService.generate(category=SOCIAL_POST, vars)` (cross-domain → AI)
- `ShiftService.getShiftData(shiftId)` (cross-domain → Operations)

---

#### `GET /api/posts`

**Purpose:** List social posts. Paginated, filterable.

**Auth:** `OWNER`, `MANAGER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required |
| `platform` | String | Filter by platform |
| `status` | String | Filter by: `DRAFT`, `SCHEDULED`, `PUBLISHED`, `FAILED` |
| `page`, `size`, `sort` | — | Pagination |

**Response:** `200 OK` — Paginated post list.

---

#### `GET /api/posts/{id}`

**Purpose:** Get a single post with media attachments.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK` — Full post with embedded media.

---

#### `PUT /api/posts/{id}`

**Purpose:** Edit post content (before publishing).

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`

---

#### `PATCH /api/posts/{id}/schedule`

**Purpose:** Schedule a post for future publishing. Sets status `DRAFT → SCHEDULED`.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "scheduledAt": "2026-02-10T18:00:00Z"
}
```

**Response:** `200 OK`

---

#### `PATCH /api/posts/{id}/publish`

**Purpose:** Immediately publish a post to the target platform. Sets status → `PUBLISHED`.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`

**External Call:** Meta Graph API (Instagram/Facebook) or platform-specific API.

---

#### `DELETE /api/posts/{id}`

**Purpose:** Delete a draft or scheduled post. Cannot delete published posts.

**Auth:** `OWNER`, `MANAGER`

**Response:** `204 No Content`

---

#### `POST /api/posts/{id}/suggest-hashtags`

**Purpose:** AI-suggest hashtags for a post's content.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "hashtags": ["#stuttgart", "#cocktails", "#nightlife", "#barlife", "#oscho", "#newmenu", "#craftcocktails"]
  }
}
```

**Internal Calls:** `AIOrchestrationService.suggestHashtags(content)` (cross-domain → AI)

---

### E2: Media

> **Controller:** `MediaController.java`
> **Purpose:** Upload and manage media files (images, videos) for social posts.

---

#### `POST /api/media`

**Purpose:** Upload a media file (image or video).

**Auth:** `OWNER`, `MANAGER`, `STAFF`

**Content-Type:** `multipart/form-data`

**Request Body:**
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | Image (JPEG, PNG, WebP) or Video (MP4). Max 50MB for video, 10MB for image. |
| `altText` | String | Alt text / description |
| `type` | String | `IMAGE`, `VIDEO`, or `CAROUSEL` |

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 400,
    "fileUrl": "https://s3.../media/2026/02/09/cocktail-launch.jpg",
    "type": "IMAGE",
    "altText": "New cocktail menu at OSCHO",
    "sortOrder": 0,
    "uploadedAt": "2026-02-09T21:00:00Z"
  }
}
```

---

#### `GET /api/media`

**Purpose:** List all media files. Paginated.

**Auth:** `OWNER`, `MANAGER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required (media is venue-scoped via posts) |
| `type` | String | Filter by: `IMAGE`, `VIDEO`, `CAROUSEL` |
| `page`, `size`, `sort` | — | Pagination |

**Response:** `200 OK` — Paginated media list.

---

#### `GET /api/media/{id}`

**Purpose:** Get a single media file's metadata and URL.

**Auth:** Any authenticated user.

**Response:** `200 OK` — Media object.

---

#### `DELETE /api/media/{id}`

**Purpose:** Delete a media file. Removes from S3 and database.

**Auth:** `OWNER`, `MANAGER`

**Validation:** Cannot delete if attached to a `PUBLISHED` post.

**Response:** `204 No Content`

---

#### `POST /api/media/{id}/generate-caption`

**Purpose:** AI-generate a caption for a photo using vision model.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "caption": "Fresh cocktails being poured at the bar — the evening rush is on! 🍹"
  }
}
```

**Internal Calls:** `AIOrchestrationService.generate(category=SOCIAL_POST, imageUrl)` using GPT-4o Vision.

---

### E3: Review Responses

> **Controller:** `ReviewController.java`
> **Purpose:** AI-draft responses to Google/platform reviews. Manager approves → publishes. Ludwig Heer's "Social Media Feedback zu Google Bewertungen."

---

#### `POST /api/reviews`

**Purpose:** Import a review from an external platform for AI response generation.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "venueId": 1,
  "sourcePlatform": "GOOGLE_BUSINESS",
  "originalReviewText": "Great cocktails but the service was a bit slow on Friday night. 4/5 stars.",
  "originalRating": 4
}
```

**Response:** `201 Created` — ReviewResponse with `status: "GENERATED"` (AI already drafted the response).

```json
{
  "success": true,
  "data": {
    "id": 700,
    "venueId": 1,
    "sourcePlatform": "GOOGLE_BUSINESS",
    "originalReviewText": "Great cocktails but the service was a bit slow on Friday night. 4/5 stars.",
    "originalRating": 4,
    "generatedResponse": "Vielen Dank für Ihr Feedback! 🙏 Es freut uns, dass Ihnen unsere Cocktails geschmeckt haben. Freitagabend war besonders voll — wir arbeiten daran, unseren Service auch in Stoßzeiten auf Top-Niveau zu halten. Wir freuen uns auf Ihren nächsten Besuch!",
    "status": "GENERATED",
    "promptTemplateId": 7,
    "createdAt": "2026-02-09T22:30:00Z"
  }
}
```

**Internal Calls:** `AIOrchestrationService.generate(category=REVIEW_RESPONSE, vars)` (cross-domain → AI)

---

#### `GET /api/reviews`

**Purpose:** List all review responses. Paginated, filterable.

**Auth:** `OWNER`, `MANAGER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Required |
| `sourcePlatform` | String | Filter by platform |
| `status` | String | Filter by: `GENERATED`, `APPROVED`, `PUBLISHED`, `REJECTED` |
| `page`, `size`, `sort` | — | Pagination |

**Response:** `200 OK` — Paginated list.

---

#### `GET /api/reviews/{id}`

**Purpose:** Get a single review response.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`

---

#### `PUT /api/reviews/{id}/edit`

**Purpose:** Edit the AI-generated response before publishing.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "generatedResponse": "Thank you for your feedback! ..."
}
```

**Response:** `200 OK`

---

#### `PATCH /api/reviews/{id}/approve`

**Purpose:** Approve the response for publishing. `GENERATED → APPROVED`.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`

---

#### `PATCH /api/reviews/{id}/publish`

**Purpose:** Publish the approved response to the platform. `APPROVED → PUBLISHED`.

**Auth:** `OWNER`, `MANAGER`

**External Call:** Google My Business API to post the response.

**Response:** `200 OK`

---

#### `PATCH /api/reviews/{id}/reject`

**Purpose:** Reject the AI-generated response. `GENERATED → REJECTED`.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`

---

#### `POST /api/reviews/{id}/regenerate`

**Purpose:** Re-generate the AI response with different parameters.

**Auth:** `OWNER`, `MANAGER`

**Request Body (optional):**
```json
{
  "tone": "more formal",
  "language": "en"
}
```

**Response:** `200 OK` — Updated review with new `generatedResponse`.

---

---

## Service F — AI Configuration (`com.kesselops.ai`)

> **Entities:** PromptTemplate, PromptCategory, AIUsageLog
>
> **Controllers:** PromptController, AIUsageController, (AIOrchestrationService — internal, no public controller)

---

### F1: Prompt Templates

> **Controller:** `PromptController.java`
> **Purpose:** Manage AI personality configurations per venue. The configurable AI brain.

---

#### `POST /api/prompts`

**Purpose:** Create a new prompt template.

**Auth:** `OWNER`

**Request Body:**
```json
{
  "venueId": 1,
  "name": "OSCHO Instagram Voice",
  "systemPrompt": "Du bist der Social Media Manager von OSCHO, einem Café & Bar in Stuttgart. Dein Ton ist locker, jung, und urban. Verwende Emojis sparsam. Sprache: Deutsch.",
  "userPromptTemplate": "Erstelle einen Instagram Post basierend auf: Schicht: {shiftType}, Datum: {date}, Highlights: {highlights}",
  "category": "SOCIAL_POST",
  "toneOfVoice": "casual, urban, witty",
  "language": "de",
  "isActive": true
}
```

**Validation:**
- `category` — one of: `SOCIAL_POST`, `REVIEW_RESPONSE`, `ONBOARDING_GUIDE`, `MENU_DESCRIPTION`, `SHIFT_SUMMARY`
- `venueId` — null for global templates, set for venue-specific

**Response:** `201 Created` — PromptTemplate with `version: 1`.

---

#### `GET /api/prompts`

**Purpose:** List all prompt templates. Filterable by venue and category.

**Auth:** `OWNER`, `MANAGER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Filter by venue (null = global templates) |
| `category` | String | Filter by prompt category |
| `isActive` | Boolean | Filter active only |

**Response:** `200 OK` — Array of prompt templates.

---

#### `GET /api/prompts/{id}`

**Purpose:** Get a single prompt template.

**Auth:** `OWNER`, `MANAGER`

**Response:** `200 OK`

---

#### `GET /api/prompts/venue/{venueId}/category/{category}`

**Purpose:** Get the active prompt template for a specific venue and category. Falls back to global template if no venue-specific one exists.

**Auth:** `OWNER`, `MANAGER` (or internal service call)

**Response:** `200 OK` — Single PromptTemplate.

---

#### `PUT /api/prompts/{id}`

**Purpose:** Update a prompt template. Auto-increments `version`.

**Auth:** `OWNER`

**Response:** `200 OK` — Updated template with incremented version.

---

#### `PATCH /api/prompts/{id}/activate`

**Purpose:** Activate a prompt template.

**Auth:** `OWNER`

**Response:** `200 OK`

---

#### `PATCH /api/prompts/{id}/deactivate`

**Purpose:** Deactivate a prompt template.

**Auth:** `OWNER`

**Response:** `200 OK`

---

#### `DELETE /api/prompts/{id}`

**Purpose:** Delete a prompt template.

**Auth:** `OWNER`

**Validation:** Cannot delete if it's the only active template for its category.

**Response:** `204 No Content`

---

### F2: AI Generation (Orchestration)

> **Controller:** `AIOrchestrationController.java` (or integrated into domain controllers)
> **Purpose:** Unified AI generation gateway. All AI calls go through here for prompt resolution, LLM routing, and usage logging.

---

#### `POST /api/ai/generate`

**Purpose:** General-purpose AI generation endpoint. Used by other services internally and can be called directly for ad-hoc generation.

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "venueId": 1,
  "category": "SOCIAL_POST",
  "variables": {
    "shiftType": "EVENING",
    "date": "2026-02-09",
    "highlights": "New cocktail menu launch, 2 birthday parties"
  },
  "overrides": {
    "toneOfVoice": "extra casual",
    "language": "en"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "generatedContent": "New cocktail menu just dropped! 🍸 Two birthday crews partied with us tonight — this is what Friday at OSCHO looks like. #stuttgart #nightlife",
    "promptTemplateId": 5,
    "promptTemplateVersion": 3,
    "modelUsed": "claude-3-5-sonnet",
    "inputTokens": 342,
    "outputTokens": 87,
    "latencyMs": 1200,
    "usageLogId": 900
  }
}
```

**Internal Flow:**
1. Load `PromptTemplate` by venueId + category
2. Render `systemPrompt` and `userPromptTemplate` with variables
3. Apply overrides if provided
4. Call LLM (Claude or GPT based on category)
5. Log to `AIUsageLog`
6. Return generated content

---

#### `POST /api/ai/generate/batch`

**Purpose:** Generate multiple AI outputs in one call (e.g., generate social posts for all platforms at once).

**Auth:** `OWNER`, `MANAGER`

**Request Body:**
```json
{
  "venueId": 1,
  "category": "SOCIAL_POST",
  "variables": { "shiftType": "EVENING", "highlights": "..." },
  "platforms": ["INSTAGRAM", "FACEBOOK", "TIKTOK"]
}
```

**Response:** `200 OK` — Array of generated content, one per platform.

---

### F3: AI Usage Logs

> **Controller:** `AIUsageController.java`
> **Purpose:** Audit trail and cost tracking for all AI interactions.

---

#### `GET /api/ai/usage`

**Purpose:** List AI usage logs. Paginated.

**Auth:** `OWNER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Filter by venue |
| `promptTemplateId` | Long | Filter by prompt template |
| `modelUsed` | String | Filter by model (e.g., `claude-3-5-sonnet`) |
| `userId` | Long | Filter by user who triggered |
| `from` | DateTime | Date range start |
| `to` | DateTime | Date range end |
| `page`, `size`, `sort` | — | Pagination |

**Response:** `200 OK` — Paginated usage logs.

---

#### `GET /api/ai/usage/stats`

**Purpose:** Aggregated AI usage statistics — total tokens, cost estimation, acceptance rate.

**Auth:** `OWNER`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `venueId` | Long | Filter by venue |
| `from` | DateTime | Date range start |
| `to` | DateTime | Date range end |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalCalls": 342,
    "totalInputTokens": 128500,
    "totalOutputTokens": 45200,
    "estimatedCostUSD": 2.85,
    "averageLatencyMs": 980,
    "acceptanceRate": 0.78,
    "byCategory": {
      "SOCIAL_POST": { "calls": 120, "accepted": 95 },
      "REVIEW_RESPONSE": { "calls": 80, "accepted": 62 },
      "ONBOARDING_GUIDE": { "calls": 15, "accepted": 14 },
      "MENU_DESCRIPTION": { "calls": 92, "accepted": 70 },
      "SHIFT_SUMMARY": { "calls": 35, "accepted": 31 }
    },
    "byModel": {
      "claude-3-5-sonnet": { "calls": 250, "tokens": 135000 },
      "gpt-4o": { "calls": 92, "tokens": 38700 }
    }
  }
}
```

---

#### `PATCH /api/ai/usage/{id}/feedback`

**Purpose:** Record whether the AI-generated content was accepted or rejected by the user.

**Auth:** Any authenticated user.

**Request Body:**
```json
{
  "wasAccepted": true
}
```

**Response:** `200 OK`

---

---

## Cross-Domain Internal Calls (Service-to-Service)

> In the modular monolith, these are **direct Java method calls** between packages. If extracted to microservices later, each becomes an internal REST call. Documenting them here for clarity.

| # | Caller (From) | Callee (To) | Method / Endpoint | Purpose |
|---|--------------|-------------|-------------------|---------|
| S2S-1 | Guest (`GuestCheckService.close()`) | Menu (`MenuService`) | `getRecipeIngredients(menuItemId)` | Get ingredients to deplete when closing a check |
| S2S-2 | Guest (`GuestCheckService.close()`) | Inventory (`ProductService`) | `consume(productId, quantity)` | Deplete stock for each recipe ingredient |
| S2S-3 | Guest (`GuestCheckService.close()`) | Inventory (`StockService`) | `log(MENU_DEPLETION, productId, qty, shiftId)` | Create stock log entry for depletion |
| S2S-4 | Inventory (`OrderService.deliver()`) | Inventory (`ProductService`) | `restock(productId, quantity)` | Restock product when order delivered |
| S2S-5 | Inventory (`PredictiveEngineService`) | Guest (`ReservationService`) | `countByDate(venueId, date)` | Get reservation count for staffing predictions |
| S2S-6 | Operations (`VenueController.dashboard()`) | Inventory (`ProductService`) | `getLowStockCount(venueId)` | Low stock count for dashboard |
| S2S-7 | Operations (`VenueController.dashboard()`) | Guest (`GuestCheckService`) | `getOpenCheckCount(venueId)` | Open check count for dashboard |
| S2S-8 | Operations (`VenueController.dashboard()`) | Guest (`GuestCheckService`) | `getRevenueToday(venueId)` | Today's revenue for dashboard |
| S2S-9 | Operations (`VenueController.dashboard()`) | Guest (`ReservationService`) | `getPendingCount(venueId)` | Pending reservations for dashboard |
| S2S-10 | Operations (`ShiftController.revenue()`) | Guest (`GuestCheckService`) | `getRevenueByShift(shiftId)` | Revenue per shift analytics |
| S2S-11 | Social (`SocialPostService.generate()`) | AI (`AIOrchestrationService`) | `generate(category, variables)` | Generate social post content |
| S2S-12 | Social (`ReviewService.create()`) | AI (`AIOrchestrationService`) | `generate(REVIEW_RESPONSE, vars)` | Generate review response |
| S2S-13 | Social (`SocialPostService.generate()`) | Operations (`ShiftService`) | `getShiftData(shiftId)` | Get shift data for post context |
| S2S-14 | Menu (`MenuItemController.generateDesc()`) | AI (`AIOrchestrationService`) | `generate(MENU_DESCRIPTION, vars)` | Generate menu description |
| S2S-15 | Operations (`TrainingController.generate()`) | AI (`AIOrchestrationService`) | `generate(ONBOARDING_GUIDE, vars)` | Generate training module |
| S2S-16 | Guest (`GuestController.aiInsight()`) | AI (`AIOrchestrationService`) | `generate(inline, guestData)` | Generate guest insight |
| S2S-17 | Inventory (`PredictionController.staffing()`) | Operations (`ShiftService`) | `getHistoricalShiftData(venueId)` | Historical shift data for predictions |
| S2S-18 | Menu (`SyndicationService.sync()`) | Menu (`MenuService`) | `getMenuItemWithRecipe(id)` | Full menu data for export |
| S2S-19 | Guest (`GuestCheckService.close()`) | Guest (`ReservationService`) | `markCompleted(reservationId)` | Auto-complete reservation on check close |
| S2S-20 | Guest (`ReservationService.noShow()`) | Guest (`GuestService`) | `flagNoShow(guestProfileId)` | Update guest profile on no-show |
| S2S-21 | Inventory (`ProductService.consume/waste`) | WebSocket | `push(STOCK_UPDATE, productId, qty)` | Real-time dashboard update |
| S2S-22 | Guest (`GuestCheckService.close()`) | WebSocket | `push(CHECK_CLOSED, checkId, amount)` | Real-time revenue dashboard update |

---

## WebSocket Endpoints

> **Protocol:** STOMP over WebSocket
> **Base:** `ws://localhost:8080/ws`
> **Auth:** JWT token passed as query parameter: `ws://localhost:8080/ws?token=<JWT>`

---

### Connection

```
CONNECT ws://localhost:8080/ws?token=<JWT>
```

### Subscription Topics

| Topic | Payload | Purpose | Publisher |
|-------|---------|---------|-----------|
| `/topic/venue/{venueId}/stock-updates` | `{ productId, productName, currentQty, reorderLevel, type }` | Real-time stock level changes | `ProductService` on consume/restock/waste |
| `/topic/venue/{venueId}/checks` | `{ checkId, tableNumber, status, totalAmount }` | Guest check opened/closed/voided | `GuestCheckService` |
| `/topic/venue/{venueId}/low-stock-alerts` | `{ productId, productName, currentQty, daysUntilStockout }` | Alert when product drops below reorder level | `ProductService` |
| `/topic/venue/{venueId}/shift-updates` | `{ shiftId, type, event }` | Shift started/ended, checklist completed | `ShiftService`, `ChecklistService` |
| `/topic/venue/{venueId}/reservations` | `{ reservationId, guestName, status, time }` | Reservation created/confirmed/no-show | `ReservationService` |

---

## API Count Summary

| Service | Public Endpoints | Internal (S2S) Calls | WebSocket Topics |
|---------|-----------------|---------------------|-----------------|
| **Auth** | 6 | 0 | 0 |
| **A. Operations** | 33 | 2 outbound | 1 |
| **B. Inventory** | 24 | 3 outbound | 2 |
| **C. Menu** | 17 | 2 outbound | 0 |
| **D. Guest** | 26 | 5 outbound | 1 |
| **E. Social** | 17 | 3 outbound | 0 |
| **F. AI** | 10 | 0 outbound (receives) | 0 |
| **TOTAL** | **133** | **22 S2S calls** | **5 topics** |

---

*KesselOps API v1.0 — 133 endpoints · 22 internal calls · 5 WebSocket topics · Ready to build.*
