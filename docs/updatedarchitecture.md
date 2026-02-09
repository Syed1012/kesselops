# Restaurant Platform (Spring Modulith) — Developer Build Guide

This document describes **what to build** from the final domain model (bounded contexts in the diagram) and how the modules/services/APIs fit together in a **Java Spring Boot modulith**.

---

## 1) Architecture style

We will implement a **modular monolith** using **Spring Modulith**: one deployable application, split into strict internal modules that map 1:1 to your bounded contexts. [web:169]

**Cross-context integration** should be primarily **event-driven** (publish/consume domain events) to keep modules decoupled. [web:181]

---

## 2) Bounded contexts → Spring modules

Use the bounded-context boxes in your image as the **only** “services/modules”:

### A) Restaurant (Owner / Multi-venue)
**Goal:** Manage venues/locations and ownership boundaries.

**Core entities (from diagram):**
- `Restaurant`
- `Venue` (location)

**Responsibilities:**
- Create/edit venues (locations).
- Provide venue context to all other modules (which venue a table/menu/staff belongs to).

---

### B) Guest (Guest-facing + table sessions)
**Goal:** Handle guest lifecycle from reservation → seating → session → ordering → payment.

**Core entities:**
- `Guest`
- `Reservation`
- `Table`
- `Session`
- `Order`
- `Payment`
- `Staff` (assignment to session, e.g., waiter)

**Responsibilities:**
- Reservation creation (requires login/registered guest).
- QR scan -> start/join `Session` for a `Table`.
- Shared cart behavior: multiple guests can add to the same session.
- Payments: app payment + waiter/manual payment recorded against session.

---

### C) Operations (Staff shifts + training + checklists)
**Goal:** “Behind the doors” staff workflow.

**Core entities:**
- `Shift`
- `Checklist`
- `TaskItem`
- `PhotoProof` (proof attached to tasks)
- `Handover`
- `Onboarding`
- `LearningModule`

**Responsibilities:**
- Staff login and shift execution (clock-in/out).
- Checklist completion with optional photo proof.
- Handover notes at end of shift.
- Staff onboarding/training tracking.

---

### D) Menu (Menu publishing + syndication)
**Goal:** Maintain menus and syndicate them to external platforms.

**Core entities:**
- `Menu`
- `MenuSyndication`

**Responsibilities:**
- Own the “public menu” representation.
- Export/sync menus to external platforms (Google, speisekarte.de).

---

### E) Inventory (Ingredients + stock movements)
**Goal:** Track inventory levels and depletion from orders.

**Core entities:**
- `MenuItem`
- `Recipe`
- `RecipeIngredient`
- `InventoryItem`
- `StockLog`

**Responsibilities:**
- Maintain ingredient stock (`InventoryItem.quantityOnHand`).
- Record all movements in `StockLog` (delivery, depletion, waste adjustments).
- Compute depletion from recipes when orders are confirmed.

---

### F) Supplier (Purchase orders + delivery)
**Goal:** Replenishment loop with suppliers (e.g., UNIBEV).

**Core entities:**
- `Supplier`
- `SupplierOrder`
- `PurchaseItem`

**Responsibilities:**
- Create supplier orders (POs).
- Track PO status (draft/sent/delivered/received).
- On receiving a supplier order, increase inventory and add `StockLog` entries.

---

## 3) Key end-to-end flows (what the developer builds)

### 3.1 Guest ordering (QR, no login)
1. Guest scans QR on `Table`.
2. System finds/creates an **active `Session`** for that table.
3. App loads `Menu` for the venue and shows `MenuItem`s.
4. Guest adds items -> creates `Order` under `Session`.
5. `Order` confirmation triggers inventory depletion (see events section).
6. Kitchen/chef flow is driven by `Order.status` (PENDING → KITCHEN → READY → SERVED).
7. Waiter is notified when order becomes READY and delivers to guest.

**Important:** session is the “tab” for multi-guest ordering; it is not the same thing as the `Guest` user account.

---

### 3.2 Guest reservation (login required)
1. Guest registers/logs in.
2. Guest creates `Reservation` (party size, datetime).
3. On arrival, reservation converts to (or attaches to) an active `Session`.

---

### 3.3 Staff flow (waiter/chef)
1. Staff logs in.
2. Staff views assigned shifts, opens a shift.
3. Staff completes checklist tasks (may include photo proof).
4. Waiter manages sessions (open guest check), adds items, and collects payment (manual).
5. Chef sees kitchen workload derived from orders in KITCHEN state and marks READY.

---

### 3.4 Manager flow (inventory + supplier)
1. Manager monitors real-time stock levels.
2. System raises low-stock alerts (or manager filters items below reorder threshold).
3. Manager creates `SupplierOrder` to UNIBEV, adds `PurchaseItem`s.
4. Manager tracks delivery, receives goods, inventory increases, stock logs recorded.
5. Manager reviews handovers and analytics.

---

### 3.5 Owner flow (multi-venue + configuration + sync)
1. Owner logs in.
2. Owner manages venues/locations (`Restaurant`, `Venue`).
3. Owner creates/edits menu items & recipes (Menu + Inventory contexts).
4. Owner configures AI prompts (store this as config under Restaurant/Venue scope; do not create a separate “AI service” unless needed).
5. Owner syncs menu to external platforms.
6. Owner reviews analytics and manages guest profiles/reservations.

---

## 4) Public APIs (by bounded context)

Below endpoints are **suggested**. Adjust naming to your project conventions.

### Restaurant module
- `POST /api/restaurants`
- `POST /api/restaurants/{restaurantId}/venues`
- `GET  /api/restaurants/{restaurantId}/venues`

### Reservation module
- `POST /api/reservations`
- `GET  /api/reservations?date=YYYY-MM-DD`
- `POST /api/tables/{tableId}/sessions/start` (QR scan entry)
- `GET  /api/sessions/{sessionId}`
- `POST /api/sessions/{sessionId}/orders`
- `PATCH /api/orders/{orderId}/status`
- `POST /api/sessions/{sessionId}/payments` (app or manual)

### Operations module
- `POST /api/shifts/clock-in`
- `POST /api/shifts/clock-out`
- `GET  /api/shifts/me?range=today|week`
- `GET  /api/checklists/{shiftId}`
- `POST /api/tasks/{taskItemId}/complete` (optional photo upload)
- `POST /api/handover/{shiftId}`

### Menu module
- `POST /api/menus`
- `POST /api/menus/{menuId}/publish`
- `POST /api/menus/{menuId}/syndications` (configure platforms)
- `POST /api/menus/{menuId}/sync` (push to Google/speisekarte.de)

### Inventory module
- `GET  /api/inventory/items`
- `POST /api/inventory/items`
- `POST /api/recipes`
- `POST /api/menu-items`
- `POST /api/inventory/adjustments` (waste, correction) -> writes `StockLog`

### Supplier module
- `POST /api/suppliers`
- `POST /api/supplier-orders`
- `POST /api/supplier-orders/{orderId}/send`
- `POST /api/supplier-orders/{orderId}/receive` (increases inventory + stock logs)

---

## 5) Events between modules (recommended)

To keep bounded contexts clean, connect them using domain events. [web:181]

### Reservation → Inventory
- **Event:** `OrderConfirmed`
- **Consumer:** Inventory
- **Action:** For each ordered `MenuItem`, resolve `Recipe` → `RecipeIngredient`s → decrement `InventoryItem` and append `StockLog` entries.

### Reservation → Operations (optional notifications)
- **Event:** `OrderReady`
- **Consumer:** Operations (or Reservation itself if waiter notification stays there)
- **Action:** notify assigned waiter for the session.

### Supplier → Inventory
- **Event:** `SupplierOrderReceived`
- **Consumer:** Inventory
- **Action:** increment inventory + stock logs.

---

## 6) Suggested package structure (Spring Modulith)

Base package (example): `com.yourorg.restaurant`

com.yourorg.restaurant
├─ restaurant/ (Restaurant + Venue)
├─ reservation/ (Guest, Reservation, Table, Session, Order, Payment)
├─ operations/ (Shift, Checklist, TaskItem, Handover, Onboarding)
├─ menu/ (Menu, MenuSyndication)
├─ inventory/ (MenuItem, Recipe, InventoryItem, StockLog)
└─ supplier/ (Supplier, SupplierOrder, PurchaseItem)

text

Each module exposes only its public API; keep internals in `...<module>.internal...` (per Spring Modulith conventions). [web:169]

---

## 7) Implementation roadmap (practical build order)

### Milestone 1 — Restaurant + Menu
- Restaurant/Venue CRUD
- Menu CRUD + MenuSyndication config

### Milestone 2 — QR session + ordering + payments
- Table + QR session start/join
- Shared cart / order creation
- Payment recording (manual + app)

### Milestone 3 — Kitchen + staff operations
- Order status workflow (KITCHEN/READY/SERVED)
- Shift + checklist + handover
- Basic onboarding tracking

### Milestone 4 — Inventory + supplier loop
- Recipes & recipe ingredients
- Depletion via `OrderConfirmed` event
- Supplier ordering and receiving (stock increases + stock logs)

### Milestone 5 — Analytics
- Revenue trends from `Payment`
- Consumption/waste from `StockLog` + adjustments
- Waste patterns by ingredient/menu item

---

## 8) Notes to keep it simple
- Treat **Owner/Manager/Waiter/Chef** as `Staff.role` (no separate tables).
- Keep “AI prompts” as `Restaurant`/`Venue` configuration fields (JSON) unless you later need versioning and audit logs.
- Store every stock change in `StockLog`; never “just update quantity” without a log entry.

---