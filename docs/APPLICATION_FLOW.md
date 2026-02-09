# KesselOps — Complete Application Flow

> **Hackathon Stuttgart 2026** · Feb 9–11 · "Code. Cocktails. Repeat."
>
> This document explains how KesselOps works end-to-end, using our system design, domain model, and architecture.

---

## Table of Contents

1. [High-Level System Flow](#1-high-level-system-flow)
2. [User Journey by Role](#2-user-journey-by-role)
3. [Core Business Process Flows](#3-core-business-process-flows)
4. [Technical Data Flow](#4-technical-data-flow)
5. [AI Integration Points](#5-ai-integration-points)
6. [Inter-Domain Communication](#6-inter-domain-communication)
7. [Real-Time Features](#7-real-time-features)

---

## 1. High-Level System Flow

### The Big Picture

```
┌─────────────────────────────────────────────────────────────────┐
│                     KESSELOPS ECOSYSTEM                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   FRONTEND CLIENTS                       │  │
│  │  (Next.js + Zustand + React Query)                      │  │
│  │                                                          │  │
│  │  👥 Staff (Mobile)   📋 Manager (Tablet)   📊 Owner     │  │
│  └────────────────────────────┬─────────────────────────────┘  │
│                               │ HTTPS + REST + WebSocket       │
│                               ▼                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            API GATEWAY + VALIDATION                     │  │
│  │  (Spring Cloud Gateway, JWT Auth, Rate Limiting)        │  │
│  └──┬────────┬────────┬────────┬────────┬─────────────────┘  │
│     │        │        │        │        │                   │
│     ▼        ▼        ▼        ▼        ▼                   │
│  ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐                  │
│  │ OPS  ││ INV  ││ MENU ││GUEST ││ AI   │                  │
│  │ SVC  ││ SVC  ││ SVC  ││ SVC  ││ SVC  │                  │
│  └──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘                  │
│     │       │       │       │       │                       │
│     └───────┴───────┼───────┴───────┘                      │
│                     │                                       │
│                     ▼                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         POSTGRESQL (5 SCHEMAS)                       │  │
│  │  ┌────────┬───────────┬──────┬───────┬──────┐        │  │
│  │  │ ops    │ inventory │ menu │ guest │ ai   │        │  │
│  │  └────────┴───────────┴──────┴───────┴──────┘        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      SUPPORTING SERVICES                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐ │  │
│  │  │Redis Cache  │  │S3/MinIO     │  │LLM API       │ │  │
│  │  │(sessions,   │  │(photo proof,│  │(Claude,GPT)  │ │  │
│  │  │websocket)   │  │menu images) │  │              │ │  │
│  │  └─────────────┘  └─────────────┘  └──────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. User Journey by Role

### Role Hierarchy & Access

```
OWNER (highest)
├─ Full platform access
├─ Venue management
├─ Financial analytics
└─ Staff onboarding

MANAGER
├─ Shift planning & checklists
├─ Inventory alerts
├─ Menu management
└─ Guest history review

STAFF
├─ Check in for shift
├─ Complete checklists (with photos)
├─ Log guest checks (POS)
├─ View training modules
└─ Receive handover notes

TRAINEE (lowest)
├─ View training modules
├─ Complete checklists
└─ No financial/sensitive data
```

---

### 2.1 OWNER Morning Routine

```
┌─ OWNER ARRIVES AT OFFICE (8:00 AM)
│
├─ [BROWSER] → Opens KesselOps Dashboard
│   └─ Frontend: Zustand loads user session from localStorage
│       └─ JWT token sent with every request
│           └─ Backend: JwtAuthFilter validates token
│               └─ SecurityContext set with ROLE_OWNER
│
├─ [Dashboard Overview Page]
│   └─ TanStack Query makes 3 concurrent requests:
│       ├─ GET /api/operations/venues
│       │   └─ Returns: [Venue1, Venue2, Venue3]
│       ├─ GET /api/guest/guest-checks/today
│       │   └─ Returns: Total revenue, check count, avg. per guest
│       └─ GET /api/inventory/products/low-stock
│           └─ Returns: [Product1 (5 units), Product2 (2 units)]
│
├─ [Sees Alert]
│   │ "Stuttgart Venue: 3 low-stock items"
│   │ "Revenue today: €2,340 | Avg check: €28.50"
│   └─ Owner decides to review the Stuttgart venue
│
├─ Clicks "Venues" → [GET /api/operations/venues/{stuttgartVenueId}]
│   └─ Returns: {id, name, address, staffCount, shiftsTodayCount}
│       ├─ Venue: Stuttgart (4 staff, 2 shifts scheduled)
│       └─ Owner can view: Shifts, Inventory, Menu, Guest Checks, Analytics
│
├─ [Venue Detail Page]
│   └─ Clicks "Inventory" tab
│       └─ GET /api/inventory/products/by-venue/{stuttgartVenueId}
│           └─ Shows stock dashboard with:
│               ├─ Real-time consumption graphs (WebSocket live)
│               ├─ Reorder alerts (AI-suggested)
│               └─ Supplier comparison (UNIBEV pricing)
│
└─ [Action] Owner approves order
    └─ POST /api/inventory/orders
        ├─ Body: {venueId, supplierId, items: [{productId, quantity}]}
        └─ Creates Order in DB, notifies supplier
```

**Key Technologies Used:**
- **Frontend:** Next.js (SSR), TanStack Query (caching), Zustand (auth state)
- **Backend:** Spring Data JPA, REST controller, JWT validation
- **Database:** PostgreSQL (operations.venue, inventory.product, guest.guest_checks)
- **Real-time:** WebSocket subscription to inventory.consumption_events

---

### 2.2 MANAGER Shift Planning (Hackathon Day: Saturday)

```
┌─ MANAGER LOGS IN (10:00 AM Saturday)
│
├─ [GET /api/operations/venues/{venueId}/shifts?date=2026-02-09]
│   └─ Returns: [Shift1(Morning, unassigned), Shift2(Evening, unassigned)]
│
├─ [Shift Planning Board - Drag-Drop UI]
│   │ (Component: <shift-calendar>)
│   │
│   │ Shift 1 (Morning): 8 AM - 2 PM
│   │   └─ Drag Staff #1 onto Shift 1
│   │       └─ Frontend: Optimistic update
│   │           └─ PUT /api/operations/shifts/{shiftId}/assign
│   │               ├─ Body: {userId: 1, role: STAFF, status: PENDING}
│   │               └─ Backend:
│   │                   ├─ Creates ShiftAssignment
│   │                   ├─ Sends notification to Staff #1
│   │                   └─ Returns: {status: "PENDING", message: "Assignment sent"}
│   │
│   │ Shift 2 (Evening): 4 PM - 11 PM
│   │   └─ Drag Staff #2 onto Shift 2
│   │       └─ Same flow as above
│   │
│   └─ Save (auto-saves on change)
│
├─ [Manager also creates new checklist template]
│   │
│   │ Click "Add Checklist for this shift"
│   │   └─ POST /api/operations/shifts/{shiftId}/checklists
│   │       ├─ Body: {
│   │       │   "name": "Opening Checklist",
│   │       │   "category": "OPENING",
│   │       │   "tasks": [
│   │       │     {"title": "Check beer taps", "durationMinutes": 5},
│   │       │     {"title": "Verify POS system", "durationMinutes": 3},
│   │       │     {"title": "Count cash drawer", "durationMinutes": 10}
│   │       │   ]
│   │       │ }
│   │       └─ Backend creates Checklist + 3 TaskItems
│   │           └─ Returns: {checklistId, tasksCount}
│   │
│   └─ Checklist will be sent to staff when shift starts
│
└─ [END OF MANAGER WORK]
    └─ Database state:
        ├─ 2 ShiftAssignments created (status: PENDING)
        ├─ 1 Checklist created with 3 TaskItems
        ├─ Staff #1 & #2 received notifications
        └─ Next: waiting for staff confirmation
```

**Key Database State:**
```sql
-- operations.shifts
INSERT INTO shifts (venue_id, start_time, end_time, type) 
VALUES (1, '2026-02-09 08:00', '2026-02-09 14:00', 'MORNING');

-- operations.shift_assignments
INSERT INTO shift_assignments (user_id, shift_id, role, status, assigned_at)
VALUES (2, 1, 'STAFF', 'PENDING', NOW());

-- operations.checklists
INSERT INTO checklists (shift_id, name, category) 
VALUES (1, 'Opening Checklist', 'OPENING');

-- operations.task_items (3 rows, one for each task)
INSERT INTO task_items (checklist_id, title, duration_minutes, status)
VALUES (1, 'Check beer taps', 5, 'PENDING');
```

---

### 2.3 STAFF Morning Shift (Reality Begins!)

```
┌─ STAFF MEMBER RECEIVES NOTIFICATION (7:45 AM)
│  └─ Push notification: "You are assigned to Morning Shift at Stuttgart Venue"
│
├─ [STAFF OPENS APP - PWA on Mobile]
│  └─ Next.js PWA loads from cache (offline-capable)
│      └─ Syncs with backend when online
│
├─ [Shift Confirmation Page]
│  └─ GET /api/operations/shifts/{shiftId}/my-assignments
│      └─ Shows: Staff #1 has 1 PENDING assignment for Shift 1
│          ├─ Shift: Morning, 8 AM - 2 PM
│          ├─ Venue: Stuttgart
│          └─ Action: "Confirm" or "Decline"
│
├─ [STAFF CONFIRMS] → PUT /api/operations/shifts/{assignmentId}/confirm
│  └─ Updates ShiftAssignment.status = CONFIRMED
│      └─ Manager gets notification: "Staff #1 confirmed for Shift 1"
│
├─ ─────────────────────────────────────────────────────────
│  NOW: 8:00 AM - Shift Starts
├─ ─────────────────────────────────────────────────────────
│
├─ [STAFF OPENS APP AGAIN - At Venue]
│  └─ GET /api/operations/shifts/{shiftId}/my-current
│      └─ Returns: {shiftId, checklistsAssignedToMe: [Opening Checklist]}
│
├─ [OPENING CHECKLIST PAGE]
│  │ Component: <checklist-card>
│  │
│  │ Opening Checklist (Created by Manager earlier)
│  │ ┌─────────────────────────────────────────┐
│  │ │ ☐ Check beer taps (5 min)               │
│  │ │ ☐ Verify POS system (3 min)             │
│  │ │ ☐ Count cash drawer (10 min)            │
│  │ └─────────────────────────────────────────┘
│  │
│  └─ Staff starts checking tasks...
│
├─ [TASK 1: Check beer taps] ← 8:05 AM
│  │
│  │ Staff taps the task
│  │   └─ Modal opens: "Check beer taps"
│  │       ├─ Description: (if provided by manager)
│  │       ├─ Upload Photo Proof (HACCP requirement)
│  │       │   └─ Click camera icon → Browser MediaDevices API
│  │       │       ├─ Takes photo
│  │       │       ├─ Uploads to S3/MinIO
│  │       │       └─ S3 returns signed URL
│  │       │
│  │       └─ Click "Complete" → PUT /api/operations/tasks/{taskId}/complete
│  │           ├─ Body: {
│  │           │   "status": "COMPLETED",
│  │           │   "photoProofUrl": "https://s3.../photo-xyz.jpg",
│  │           │   "completedAt": "2026-02-09T08:05:30Z",
│  │           │   "completedByUserId": 2
│  │           │ }
│  │           └─ Backend:
│  │               ├─ Creates PhotoProof entity
│  │               ├─ Updates TaskItem.status = COMPLETED
│  │               └─ Emits WebSocket event: "task.completed"
│  │
│  │ Frontend updates optimistically:
│  │   ✓ Check beer taps (5 min) - COMPLETED
│  │
│  └─ Remaining: 2 of 3 tasks
│
├─ [TASK 2: Verify POS system] ← 8:08 AM
│  └─ Same flow as Task 1 (maybe no photo needed)
│      └─ PUT /api/operations/tasks/{taskId}/complete
│          └─ TaskItem.status = COMPLETED
│
│  ✓ Verify POS system (3 min) - COMPLETED
│  Remaining: 1 of 3 tasks
│
├─ [TASK 3: Count cash drawer] ← 8:20 AM
│  │
│  │ Staff taps the task
│  │   └─ Modal: "Count cash drawer"
│  │       ├─ Photo: upload from cash register
│  │       ├─ Notes: "€450 in till"
│  │       └─ Click "Complete"
│  │           └─ PUT /api/operations/tasks/{taskId}/complete
│  │
│  └─ ✓ Count cash drawer (10 min) - COMPLETED
│
├─ [ALL TASKS DONE] 8:30 AM
│  └─ Frontend detects all tasks completed
│      └─ Checklist.status = COMPLETED
│          ├─ Triggers AI Feature #3: Shift Summary Generator (optional)
│          └─ Staff sees: "Opening checklist completed!"
│
├─ ─────────────────────────────────────────────────────────
│  SHIFT CONTINUES: 8:30 AM - 2:00 PM
├─ ─────────────────────────────────────────────────────────
│
├─ [DURING SHIFT: Guest Orders Arrive]
│  │ (POS Integration Point - future feature)
│  │
│  │ Guest 1: "2x Barrel Old Fashioned, 1x Botanical Booster"
│  │   └─ Staff enters into POS → triggers inventory depletion
│  │
│  │ Recipe for Barrel Old Fashioned:
│  │   ├─ 50ml Bourbon (Product: Bourbon Whiskey)
│  │   ├─ 20ml Keg Cocktail Mix (Product: meincocktailfass keg)
│  │   └─ Bitters drop (Product: Angostura Bitters)
│  │
│  │ System automatically:
│  │   ├─ Finds Recipe via MenuItem
│  │   ├─ Gets RecipeIngredients
│  │   ├─ Creates StockLog for each ingredient
│  │   │   └─ {productId, venueId, type: MENU_DEPLETION, quantity: -50}
│  │   └─ Updates Product.currentStock
│  │
│  │ Bonus: Monitor detects keg level < reorder threshold
│  │   └─ Alert sent to Manager: "Keg cocktail mix: 2 units remaining"
│  │
│  └─ Check is logged:
│     └─ POST /api/guest/guest-checks
│         ├─ Body: {
│         │   "venueId": 1,
│         │   "shiftId": 1,
│         │   "servedByUserId": 2,
│         │   "items": [
│         │     {"menuItemId": 5, "quantity": 2, "price": 12.50},
│         │     {"menuItemId": 10, "quantity": 1, "price": 8.00}
│         │   ],
│         │   "paymentMethod": "CARD",
│         │   "totalAmount": 33.00
│         │ }
│         └─ Returns: {checkId, totalAmount, timestamp}
│
│ [Multiple guest checks throughout the shift]
│   └─ Each one triggers inventory depletion
│       └─ Real-time consumption chart on owner dashboard updates
│
├─ ─────────────────────────────────────────────────────────
│  END OF SHIFT: 2:00 PM
├─ ─────────────────────────────────────────────────────────
│
├─ [STAFF CLOSES SHIFT]
│  │
│  │ Staff taps "Close Shift"
│  │   └─ POST /api/operations/shifts/{shiftId}/close
│  │       └─ Computes:
│  │           ├─ Checklist completion rate
│  │           ├─ Guest checks processed: 12
│  │           ├─ Total revenue: €287.50
│  │           ├─ Stock consumed: 47 units
│  │           ├─ Waste logged: 3 units
│  │           └─ Summary generated by AI (Feature #3)
│  │
│  │ AI Prompt Template (SHIFT_SUMMARY):
│  │   systemPrompt: "You are the shift summarizer for {venue.name}. Be concise."
│  │   userPromptTemplate: "Summarize: {shift.checklist_completion}, revenue: {shift.total_amount}, guests served: {shift.guest_check_count}, waste: {shift.waste_units}"
│  │   → Output: "Morning shift: solid execution. 87% checklist completion. €287 revenue. Monitor waste on Mondays."
│  │
│  └─ Backend creates ShiftHandover entity (ready for next shift staff)
│
├─ [NEXT SHIFT STAFF ARRIVES] - 1:45 PM (early)
│  │
│  │ GET /api/operations/handovers/for-shift/{afternoonShiftId}
│  │   └─ Returns: {
│  │       "fromShift": {type: MORNING, staff: "Staff#1", time: "8 AM - 2 PM"},
│  │       "summary": "Morning shift: solid execution. 87% completion. €287 revenue.",
│  │       "openIssues": "Keg level at 15% - reorder soon",
│  │       "nextSteps": "Check guest reservation at 3 PM",
│  │       "acknowledgedAt": null
│  │     }
│  │
│  │ Afternoon shift staff reviews, then:
│  │   └─ PUT /api/operations/handovers/{handoverId}/acknowledge
│  │       └─ handover.acknowledgedAt = NOW()
│  │
│  └─ Traditional WhatsApp message replaced with structured handover ✓
│
└─ [SHIFT COMPLETE]
   └─ Database state:
       ├─ Shift.isActive = false
       ├─ 1 Checklist completed (all 3 tasks with photos)
       ├─ 12 GuestChecks created
       ├─ 47 StockLogs created (MENU_DEPLETION)
       ├─ 3 StockLogs created (WASTE)
       ├─ 1 ShiftHandover created
       └─ KesselOps has full audit trail of the shift
```

---

## 3. Core Business Process Flows

### 3.1 Order-to-Consumption Flow (Inventory Cycle)

```
┌─────────────────────────────────────────────────────────────┐
│             INVENTORY & CONSUMPTION CYCLE                   │
└─────────────────────────────────────────────────────────────┘

Phase 1: OWNER PLACES ORDER
─────────────────────────────
  Owner sees: low-stock alert for "Bourbon Whiskey" (3 bottles left)
  
  Action: [POST /api/inventory/orders]
  ├─ Body: {
  │   "venueId": 1,
  │   "supplierId": 2,  ← UNIBEV
  │   "items": [
  │     {"productId": 5, "quantity": 12},  ← Bourbon Whiskey x12
  │     {"productId": 8, "quantity": 5}    ← Angostura Bitters x5
  │   ]
  │ }
  └─ Backend creates:
      ├─ Order (status: PENDING)
      ├─ 2 OrderItems (linked to products)
      └─ Notification sent to supplier

Phase 2: SUPPLIER DELIVERS
──────────────────────────
  Supplier (UNIBEV) delivers order
  
  Manager receives goods, verifies, then:
  
  Action: [PUT /api/inventory/orders/{orderId}/delivered]
  └─ Backend:
      ├─ Updates Order.status = DELIVERED
      ├─ For each OrderItem:
      │   └─ Updates Product.currentStock += quantity
      │       └─ Product.Bourbon.stock: 3 → 15
      │       └─ Product.Bitters.stock: 2 → 7
      └─ Creates StockLog for each product:
          {type: RECEIPT, quantity: +12, productId: 5}
          {type: RECEIPT, quantity: +5, productId: 8}

Phase 3: STAFF USES PRODUCTS (During Shifts)
──────────────────────────────────────────────
  Throughout the day, staff sell menu items containing these products.
  
  Example: Guest orders "Barrel Old Fashioned" at 10:30 AM
  
  System flow:
    1. GuestCheck created → {menuItemId: "Barrel Old Fashioned"}
    2. MenuItem loaded → finds Recipe
    3. Recipe has 3 ingredients:
       ├─ RecipeIngredient: Product#5 (Bourbon), quantity: 50ml
       ├─ RecipeIngredient: Product#8 (Bitters), quantity: 2 drops
       └─ RecipeIngredient: Product#9 (Angostura), quantity: 1 drop
    4. For each ingredient:
       └─ Create StockLog:
           {type: MENU_DEPLETION, quantity: -50, productId: 5}
           {type: MENU_DEPLETION, quantity: -2, productId: 8}
    5. Update Product.currentStock:
       └─ Product#5.stock: 15 → 14.95
    6. Real-time inventory dashboard updates (WebSocket)

Phase 4: WASTE TRACKING (Spillage/Spoilage)
────────────────────────────────────────────
  At end of shift, manager logs waste:
  
  Action: [POST /api/inventory/stock-logs]
  └─ Body: {
      "productId": 5,
      "type": "WASTE",
      "quantity": -1.5,  ← 1.5L of Bourbon wasted
      "reason": "Bottle broke during cleanup",
      "shiftId": 1
    }
    └─ Backend creates StockLog
        └─ Tracking enabled for analytics

Phase 5: ANALYTICS & PREDICTIONS
────────────────────────────────
  At end of day, system analyzes:
  
  GET /api/inventory/products/{productId}/consumption-trend
  └─ Returns: {
      "productId": 5,
      "weeklyConsumption": [
        {day: "Monday", quantity: 8.2},
        {day: "Tuesday", quantity: 6.5},
        {day: "Wednesday", quantity: 7.1},
        {day: "Thursday", quantity: 9.3},
        {day: "Friday", quantity: 12.1},  ← Peak day
        {day: "Saturday", quantity: 14.5},
        {day: "Sunday", quantity: 10.8}
      ],
      "nextWeekPredictedNeed": 68.5,  ← AI prediction
      "currentStock": 13.5,
      "daysUntilStockout": 4.5  ← Warning!
    }

Database State at End of Day:
─────────────────────────────
  Product#5 (Bourbon Whiskey):
    ├─ current_stock: 13.5L
    ├─ StockLogs: [
    │   {type: RECEIPT, qty: 12, time: 9:00 AM},
    │   {type: MENU_DEPLETION, qty: -0.05, time: 10:30 AM},  ← Guest 1
    │   {type: MENU_DEPLETION, qty: -0.05, time: 11:15 AM},  ← Guest 2
    │   {type: MENU_DEPLETION, qty: -0.10, time: 1:00 PM},   ← Guest 3
    │   {type: WASTE, qty: -1.5, time: 2:00 PM}              ← Spillage
    │ ]
    └─ ConsumptionTrend analysis complete
       ├─ Monday is heavy consumption day
       ├─ Waste ratio: 1.5 / (0.20 + 1.5) = 88% waste — ALERT!
       └─ Recommendation: "Train staff on measurement"
```

---

### 3.2 Guest Journey (Reservations to Evaluation)

```
┌─────────────────────────────────────────────────────────────┐
│              GUEST MANAGEMENT LIFECYCLE                     │
└─────────────────────────────────────────────────────────────┘

Day 1: GUEST MAKES RESERVATION (Via 3rd Party or Direct)
────────────────────────────────
  New guest "Anna" calls venue or books via online system
  
  Manager receives booking, creates:
  
  POST /api/guest/reservations
  └─ Body: {
      "venueId": 1,
      "guestName": "Anna",
      "partySize": 4,
      "reservationTime": "2026-02-14 19:30",  ← Valentine's Day
      "specialRequests": "Window seat, anniversary",
      "status": "PENDING"  ← Awaiting confirmation
    }
    └─ Backend:
        ├─ Creates Reservation entity
        ├─ Checks table availability
        ├─ Sends confirmation email to guest
        └─ Returns: {reservationId, confirmedAt, tableNumber}

Day 2-13: CONFIRMATION PHASE
──────────────
  Manager confirms via email or phone:
  
  PUT /api/guest/reservations/{reservationId}/confirm
  └─ Reservation.status = CONFIRMED
      └─ Guest receives: "Your table is confirmed for Feb 14, 7:30 PM"

Day 14: RESERVATION DAY - GUEST ARRIVES
───────────────────────────────
  7:00 PM: Guest arrives (30 min early)
  
  7:20 PM: Staff checks reservation:
  
  GET /api/guest/reservations/by-time/{venueId}?time=19:30
  └─ Returns: "Anna's party of 4 — window seat"
  
  PUT /api/guest/reservations/{reservationId}/seat
  └─ Reservation.status = SEATED
  
  System also checks GuestProfile history:
  
  GET /api/guest/profiles/by-phone/{phoneNumber}
  └─ Finds: "Anna is a returning guest"
      ├─ Previous visits: 3
      ├─ Last visit: 2025-12-20
      ├─ Avg check: €45
      ├─ Preferences: {preferredDrink: "Aperol Spritz", dietaryRestrictions: "vegetarian"}
      └─ Staff notes: "Anna loves local wines, recommend Württemberg Riesling"

7:30 PM - 10:00 PM: DINING EXPERIENCE
─────────────────
  Staff takes order, enters into POS system:
  
  Order:
    ├─ 4x Württemberg Riesling (€7 each)
    ├─ 4x Appetizers (€12 each)
    ├─ 2x Barrel Old Fashioned (€12.50 each)
    ├─ 2x Botanical Booster (€8 each)
    ├─ 4x Main Courses (€22 each)
    └─ Total: €183
  
  Each item creates GuestCheckItem + StockLog for depletion
  
  → POST /api/guest/guest-checks
    └─ Body: {
        "venueId": 1,
        "shiftId": 2,
        "reservationId": 123,  ← Links to Anna's reservation
        "servedByUserId": 3,
        "items": [
          {"menuItemId": 1, "quantity": 4, "price": 7.00},
          ... (other items)
        ],
        "totalAmount": 183.00,
        "paymentMethod": "CARD",
        "guestName": "Anna"
      }
    └─ Returns: checkId, timestamp
    └─ Triggers: Inventory depletion, revenue tracking

10:00 PM: GUEST LEAVES
──────────────
  PUT /api/guest/reservations/{reservationId}/close
  └─ Reservation.status = COMPLETED
  
  System creates GuestCheck final state:
  └─ GuestCheck.status = CLOSED
      ├─ Time at table: 2h 40m
      ├─ Per-person spend: €45.75
      └─ Staff rating opportunity

7 DAYS LATER: EMAIL SURVEY
────────────
  Guest receives email:
  "How was your visit? Rate your experience!"
  
  Anna responds:
    ├─ Overall: 5 stars
    ├─ Food: 5 stars
    ├─ Service: 4 stars
    ├─ Ambiance: 5 stars
    └─ Comments: "Amazing wines, staff could remember our anniversary!"

Manager imports evaluation:
  
  POST /api/guest/evaluations
  └─ Body: {
      "guestProfileId": 123,  ← Anna's profile
      "reservationId": 456,
      "overallRating": 5,
      "foodRating": 5,
      "serviceRating": 4,
      "ambianceRating": 5,
      "comments": "Amazing wines, staff could remember our anniversary!"
    }
    └─ Backend creates GuestEvaluation
        ├─ Computes: Average guest score for venue
        └─ Creates KPI: "Service training needed: 4⭐ vs target 4.8⭐"

DATABASE STATE - GUEST ANNA'S JOURNEY:
──────────────────────────
  guest.guest_profiles:
    ├─ id: 123
    ├─ name: "Anna"
    ├─ email: "anna@example.com"
    ├─ phone: "+49-XXX"
    ├─ visits: 4  ← Incremented after this visit
    ├─ lifetime_value: €418  ← €235 + prev 3 visits
    ├─ preferences: {vegetarian: true, preferredDrink: "Aperol Spritz"}
    └─ guest_score: 4.8  ← Calculated from evaluations

  guest.reservations:
    ├─ id: 456
    ├─ guest_profile_id: 123
    ├─ venue_id: 1
    ├─ reservation_time: 2026-02-14 19:30
    ├─ party_size: 4
    ├─ status: COMPLETED  ← Full lifecycle
    ├─ seated_at: 2026-02-14 19:20
    ├─ check_closed_at: 2026-02-14 22:00
    └─ special_requests: "Window seat, anniversary"

  guest.guest_checks:
    ├─ id: 789
    ├─ reservation_id: 456
    ├─ guest_profile_id: 123
    ├─ shift_id: 2
    ├─ total_amount: 183.00
    ├─ items_count: 14
    ├─ status: CLOSED
    └─ items: [
        {menu_item_id: 1, quantity: 4, price: 7.00},
        ... (other items)
      ]

  guest.guest_evaluations:
    ├─ id: 999
    ├─ guest_profile_id: 123
    ├─ reservation_id: 456
    ├─ overall_rating: 5
    ├─ service_rating: 4
    ├─ created_at: 2026-02-21
    └─ comments: "Amazing wines, staff could remember our anniversary!"

MANAGER'S ACTION (Based on Data)
────────────────
  Manager sees: "Anna is a 4-visit returning guest with 4.8⭐ score"
  
  Decision: Offer VIP treatment next time
    ├─ Automatic table upgrade
    ├─ Complimentary house wine
    ├─ Birthday greeting (if tracked)
    └─ Exclusive menu preview
```

---

### 3.3 AI-Powered Onboarding Flow

```
┌─────────────────────────────────────────────────────────────┐
│            AI STAFF ONBOARDING GENERATION                  │
└─────────────────────────────────────────────────────────────┘

TRIGGER: New Staff Member Joins
────────────────────────────────
  Manager creates:
  
  POST /api/operations/users
  └─ Body: {
      "firstName": "Tom",
      "lastName": "Schmidt",
      "email": "tom@example.com",
      "role": "TRAINEE",
      "venueId": 1,  ← Stuttgart venue
      "phone": "+49-XXX"
    }
    └─ Backend creates User entity
        └─ Triggers: AI Onboarding Generator

STEP 1: LOAD CONTEXT
────────────────────
  AIOrchestrationService fetches:
  
  ├─ User: {name: "Tom", role: TRAINEE}
  ├─ Venue: {name: "Stuttgart Lounge", type: "cocktail_bar"}
  ├─ Existing TrainingModules for this venue:
  │   ├─ "Health & Safety"
  │   ├─ "Cash Register System"
  │   ├─ "Beverage Knowledge"
  │   └─ "Guest Service Excellence"
  └─ Prompt Template (DB):
      └─ category: ONBOARDING_GUIDE
      └─ systemPrompt: "You are a world-class hospitality trainer..."
      └─ userPromptTemplate: "Create a 2-week onboarding plan for a TRAINEE at {venue.type}..."

STEP 2: CALL LLM (Claude)
──────────────────────────
  Spring AI calls Claude with:
  
  System Prompt:
  "You are a world-class hospitality trainer for a Stuttgart-based cocktail bar.
   Your task: create a structured, role-specific onboarding plan.
   Focus on: safety → systems → skills → soft skills.
   Format: JSON with clear, 2-3 day modules."
  
  User Prompt:
  "Create a 2-week onboarding plan for Tom Schmidt, a TRAINEE at Stuttgart Lounge
   (a cocktail bar). Existing modules: Health & Safety, Cash Register, Beverage Knowledge,
   Guest Service. Recommend which modules, in what order, with estimated duration."

STEP 3: LLM RESPONSE
────────────────────
  Claude returns (JSON):
  {
    "onboardingPlan": {
      "week1": [
        {
          "day": 1,
          "module": "Health & Safety Crash Course",
          "duration": "2 hours",
          "priority": "CRITICAL",
          "description": "Hygiene, allergens, alcohol service laws",
          "completionCriteria": "Pass quiz, sign acknowledgment"
        },
        {
          "day": 1,
          "module": "Bar Layout & Equipment Tour",
          "duration": "1 hour",
          "priority": "CRITICAL",
          "description": "Physical walkthrough of bar, spirits locations, POS system",
          "completionCriteria": "Know every section, can name 10 spirits"
        },
        {
          "day": 2,
          "module": "Cash Register Basics",
          "duration": "2 hours",
          "priority": "HIGH",
          "description": "Ring up orders, process cash, card, error handling",
          "completionCriteria": "Complete 5 mock transactions error-free"
        },
        {
          "day": 3,
          "module": "Cocktail Spirits Deep Dive",
          "duration": "3 hours",
          "priority": "HIGH",
          "description": "Learn 20 spirits: origin, flavor profile, cocktails",
          "completionCriteria": "Blind tasting: identify 80%+ of spirits"
        }
      ],
      "week2": [
        {
          "day": 6,
          "module": "Guest Interaction Role-Play",
          "duration": "2 hours",
          "priority": "MEDIUM",
          "description": "Scenarios: angry guest, recommendation requests, dietary restrictions",
          "completionCriteria": "Manager evaluates interaction quality"
        },
        {
          "day": 8,
          "module": "First Shift Shadowing",
          "duration": "4 hours",
          "priority": "HIGH",
          "description": "Follow experienced staff during service",
          "completionCriteria": "Manager sign-off on readiness"
        }
      ]
    },
    "successMetrics": [
      "Food handler certification completed",
      "POS system proficiency: 95%+ transaction accuracy",
      "Knows 90% of menu items and spirits",
      "Guest satisfaction: 4.0+ stars on trainee-served orders"
    ]
  }

STEP 4: SAVE TO DATABASE
────────────────────────
  Backend creates TrainingModule entities:
  
  POST /api/operations/training-modules
  (Bulk create from AI response)
  
  └─ Creates 8 TrainingModule rows:
    ├─ id: 1, title: "Health & Safety Crash Course", ownerId: null (system), category: ONBOARDING, order: 1
    ├─ id: 2, title: "Bar Layout & Equipment Tour", order: 2
    ├─ id: 3, title: "Cash Register Basics", order: 3
    ├─ id: 4, title: "Cocktail Spirits Deep Dive", order: 4
    ├─ id: 5, title: "Guest Interaction Role-Play", order: 6
    ├─ id: 6, title: "First Shift Shadowing", order: 8
    └─ ai_generated: true
    └─ prompt_template_id: 42

  Also creates StaffProgress entities (one per module for Tom):
  ├─ {staffId: tom, moduleId: 1, status: NOT_STARTED, progress: 0%}
  ├─ {staffId: tom, moduleId: 2, status: NOT_STARTED, progress: 0%}
  ├─ ... (6 more)
  └─ Ordered by module.order (1→8)

STEP 5: STAFF VIEWS ONBOARDING PATH
────────────────────────────────────
  Tom logs in to app:
  
  GET /api/operations/training/for-user/{tomId}
  └─ Returns: {
      "trainingModules": [
        {
          "id": 1,
          "title": "Health & Safety Crash Course",
          "duration": "2 hours",
          "priority": "CRITICAL",
          "description": "Hygiene, allergens, alcohol service laws",
          "status": "NOT_STARTED",
          "order": 1,
          "aiGenerated": true
        },
        ... (7 more modules)
      ],
      "overallProgress": 0,
      "estimatedCompletionTime": "10 hours over 2 weeks"
    }

  Tom sees clear path:
  1. Health & Safety (2h) ← START HERE
  2. Bar Layout Tour (1h)
  3. Cash Register (2h)
  4. Spirits Deep Dive (3h)
  5. Role-Play (2h)
  6. Shadowing (4h)
  7-8. Ongoing modules

STEP 6: STAFF COMPLETES MODULES
────────────────────────────────
  Day 1 - Morning:
    Tom completes "Health & Safety Crash Course"
    
    PUT /api/operations/training/{progressId}/complete
    └─ Body: {score: 95, certificateUrl: "..."}
    └─ Backend:
        ├─ StaffProgress.status = COMPLETED
        ├─ StaffProgress.progress = 100%
        ├─ Creates certificate
        └─ Notifies manager: "Tom completed Health & Safety"

  Day 1 - Afternoon:
    Tom completes "Bar Layout & Equipment Tour"
    └─ PUT /api/operations/training/{progressId}/complete
        └─ 2 of 8 modules done (25%)

  (And so on...)

STEP 7: MANAGER REVIEWS PROGRESS
─────────────────────────────────
  Manager views dashboard:
  
  GET /api/operations/training/progress/by-venue/{venueId}
  └─ Returns:
    {
      "trainees": [
        {
          "name": "Tom Schmidt",
          "overallProgress": 75,  ← 6 of 8 modules done
          "nextModule": "Guest Interaction Role-Play",
          "onTrack": true,
          "modules": [
            {id: 1, title: "Health & Safety", status: COMPLETED, daysAgo: 2},
            {id: 2, title: "Bar Layout", status: COMPLETED, daysAgo: 2},
            {id: 3, title: "Cash Register", status: COMPLETED, daysAgo: 1},
            {id: 4, title: "Spirits Deep Dive", status: COMPLETED, daysAgo: 1},
            {id: 5, title: "Role-Play", status: IN_PROGRESS},
            {id: 6, title: "Shadowing", status: NOT_STARTED}
          ]
        }
      ]
    }

  Manager can:
    ├─ Override module order if needed
    ├─ Add custom modules
    ├─ Assign peer mentors
    └─ Sign-off when ready for independent shifts

STEP 8: FIRST INDEPENDENT SHIFT
───────────────────────────────
  After shadowing (Day 8), Tom is assigned to his first shift:
  
  PUT /api/operations/shifts/{shiftId}/assign
  └─ tom's assignment with TRAINEE role

  During shift:
  ├─ tom completes checklists like other staff
  ├─ tom processes guest checks under supervision
  └─ Manager watches real-time progress

  End of shift:
  └─ Manager evaluates:
    ├─ Task completion: 100%
    ├─ Guest interactions: observed 5, all positive
    ├─ POS accuracy: 98%
    └─ Ready for full STAFF role? YES

  Update user role:
  
  PUT /api/operations/users/{tomId}
  └─ Body: {role: STAFF}
  └─ tom is now fully onboarded ✓

VALUE DELIVERED:
────────────────
  ✓ Structured, role-specific training path
  ✓ Reduced onboarding time from 4 weeks to 2 weeks
  ✓ Personalized to venue type (cocktail bar)
  ✓ Full audit trail of what was learned
  ✓ Manager doesn't create training from scratch
  ✓ Venues can customize the AI-generated plan
```

---

## 4. Technical Data Flow

### 4.1 Request Lifecycle (End-to-End)

```
┌──────────────────────────────────────────────────────────────┐
│           REQUEST → RESPONSE LIFECYCLE                      │
└──────────────────────────────────────────────────────────────┘

[CLIENT] ← BROWSER/MOBILE APP (Next.js)
  │
  ├─ User clicks: "Create Guest Check"
  │
  ├─ App loads Zustand store:
  │   {userId: 123, role: "STAFF", venueId: 1, shiftId: 5}
  │
  ├─ Form validation (React Hook Form + Zod):
  │   ├─ Items: not empty
  │   ├─ totalAmount: > 0
  │   ├─ paymentMethod: in [CARD, CASH, ...]
  │   └─ All valid? → Proceed
  │
  └─ POST /api/guest/guest-checks
      ├─ Headers: {
      │   "Authorization": "Bearer <JWT_TOKEN>",
      │   "Content-Type": "application/json"
      │ }
      ├─ Body: {
      │   "venueId": 1,
      │   "shiftId": 5,
      │   "items": [
      │     {"menuItemId": 10, "quantity": 2, "price": 12.50}
      │   ],
      │   "totalAmount": 25.00,
      │   "paymentMethod": "CARD"
      │ }
      └─ [Network: HTTP]

[GATEWAY] ← Spring Cloud Gateway
  │
  ├─ Rate limiting check: ✓ (staff limit: 1000 req/min)
  │
  ├─ JWT validation:
  │   ├─ Token exists? ✓
  │   ├─ Token signature valid? ✓
  │   ├─ Token not expired? ✓
  │   ├─ Extract claims: {userId: 123, role: STAFF, venueId: 1}
  │   └─ Create SecurityContext
  │
  ├─ Route to correct service:
  │   └─ /api/guest/* → GuestController
  │
  └─ [Delegate to Backend]

[BACKEND] ← Spring Boot Application
  │
  ├─ GuestCheckController.createGuestCheck()
  │   ├─ @PostMapping("/guest-checks")
  │   ├─ @Valid validates DTO
  │   ├─ @PreAuthorize("hasAnyRole('STAFF','MANAGER','OWNER')")
  │   │   └─ Check: user has STAFF? ✓
  │   │
  │   └─ Calls GuestCheckService.create(request)
  │       │
  │       ├─ TRANSACTION START (Spring @Transactional)
  │       │
  │       ├─ Step 1: Validate business rules
  │       │   ├─ Shift exists? 
  │       │   │   └─ ShiftRepository.findById(5) → Shift object
  │       │   ├─ Shift is active?
  │       │   │   └─ Shift.isActive == true
  │       │   └─ All menu items exist?
  │       │       └─ MenuItemRepository.findAllById([10]) → [MenuItem]
  │       │
  │       ├─ Step 2: Persist GuestCheck
  │       │   ├─ Create GuestCheck entity:
  │       │   │   new GuestCheck()
  │       │   │   .setVenueId(1)
  │       │   │   .setShiftId(5)
  │       │   │   .setServedByUserId(123)
  │       │   │   .setTotalAmount(25.00)
  │       │   │   .setStatus(OPEN)
  │       │   │   .setCreatedAt(now)
  │       │   │
  │       │   └─ GuestCheckRepository.save(guestCheck)
  │       │       └─ [INSERT into guest.guest_checks]
  │       │
  │       ├─ Step 3: Create GuestCheckItems
  │       │   ├─ For each item in request:
  │       │   │   new GuestCheckItem()
  │       │   │   .setGuestCheckId(101)  ← newly saved ID
  │       │   │   .setMenuItemId(10)
  │       │   │   .setQuantity(2)
  │       │   │   .setPrice(12.50)
  │       │   │
  │       │   └─ GuestCheckItemRepository.saveAll([item1, item2])
  │       │       └─ [INSERT into guest.guest_check_items] ×2 rows
  │       │
  │       ├─ Step 4: TRIGGER INVENTORY DEPLETION (Cross-domain!)
  │       │   │
  │       │   │ For each GuestCheckItem:
  │       │   │   └─ menuItem = MenuItemRepository.findById(10)
  │       │   │       ├─ menuItem.recipeId = 42
  │       │   │       │
  │       │   │       └─ recipe = RecipeRepository.findById(42)
  │       │   │           ├─ recipe.ingredients = [
  │       │   │           │   {productId: 5, quantity: 50ml},
  │       │   │           │   {productId: 8, quantity: 2 drops}
  │       │   │           │ ]
  │       │   │           │
  │       │   │           └─ For each RecipeIngredient:
  │       │   │               └─ Deduct from Product.currentStock
  │       │   │                   
  │       │   │                   Product#5 (Bourbon):
  │       │   │                     quantity_to_deduct = 50ml × 2 (items) = 100ml
  │       │   │                     
  │       │   │                     productRepository.updateStock(5, -100)
  │       │   │                     └─ [UPDATE inventory.products SET current_stock = current_stock - 100]
  │       │   │                     
  │       │   │                     Create StockLog for audit trail:
  │       │   │                       new StockLog()
  │       │   │                       .setProductId(5)
  │       │   │                       .setType(MENU_DEPLETION)
  │       │   │                       .setQuantity(-100)
  │       │   │                       .setVenueId(1)
  │       │   │                       .setShiftId(5)
  │       │   │                       .setReference(guestCheckId)
  │       │   │                       .setCreatedAt(now)
  │       │   │                       
  │       │   │                     stockLogRepository.save(stockLog)
  │       │   │                     └─ [INSERT into inventory.stock_logs]
  │       │   │
  │       │   │                   Product#8 (Bitters):
  │       │   │                     quantity_to_deduct = 2 × 2 = 4 drops
  │       │   │                     └─ [Same flow]
  │       │   │
  │       │   └─ Inventory depletion complete ✓
  │       │
  │       ├─ Step 5: CHECK ALERT CONDITIONS
  │       │   └─ If Product.currentStock < Product.reorderLevel:
  │       │       └─ Send alert to manager (Redis queue or DB flag)
  │       │
  │       ├─ Step 6: EMIT WEBSOCKET EVENT (Real-time dashboard)
  │       │   └─ Push to Redis channel: "inventory.product.updated"
  │       │       └─ WebSocket subscribers (owner's browser) get update:
  │       │           {productId: 5, currentStock: 9.9}
  │       │
  │       ├─ Step 7: CACHE UPDATE
  │       │   └─ Invalidate cache for:
  │       │       ├─ Shift#5 (guest check count changed)
  │       │       ├─ Product#5 (stock changed)
  │       │       └─ Venue#1 (daily revenue changed)
  │       │       
  │       │       redisTemplate.delete("shifts:5:summary")
  │       │       redisTemplate.delete("products:5:stock")
  │       │
  │       ├─ TRANSACTION COMMIT
  │       │   └─ All changes persisted atomically
  │       │
  │       └─ Return response to Controller:
  │           └─ GuestCheckResponse {
  │               id: 101,
  │               venueId: 1,
  │               shiftId: 5,
  │               totalAmount: 25.00,
  │               itemsCount: 2,
  │               status: "OPEN",
  │               createdAt: "2026-02-09T12:30:00Z"
  │             }

[GATEWAY] ← Response returned
  │
  └─ HTTP 201 Created
     {
       "success": true,
       "data": {
         "id": 101,
         "totalAmount": 25.00,
         "itemsCount": 2,
         "status": "OPEN"
       },
       "message": "Guest check created successfully",
       "timestamp": "2026-02-09T12:30:00Z"
     }

[CLIENT] ← Browser receives response
  │
  ├─ TanStack Query caches result:
  │   queryClient.setQueryData(['guest-checks', {shiftId: 5}], ...)
  │
  ├─ Zustand updates store:
  │   setLastGuestCheckId(101)
  │
  ├─ UI optimistically updated (already was)
  │
  └─ Success toast: "Guest check saved ✓"

[OWNER DASHBOARD] ← Real-time update via WebSocket
  │
  ├─ Receives inventory update event:
  │   {productId: 5, currentStock: 9.9, lastUpdated: "2026-02-09T12:30:00Z"}
  │
  ├─ React Query refetches /api/inventory/products/low-stock
  │
  └─ Chart updates: Bourbon consumption graph updates
```

---

### 4.2 Database Relationships (Simplified Entity Diagram)

```
┌──────────────────────────────────────────────────────────────┐
│          DATA RELATIONSHIPS (Simplified)                     │
└──────────────────────────────────────────────────────────────┘

OPERATIONS SCHEMA:
──────────────────
  User (authentication)
    ├─ Venue (one-to-many: user.venue_id)
    ├─ Shift (one-to-many: user is shift manager)
    └─ ShiftAssignment (one-to-many: staff assigned to shifts)
    
  Venue
    ├─ Shift (many)
    ├─ User (many staff members)
    └─ Checklist (many, per shifts)
    
  Shift
    ├─ ShiftAssignment (many)
    ├─ Checklist (many)
    ├─ ShiftHandover (one)
    └─ StockLog (many, via inventory service)
    
  ShiftAssignment
    ├─ User
    └─ Shift
    
  Checklist
    ├─ Shift
    └─ TaskItem (many)
    
  TaskItem
    ├─ Checklist
    └─ PhotoProof (one or many)
    
  ShiftHandover
    ├─ fromShift
    ├─ toShift
    └─ acknowledgedBy User

INVENTORY SCHEMA:
─────────────────
  Product (catalog)
    ├─ ProductCategory
    ├─ Supplier (many-to-many via SupplierProduct)
    ├─ StockLog (many)
    ├─ RecipeIngredient (referenced by recipes)
    ├─ MenuSyndicationItem (if menu-synced)
    └─ Venue (scoped, though products are shared)
    
  Supplier
    ├─ SupplierType (enum: UNIBEV, meincocktailfass, etc.)
    ├─ SupplierProduct (junction: products they sell)
    └─ Order (many)
    
  Order
    ├─ Supplier
    ├─ Venue
    ├─ OrderItem (many)
    └─ OrderStatus (PENDING → DELIVERED → RECEIVED)
    
  OrderItem
    ├─ Order
    └─ Product (with quantity, unit price)
    
  StockLog (audit trail)
    ├─ Product
    ├─ Venue
    ├─ Shift
    ├─ StockLogType (RECEIPT, MENU_DEPLETION, WASTE, ADJUSTMENT)
    └─ Reference (can link to GuestCheckId, for traceability)

MENU SCHEMA:
────────────
  MenuItem (digital menu)
    ├─ MenuCategory
    ├─ Venue
    ├─ Recipe (one)
    ├─ GuestCheckItem (referenced when ordered)
    └─ MenuSyndication (track if synced to Google/TripAdvisor)
    
  Recipe (linked to MenuItem, defines ingredients)
    ├─ MenuItem
    ├─ RecipeIngredient (many)
    └─ ai_generated flag (if created by AI)
    
  RecipeIngredient
    ├─ Recipe
    ├─ Product (the ingredient, e.g., "50ml Bourbon")
    └─ Quantity + Unit
    
  MenuSyndication
    ├─ MenuItem
    └─ SyndicationTarget (Google My Business, speisekarte.de, etc.)

GUEST SCHEMA:
─────────────
  GuestProfile (recurring guest tracking)
    ├─ Venue
    ├─ Reservation (many)
    ├─ GuestCheck (many, via paid orders)
    └─ GuestEvaluation (many, their scores)
    
  Reservation
    ├─ GuestProfile
    ├─ Venue
    └─ GuestCheck (one, the order during their stay)
    
  GuestCheck (order, sales transaction)
    ├─ GuestProfile (optional: linked if known guest)
    ├─ Venue
    ├─ Shift
    ├─ Reservation (optional: if reservation)
    ├─ User (who served)
    ├─ GuestCheckItem (many, what they ordered)
    └─ GuestCheckStatus (OPEN → CLOSED → PAID)
    
  GuestCheckItem (line item in order)
    ├─ GuestCheck
    └─ MenuItem
    
  GuestEvaluation
    ├─ GuestProfile
    ├─ Reservation
    └─ Ratings: overall, food, service, ambiance

AI SCHEMA:
──────────
  PromptTemplate (configurable AI personality)
    ├─ Venue (can customize per venue)
    ├─ PromptCategory (ONBOARDING_GUIDE, MENU_DESCRIPTION, etc.)
    └─ systemPrompt, userPromptTemplate (templates)
    
  AIUsageLog (cost tracking + audit)
    ├─ Venue
    ├─ User (who triggered the AI)
    ├─ PromptTemplate
    ├─ model (CLAUDE_3_OPUS, GPT_4O, etc.)
    ├─ tokensInput, tokensOutput
    └─ resultAccepted (feedback)

CROSS-SCHEMA RELATIONSHIPS:
───────────────────────────
  Venue
    ├─ operations.User (staff)
    ├─ operations.Shift
    ├─ inventory.Product (scoped)
    ├─ inventory.StockLog
    ├─ inventory.Order
    ├─ menu.MenuItem
    ├─ guest.GuestProfile
    ├─ guest.Reservation
    ├─ ai.PromptTemplate (customizations)
    └─ ai.AIUsageLog
```

---

## 5. AI Integration Points

### 5.1 AI Feature Locations in Workflow

```
┌──────────────────────────────────────────────────────────────┐
│             WHERE AI ENHANCES WORKFLOWS                     │
└──────────────────────────────────────────────────────────────┘

AI-1: STAFF ONBOARDING GENERATOR
──────────────────────────────────
  When:   New user with role TRAINEE created
  Where:  UserService.create() → AIOrchestrationService.generateTraining()
  Input:  Role, VenueType, existing modules
  Output: Ordered list of TrainingModule entities
  Model:  Claude (best reasoning)
  Cost:   ~€0.02 per onboarding

AI-2: MENU DESCRIPTION GENERATOR
─────────────────────────────────
  When:   Manager creates/edits MenuItem
  Where:  MenuItemController → AIOrchestrationService.generateDescription()
  Input:  MenuItem.name, Recipe, ingredients, allergens
  Output: Appealing 2-3 sentence description
  Model:  GPT-4o (best for marketing)
  Cost:   ~€0.01 per menu item

AI-3: SHIFT SUMMARY GENERATOR
──────────────────────────────
  When:   Shift closes (end of shift)
  Where:  ShiftService.closeShift() → AIOrchestrationService.generateSummary()
  Input:  Shift, Checklist completion, StockLog events, GuestCheck totals
  Output: Structured handover summary for next shift
  Model:  Claude
  Cost:   ~€0.03 per shift

AI-4: WASTE PATTERN ANALYSIS
──────────────────────────────
  When:   Manager views inventory analytics
  Where:  InventoryController.getWasteAnalysis() → custom ML
  Input:  StockLog(WASTE) time series
  Output: "Limes waste 30% more on Mondays. Try pre-portioning."
  Model:  Claude + statistical analysis
  Cost:   ~€0.05 per venue per day

AI-5: CONSUMPTION TREND PREDICTION
───────────────────────────────────
  When:   Inventory dashboard loads, or scheduled daily
  Where:  InventoryService.predictNextWeek()
  Input:  StockLog history, venue type, seasonality
  Output: Predicted consumption for next 7 days
  Model:  Custom heuristic + Claude
  Cost:   ~€0.02 per product per day

AI-6: GUEST INSIGHT GENERATOR
──────────────────────────────
  When:   Manager views guest profile
  Where:  GuestController.getGuestInsights()
  Input:  GuestProfile history, evaluations, preferences
  Output: "Anna is VIP (4 visits), rates service 4/5. Recommend wine pairing."
  Model:  Claude
  Cost:   ~€0.01 per guest profile

AI-7: RECIPE SUGGESTION
──────────────────────
  When:   Manager is building menu, clicks "AI Suggest Recipes"
  Where:  RecipeController.suggestRecipes()
  Input:  Available products, venue type, cuisine
  Output: New recipe combinations with instructions
  Model:  GPT-4o
  Cost:   ~€0.03 per recipe suggestion


PROMPT TEMPLATE EXAMPLE (AI-3: SHIFT SUMMARY):
───────────────────────────────────────────────

PromptTemplate {
  id: 1,
  venue_id: 1,
  category: SHIFT_SUMMARY,
  language: "de",  ← German for Stuttgart venue
  tone_of_voice: "professional_warm",
  
  system_prompt: """
    Du bist der Schicht-Zusammenfassungs-Generator für {venue.name}, 
    ein {venue.type} in {venue.city}.
    
    Deine Aufgabe: Erstelle eine kurze, strukturierte Zusammenfassung der Schicht
    für die nächste Schicht-Crew.
    
    Format:
    1. Highlights (2-3 Punkte)
    2. Offene Punkte (2-3 Punkte)
    3. Nächste Schritte (1-2 Punkte)
    4. KPI Zusammenfassung
    
    Tone: {tone_of_voice}
    Sprache: {language}
  """,
  
  user_prompt_template: """
    Schicht Details:
    - Schicht-Typ: {shift.type}
    - Von: {shift.start_time}
    - Bis: {shift.end_time}
    - Verantwortlicher: {shift.manager_name}
    
    Checklist-Status:
    - Gesamtabschluss: {checklist.completion_percentage}%
    - Abgeschlossene Aufgaben: {checklist.completed_tasks}
    - Ausstehende Aufgaben: {checklist.pending_tasks}
    
    Verkäufe & Kunden:
    - Gäste bedient: {guest_check.count}
    - Gesamtumsatz: €{guest_check.total_amount}
    - Durchschnittliche Rechnung: €{guest_check.avg_amount}
    
    Bestand:
    - Verbrauchte Produkte: {stock_log.depletion_count} Items
    - Verschwendung: {stock_log.waste_count} Items
    - Verschwendungsquote: {waste_ratio}%
    
    Besondere Ereignisse:
    {shift.handover.notes}
    
    Erstelle eine prägnante Schicht-Zusammenfassung für die nächste Crew.
  """
}

ACTUAL LLM CALL (Spring AI):
────────────────────────────

@Service
public class AIOrchestrationService {
  
  private final ChatClient chatClient;
  private final PromptTemplateRepository promptRepo;
  private final AIUsageLogRepository usageLogRepo;
  
  public String generateShiftSummary(Long shiftId, Long venueId) {
    // 1. Load data
    Shift shift = shiftRepo.findById(shiftId).orElseThrow();
    Venue venue = venueRepo.findById(venueId).orElseThrow();
    PromptTemplate template = 
      promptRepo.findByVenueAndCategory(venueId, SHIFT_SUMMARY);
    
    // 2. Render template
    String systemPrompt = template.getSystemPrompt()
      .replace("{venue.name}", venue.getName())
      .replace("{venue.type}", venue.getType());
      
    String userPrompt = template.getUserPromptTemplate()
      .replace("{shift.type}", shift.getType())
      .replace("{guest_check.count}", guestCheckCount)
      .replace("{guest_check.total_amount}", totalRevenue);
      
    // 3. Call Claude via Spring AI
    var message = chatClient.prompt()
      .system(systemPrompt)
      .user(userPrompt)
      .call()
      .content();
      
    // 4. Log usage
    AIUsageLog log = new AIUsageLog()
      .setVenueId(venueId)
      .setPromptTemplate(template)
      .setModel("CLAUDE_3_OPUS")
      .setTokensInput(calculateTokens(systemPrompt + userPrompt))
      .setTokensOutput(calculateTokens(message))
      .setLatencyMs(elapsed);
    usageLogRepo.save(log);
    
    // 5. Return summary
    return message;
  }
}
```

---

## 6. Inter-Domain Communication

### 6.1 Cross-Domain Transactions

```
┌──────────────────────────────────────────────────────────────┐
│         HOW DOMAINS TALK TO EACH OTHER                      │
└──────────────────────────────────────────────────────────────┘

SCENARIO: Create GuestCheck → Deduct Inventory
───────────────────────────────────────────────

GuestCheckService (GUEST domain)
  │
  ├─ Receives: POST /api/guest/guest-checks
  │
  └─ Calls GuestCheckService.create(request)
      │
      ├─ @Transactional(propagation = REQUIRED)
      │   └─ Single transaction for ALL operations
      │
      ├─ STEP 1: Create GuestCheck entity
      │   └─ guestCheckRepo.save(check)
      │
      ├─ STEP 2: Create GuestCheckItems
      │   └─ guestCheckItemRepo.saveAll(items)
      │
      ├─ STEP 3: CALL INVENTORY SERVICE (within same transaction!)
      │   │
      │   └─ inventoryService.depleteStockForGuestCheck(checkId, items)
      │       │
      │       ├─ @Transactional (inherits parent)
      │       │
      │       ├─ For each item:
      │       │   └─ MenuItem menuItem = menuItemRepo.findById(item.menuItemId)
      │       │       ├─ Recipe recipe = recipeRepo.findById(menuItem.recipeId)
      │       │       │
      │       │       └─ For each RecipeIngredient:
      │       │           └─ Product product = productRepo.findById(ingredient.productId)
      │       │               ├─ quantity = ingredient.quantity × item.quantity
      │       │               │
      │       │               ├─ productRepo.updateStockDeduction(productId, quantity)
      │       │               │   └─ UPDATE inventory.products 
      │       │               │       SET current_stock = current_stock - ?
      │       │               │
      │       │               └─ stockLogRepo.save(new StockLog(...))
      │       │                   └─ INSERT inventory.stock_logs
      │       │
      │       └─ Check for alerts:
      │           └─ if product.stock < product.reorderLevel
      │               └─ Send notification to manager
      │
      ├─ STEP 4: UPDATE CACHE (Redis)
      │   └─ redis.delete("shifts:5:summary", "products:*:stock")
      │
      ├─ STEP 5: EMIT EVENTS (WebSocket)
      │   └─ Push to Redis: "inventory.updated", "revenue.updated"
      │       └─ Subscribers (owner's browser) receive live updates
      │
      ├─ STEP 6: CALL AI SERVICE (optional, async)
      │   └─ If shift is ending, trigger shift summary generation
      │       └─ aiService.generateShiftSummaryAsync(shiftId)
      │
      └─ TRANSACTION COMMIT
          └─ Everything succeeds or everything rolls back


ISOLATION: Why One Transaction?
────────────────────────────────
  If we used separate transactions:
  
  ✗ Problem 1: Guest check created, but inventory depletion fails
      → Check saved, stock not updated → Data inconsistency!
  
  ✗ Problem 2: Compensation logic needed (sagas)
      → If inventory fails, need to delete GuestCheck
      → Complex, error-prone
  
  ✓ Solution: Single @Transactional across services
      → Modular monolith benefit: direct method calls
      → All-or-nothing semantics
      → NO inter-service HTTP overhead


EXPLICIT DEPENDENCIES:
──────────────────────
  GuestCheckService depends on:
    ├─ InventoryService (inventory.Product, inventory.StockLog)
    ├─ MenuService (menu.MenuItem, menu.Recipe, menu.RecipeIngredient)
    └─ AIService (optional, async)
    
  These are injected as Spring beans:
    @Service
    public class GuestCheckService {
      @Autowired
      private InventoryService inventoryService;
      
      @Autowired
      private MenuService menuService;
      
      @Autowired
      private AIService aiService;
    }
```

---

## 7. Real-Time Features

### 7.1 WebSocket/STOMP Architecture

```
┌──────────────────────────────────────────────────────────────┐
│              LIVE UPDATES VIA WEBSOCKET                     │
└──────────────────────────────────────────────────────────────┘

SCENARIO: Real-Time Consumption Dashboard (Owner's Browser)
────────────────────────────────────────────────────────────

[OWNER OPENS DASHBOARD]
  │
  └─ Frontend: useWebSocket() hook
      │
      ├─ Establishes WebSocket connection:
      │   └─ ws://localhost:8080/ws/inventory?token=JWT
      │
      └─ Subscribes to STOMP topics:
          ├─ /topic/venues/{venueId}/stock  ← Stock updates
          ├─ /topic/venues/{venueId}/consumption  ← Real-time consumption
          └─ /topic/venues/{venueId}/revenue  ← Revenue updates

[STAFF CREATES GUEST CHECK] (12:30 PM)
  │
  └─ POST /api/guest/guest-checks
      │
      └─ Backend creates check + depletes stock
          │
          ├─ Product#5 (Bourbon) stock updated: 15.0L → 14.95L
          │
          └─ Trigger WebSocket broadcast:
              └─ simpMessagingTemplate.convertAndSend(
                  "/topic/venues/1/stock",
                  {productId: 5, currentStock: 14.95, lastUpdated: "2026-02-09T12:30:00Z"}
                )

[OWNER'S BROWSER RECEIVES MESSAGE]
  │
  ├─ WebSocket message listener:
  │   └─ const handleInventoryUpdate = (message) => {
  │       setInventory(prev => ({
  │         ...prev,
  │         [message.productId]: message.currentStock
  │       }))
  │     }
  │
  ├─ React state updated
  │
  └─ UI re-renders (Recharts consumption chart)
      │
      └─ Owner sees: "Bourbon Whiskey: 14.95L" (previously 15.0L)


BENEFITS:
─────────
  ✓ No polling (browser doesn't constantly ask "is it updated?")
  ✓ Instant updates (staff presses save → owner sees change in <100ms)
  ✓ Efficient (only sends data that changed)
  ✓ Bi-directional (future: owner could send "slow down" command to staff)


INFRASTRUCTURE:
────────────────
  Backend:
    ├─ Spring WebSocket + STOMP
    ├─ Redis for broker (scales to multiple server instances)
    └─ @SendTo("/topic/...") annotations on service methods

  Frontend:
    ├─ Socket.IO client or Native WebSocket
    ├─ Custom React hook (useWebSocket.ts)
    └─ Subscription manager (auto-reconnect, offline support)

  Next.js PWA:
    ├─ Works offline (cached messages)
    ├─ Syncs when reconnected
    └─ Service Worker handles WebSocket cleanup
```

---

## Summary: KesselOps Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│               COMPLETE APPLICATION FLOW                        │
│                                                                 │
│  USER ACTION → FRONTEND → API GATEWAY → SERVICE LAYER          │
│                              ↓                                  │
│                          DATABASE (5 schemas)                   │
│                              ↓                                  │
│                    CACHE + WEBSOCKET + AI                       │
│                              ↓                                  │
│                   REAL-TIME UI UPDATE                           │
└─────────────────────────────────────────────────────────────────┘

1. AUTHENTICATION LAYER:
   - JWT token issued on login
   - JwtAuthFilter validates every request
   - SecurityContext set with user role

2. API GATEWAY:
   - Rate limiting
   - Request routing to correct service
   - Response transformation

3. SERVICE LAYER (5 domains):
   - Operations (shifts, checklists, training)
   - Inventory (products, stock, orders)
   - Menu (items, recipes, syndication)
   - Guest (profiles, reservations, checks)
   - AI (prompts, usage logging)

4. PERSISTENCE LAYER:
   - PostgreSQL (5 schemas)
   - Flyway migrations (versioned)
   - JPA repositories (Spring Data)

5. SUPPORTING SERVICES:
   - Redis: cache, WebSocket broker
   - S3/MinIO: file storage (photos)
   - LLM APIs: Claude, GPT-4o

6. REAL-TIME:
   - WebSocket (STOMP)
   - Redis Pub/Sub
   - React Query subscriptions

7. AI INTEGRATION:
   - Prompt templates in DB
   - Usage logging for audits
   - Per-venue customization

---

This is KesselOps: a modular, scalable, AI-enhanced platform
for shift management, inventory, menus, and guest experiences.
```


