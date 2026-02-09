# Guest Service API - Postman Test Collection

## Prerequisites
1. Start Docker infrastructure: `cd infra/docker && docker-compose up -d`
2. Start backend: `cd backend && mvn spring-boot:run`
3. Base URL: `http://localhost:8080`

---

## 1. Create a Guest

**POST** `/api/reservations`

```json
{
  "venueId": 1,
  "guestId": null,
  "partySize": 4,
  "reservationTime": "2026-02-10T19:00:00"
}
```

**Expected Response:** 201 Created
```json
{
  "id": 1,
  "guestId": null,
  "venueId": 1,
  "partySize": 4,
  "reservationTime": "2026-02-10T19:00:00",
  "status": "PENDING",
  "createdAt": "2026-02-09T21:00:00"
}
```

---

## 2. List Reservations by Date

**GET** `/api/reservations?venueId=1&date=2026-02-10`

**Expected Response:** 200 OK
```json
[
  {
    "id": 1,
    "venueId": 1,
    "partySize": 4,
    "reservationTime": "2026-02-10T19:00:00",
    "status": "PENDING"
  }
]
```

---

## 3. Start Session (QR Scan)

**POST** `/api/tables/1/sessions/start`

**Body:** (empty)

**Expected Response:** 201 Created
```json
{
  "id": 1,
  "tableId": 1,
  "venueId": 1,
  "reservationId": null,
  "assignedStaffId": null,
  "verifiedByStaffId": null,
  "status": "ACTIVE",
  "startedAt": "2026-02-09T21:05:00",
  "closedAt": null
}
```

**Note:** Save the `sessionId` (1) for next steps.

---

## 4. Get Session Details

**GET** `/api/sessions/1`

**Expected Response:** 200 OK
```json
{
  "id": 1,
  "tableId": 1,
  "venueId": 1,
  "status": "ACTIVE",
  "startedAt": "2026-02-09T21:05:00",
  "closedAt": null
}
```

---

## 5. Create Order (with pricing)

**POST** `/api/sessions/1/orders`

```json
{
  "items": [
    {
      "menuItemId": 101,
      "quantity": 2,
      "unitPrice": 12.50
    },
    {
      "menuItemId": 102,
      "quantity": 1,
      "unitPrice": 8.00
    }
  ]
}
```

**Expected Response:** 201 Created
```json
{
  "id": 1,
  "sessionId": 1,
  "status": "PENDING",
  "totalAmount": 33.00,
  "items": [
    {
      "id": 1,
      "menuItemId": 101,
      "quantity": 2,
      "unitPrice": 12.50,
      "lineTotal": 25.00
    },
    {
      "id": 2,
      "menuItemId": 102,
      "quantity": 1,
      "unitPrice": 8.00,
      "lineTotal": 8.00
    }
  ],
  "createdAt": "2026-02-09T21:06:00"
}
```

**Calculation:** (2 × 12.50) + (1 × 8.00) = 25.00 + 8.00 = **33.00**

---

## 6. Update Order Status

**PATCH** `/api/orders/1/status`

```json
{
  "status": "KITCHEN"
}
```

**Expected Response:** 200 OK
```json
{
  "id": 1,
  "sessionId": 1,
  "status": "KITCHEN",
  "totalAmount": 33.00
}
```

**Status Flow:** PENDING → KITCHEN → READY → SERVED

---

## 7. Record Partial Payment (Split Bill - Part 1)

**POST** `/api/sessions/1/payments`

```json
{
  "amount": 20.00,
  "paymentMethod": "CARD",
  "collectedByStaffId": null
}
```

**Expected Response:** 201 Created
```json
{
  "id": 1,
  "sessionId": 1,
  "amount": 20.00,
  "paymentMethod": "CARD",
  "collectedByStaffId": null,
  "paidAt": "2026-02-09T21:10:00"
}
```

**Session Status:** Still ACTIVE (20.00 < 33.00)

---

## 8. Verify Session Still Active

**GET** `/api/sessions/1`

**Expected Response:** 200 OK
```json
{
  "id": 1,
  "status": "ACTIVE",
  "closedAt": null
}
```

---

## 9. Record Final Payment (Auto-Close Trigger)

**POST** `/api/sessions/1/payments`

```json
{
  "amount": 13.00,
  "paymentMethod": "CASH",
  "collectedByStaffId": 5
}
```

**Expected Response:** 201 Created
```json
{
  "id": 2,
  "sessionId": 1,
  "amount": 13.00,
  "paymentMethod": "CASH",
  "collectedByStaffId": 5,
  "paidAt": "2026-02-09T21:12:00"
}
```

**Total Payments:** 20.00 + 13.00 = **33.00** ✅
**Session Status:** AUTO-CLOSED (33.00 ≥ 33.00)

---

## 10. Verify Session Auto-Closed

**GET** `/api/sessions/1`

**Expected Response:** 200 OK
```json
{
  "id": 1,
  "status": "CLOSED",
  "startedAt": "2026-02-09T21:05:00",
  "closedAt": "2026-02-09T21:12:00"
}
```

✅ **Session automatically closed!**

---

## Test Scenarios

### Scenario A: Single Full Payment
1. Create order with total = 50.00
2. Record payment of 50.00
3. **Result:** Session closes immediately

### Scenario B: Overpayment (Tip)
1. Create order with total = 40.00
2. Record payment of 45.00 (includes tip)
3. **Result:** Session closes (45.00 ≥ 40.00)

### Scenario C: Multiple Orders, Single Payment
1. Create order #1 with total = 20.00
2. Create order #2 with total = 15.00
3. Record payment of 35.00
4. **Result:** Session closes (35.00 ≥ 35.00)

### Scenario D: Waiter-Collected Payment
```json
{
  "amount": 50.00,
  "paymentMethod": "CASH",
  "collectedByStaffId": 3
}
```
**Result:** Payment recorded with staff tracking

---

## Quick Test Script (Copy-Paste Order)

```bash
# 1. Create reservation
curl -X POST http://localhost:8080/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"venueId":1,"partySize":4,"reservationTime":"2026-02-10T19:00:00"}'

# 2. Start session (QR scan)
curl -X POST http://localhost:8080/api/tables/1/sessions/start

# 3. Create order
curl -X POST http://localhost:8080/api/sessions/1/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[{"menuItemId":101,"quantity":2,"unitPrice":12.50},{"menuItemId":102,"quantity":1,"unitPrice":8.00}]}'

# 4. Record full payment (auto-close)
curl -X POST http://localhost:8080/api/sessions/1/payments \
  -H "Content-Type: application/json" \
  -d '{"amount":33.00,"paymentMethod":"CARD"}'

# 5. Verify session closed
curl http://localhost:8080/api/sessions/1
```

---

## Notes

- **venueId:** Required for multi-tenant support
- **menuItemId:** Reference to menu items (Menu service integration pending)
- **collectedByStaffId:** Optional, use for waiter-collected payments
- **Auto-close:** Triggers when `sum(payments) ≥ sum(orders.totalAmount)`
