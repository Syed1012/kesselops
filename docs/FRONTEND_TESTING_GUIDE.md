# Frontend End-to-End Testing Guide

## Prerequisites

✅ **Backend running** on `http://localhost:8080`  
✅ **Test table created** (ID: 1, Code: 1234)  
✅ **Frontend ready** to start

---

## Step 1: Start the Frontend

```bash
cd e:\realdevs\kesselops\frontend
npm run dev
```

**Expected output:**
```
- Local:   http://localhost:3000
- Network: use --host to expose
```

---

## Step 2: Open the Test URL

Open your browser to:
```
http://localhost:3000/venue?tableId=1&code=1234
```

**What you should see:**
- ✅ **Purple session banner** at the top showing "Table 1" and session start time
- ✅ **Beautiful venue page** with "Midnight Lounge" hero section
- ✅ **Menu items** (Smoked Old Fashioned, Truffle Ribeye, etc.)

**If you see an error toast:**
- Red notification at top = invalid table code or backend not running
- Check backend is running: `http://localhost:8080/actuator/health`

---

## Step 3: Add Items to Cart

**Hover over any menu item:**
- You'll see a **yellow "+" button** appear in the top-right corner
- Click the menu card or the "+" button

**What happens:**
- Item is added to cart
- **Floating cart button** appears in bottom-right with item count badge

**Try this:**
1. Click "Smoked Old Fashioned" → Cart shows (1)
2. Click "Truffle Ribeye" → Cart shows (2)
3. Click "Smoked Old Fashioned" again → Quantity increases to 2

---

## Step 4: Open Cart & Review

**Click the floating cart button** (bottom-right with badge)

**Cart drawer slides in from right showing:**
- ✅ All items with images
- ✅ Quantity controls (-, +)
- ✅ Line totals for each item
- ✅ Grand total at bottom
- ✅ "Submit Order" button

**Try these actions:**
- **Increase quantity:** Click the "+" button on an item
- **Decrease quantity:** Click the "-" button
- **Remove item:** Click the trash icon
- **Close cart:** Click the X or click outside

---

## Step 5: Submit Order

**In the cart drawer:**
1. Review your items
2. Click **"Submit Order"** button

**What happens:**
- ✅ Loading spinner appears briefly
- ✅ Cart closes automatically
- ✅ Cart is now empty
- ✅ **"Pay €XX.XX" button** appears in bottom-right (green)

**Check the backend logs:**
```
POST /api/sessions/{sessionId}/orders
```

---

## Step 6: Make Payment

**Click the green "Pay €XX.XX" button**

**Payment modal appears with:**
- ✅ Order summary showing total
- ✅ Payment method selection (Card, Cash, Mobile Pay)
- ✅ Amount input field
- ✅ "Pay Full" quick button

**Test the payment flow:**

### Option A: Full Payment
1. Click **"Pay Full"** button → Amount auto-fills
2. Select payment method (e.g., "Card")
3. Click **"Pay €XX.XX"**
4. ✅ Success animation appears
5. ✅ Session closes (banner disappears)
6. ✅ Page resets to normal state

### Option B: Partial Payment
1. Enter a smaller amount (e.g., €10.00)
2. Select payment method
3. Click **"Pay €10.00"**
4. ✅ Success message
5. ✅ Modal closes
6. ✅ Session stays active (banner remains)
7. ✅ "Pay" button updates with remaining amount

---

## Step 7: Test Split Bill Scenario

**Simulate multiple guests paying:**

1. Add items to cart → Submit order (e.g., €50 total)
2. Guest 1 pays €20 → Session stays active
3. Guest 2 pays €15 → Session stays active  
4. Guest 3 pays €15 → **Session auto-closes!** ✅

**Backend auto-closes when:**
```
Total Payments >= Total Orders
```

---

## Step 8: Test Error Scenarios

### Invalid Table Code
```
http://localhost:3000/venue?tableId=1&code=9999
```
**Expected:** Red error toast: "Invalid table code"

### Missing Code
```
http://localhost:3000/venue?tableId=1
```
**Expected:** No session starts, no banner

### Backend Down
1. Stop backend: `Ctrl+C` in backend terminal
2. Try to add items to cart
**Expected:** Error toast: "Please scan the QR code..."

---

## Visual Checklist

| Feature | Expected Behavior |
|---------|-------------------|
| **Session Start** | Purple banner appears at top |
| **Add to Cart** | Floating badge button appears |
| **Cart Drawer** | Slides in from right, shows items |
| **Submit Order** | Cart clears, "Pay" button appears |
| **Payment Modal** | Shows total, payment methods |
| **Full Payment** | Success animation, session closes |
| **Partial Payment** | Success, session stays active |
| **Auto-Close** | Session closes when fully paid |

---

## Browser DevTools Tips

### Check Network Requests
1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by **Fetch/XHR**

**You should see:**
```
POST /api/tables/1/sessions/start?code=1234  → 201 Created
POST /api/sessions/{id}/orders              → 201 Created
POST /api/sessions/{id}/payments            → 201 Created
GET  /api/sessions/{id}                     → 200 OK
```

### Check Console for Errors
- No red errors should appear
- Zustand state updates logged (if you add console.log)

### Check Local Storage
1. DevTools → **Application** tab
2. **Local Storage** → `http://localhost:3000`
3. Look for key: `kesselops-session`

**Contains:**
```json
{
  "state": {
    "session": {...},
    "cart": [...],
    "orders": [...]
  }
}
```

---

## Common Issues & Fixes

### "Failed to start session"
- ✅ Check backend is running: `http://localhost:8080/actuator/health`
- ✅ Verify table exists: `docker exec kesselops-postgres psql -U kesselops -d kesselops -c "SELECT * FROM guest.tables;"`

### Cart button doesn't appear
- ✅ Check browser console for errors
- ✅ Verify session started (purple banner visible)
- ✅ Try refreshing the page

### Payment doesn't close session
- ✅ Check total payments vs total orders in backend logs
- ✅ Verify you paid the full amount
- ✅ Check for backend errors

### Styles look broken
- ✅ Ensure Tailwind is compiled: `npm run dev` (not just `npm start`)
- ✅ Clear browser cache (Ctrl+Shift+R)

---

## Quick Test Script

**Copy-paste this sequence for rapid testing:**

1. Open: `http://localhost:3000/venue?tableId=1&code=1234`
2. Click "Smoked Old Fashioned" (€14)
3. Click "Truffle Ribeye" (€32)
4. Open cart → Submit Order
5. Click "Pay €46.00" → Pay Full → Card → Pay
6. ✅ Session closes, success!

**Time to complete:** ~30 seconds

---

## Next Steps

After successful testing:
1. Create more test tables with different codes
2. Test on mobile viewport (DevTools → Toggle device toolbar)
3. Test with multiple browser tabs (shared cart behavior)
4. Integrate reservation drawer with backend API

---

## Need Help?

- **Backend logs:** Check the terminal running `mvn spring-boot:run`
- **Frontend logs:** Check browser console (F12)
- **Database state:** `docker exec kesselops-postgres psql -U kesselops -d kesselops -c "SELECT * FROM guest.sessions;"`
