# UI-to-Backend Service Mapping

## Team Assignment Overview

| Developer | Backend Services            | Service Scope                                       |
| --------- | --------------------------- | --------------------------------------------------- |
| **Dev 1** | `Auth`, `Operations (Core)` | Users, Venues, Shifts, Handovers, Checklists, Teams |
| **Dev 2** | `Inventory`, `Menu`         | Products, Stock, Orders, Menu Items, Pricing        |
| **Dev 3** | `Guest`, `AI`               | Reservations, Profiles, Recommendations, Insights   |

---

## Dev 1: Auth & Operations (Core)

### Backend Services

- **Auth**: `auth-api.yaml` → `POST /auth/login`, `/register`, `/me`
- **Operations**: `operations-api.yaml` → Users, Venues, Shifts, Assignments, Handovers, Checklists, Training

### UI Pages

| Page           | Path                  | API Endpoints                                                    |
| -------------- | --------------------- | ---------------------------------------------------------------- |
| Login          | `/login`              | `POST /auth/login`                                               |
| Register       | `/register`           | `POST /auth/register`                                            |
| Join (Invite)  | `/join/[token]`       | `POST /auth/invite/accept`                                       |
| Main Dashboard | `/dashboard`          | `GET /shifts/current`, `GET /checklists/today`, `GET /users/:id` |
| Schedule       | `/dashboard/schedule` | `GET /shifts`, `POST /shifts`, AI: Schedule generation           |
| Tasks          | `/dashboard/tasks`    | `GET /checklists`, `PATCH /checklists/:id/items`                 |
| Handover       | `/dashboard/handover` | `GET /handovers/:shiftId`, `POST /handovers`                     |
| Team           | `/dashboard/team`     | `GET /users`, `POST /users/invite`, `PATCH /users/:id`           |
| Learn          | `/dashboard/learn`    | `GET /training-modules`, `PATCH /training-progress`              |
| Settings       | `/dashboard/settings` | `PATCH /users/me`, `PATCH /venues/:id`                           |

---

## Dev 2: Inventory & Menu

### Backend Services

- **Inventory**: `inventory-api.yaml` → Products, Stock Levels, Suppliers, Purchase Orders
- **Menu**: `menu-api.yaml` → Menu Items, Categories, Pricing, Availability (86'd)

### UI Pages

| Page                    | Path                   | API Endpoints                                                               |
| ----------------------- | ---------------------- | --------------------------------------------------------------------------- |
| Inventory               | `/dashboard/inventory` | `GET /products`, `PATCH /products/:id`, `POST /purchase-orders`             |
| Menu                    | `/dashboard/menu`      | `GET /menu-items`, `POST /menu-items`, `PATCH /menu-items/:id/availability` |
| Main Dashboard (Alerts) | `/dashboard`           | `GET /products?status=low` (Stock Alerts)                                   |

---

## Dev 3: Guest & AI

### Backend Services

- **Guest**: `guest-api.yaml` → Guest Profiles, Reservations, Evaluations
- **AI**: `ai-api.yaml` → Recommendations, Insights, Chatbot

### UI Pages

| Page                          | Path                  | API Endpoints                                          |
| ----------------------------- | --------------------- | ------------------------------------------------------ |
| Main Dashboard (Reservations) | `/dashboard`          | `GET /reservations/today`, AI: `GET /insights/summary` |
| Venue (Guest-facing)          | `/venue`              | `GET /venues/:id/menu`, `POST /reservations`           |
| Menu (AI Descriptions)        | `/dashboard/menu`     | AI: `POST /ai/menu-description`                        |
| Schedule (AI Suggestions)     | `/dashboard/schedule` | AI: `POST /ai/schedule-optimize`                       |

---

## Cross-Cutting Contracts

Each developer should understand these shared contracts:

```yaml
# Request: JWT Bearer Token in Authorization Header
Authorization: Bearer <token>

# Response: Standardized Error Format
{ "error": { "code": "ERR_CODE", "message": "Human readable" } }
```

---

## Suggested Workflow

1. **Agree on Auth Contract First** → All services depend on it.
2. **Define DTOs in `shared` package** → Reuse common models.
3. **Use OpenAPI contracts as source-of-truth** → Generate client code if needed.
