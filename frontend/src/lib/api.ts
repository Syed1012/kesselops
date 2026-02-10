/**
 * Guest Service API Client
 * Type-safe API client for frontend-backend communication
 */

const API_BASE = '/api';

// ============================================
// TYPES
// ============================================

export interface Session {
    id: number;
    tableId: number;
    venueId: number;
    reservationId: number | null;
    assignedStaffId: number | null;
    verifiedByStaffId: number | null;
    status: 'ACTIVE' | 'CLOSED';
    startedAt: string;
    closedAt: string | null;
    sessionCode?: string;
}

export interface Order {
    id: number;
    sessionId: number;
    status: 'PENDING' | 'KITCHEN' | 'READY' | 'SERVED';
    totalAmount: number;
    items: OrderItem[];
    createdAt: string;
}

export interface OrderItem {
    id: number;
    menuItemId: number;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

export interface Payment {
    id: number;
    sessionId: number;
    amount: number;
    paymentMethod: 'CASH' | 'CARD' | 'MOBILE_PAY';
    collectedByStaffId: number | null;
    paidAt: string;
}

export interface Reservation {
    id: number;
    guestId: number | null;
    venueId: number;
    partySize: number;
    reservationTime: string;
    status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
}

export interface CartItem {
    id: number;
    sessionId: number;
    menuItemId: number;
    menuItemName: string;
    quantity: number;
    unitPrice: number;
    menuItemImage?: string;
    addedAt: string;
}

// ============================================
// REQUEST TYPES
// ============================================

export interface CreateOrderRequest {
    items: Array<{
        menuItemId: number;
        quantity: number;
        unitPrice: number;
    }>;
}

export interface CreatePaymentRequest {
    amount: number;
    paymentMethod: 'CASH' | 'CARD' | 'MOBILE_PAY';
    collectedByStaffId?: number;
}

export interface CreateReservationRequest {
    venueId: number;
    guestId?: number;
    partySize: number;
    reservationTime: string;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Start a session via QR scan.
 * @param tableId The table ID
 * @param code Optional session code (required if joining an existing active session)
 */
export async function startSession(tableId: number, code?: string | null): Promise<Session> {
    const url = code
        ? `${API_BASE}/tables/${tableId}/sessions/start?code=${code}`
        : `${API_BASE}/tables/${tableId}/sessions/start`;

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
            throw new Error('AUTH_REQUIRED');
        }
        throw new Error('Failed to start session');
    }

    return res.json();
}

/**
 * Get session details by ID.
 */
export async function getSession(sessionId: number): Promise<Session> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}`);

    if (!res.ok) {
        throw new Error('Session not found');
    }

    return res.json();
}

/**
 * Create an order for a session.
 */
export async function createOrder(sessionId: number, request: CreateOrderRequest): Promise<Order> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
    });

    if (!res.ok) {
        throw new Error('Failed to create order');
    }

    return res.json();
}

/**
 * Get all orders for a session.
 */
export async function getSessionOrders(sessionId: number): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/orders`);

    if (!res.ok) {
        throw new Error('Failed to fetch orders');
    }

    return res.json();
}

/**
 * Update order status (for staff use).
 */
export async function updateOrderStatus(
    orderId: number,
    status: Order['status']
): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });

    if (!res.ok) {
        throw new Error('Failed to update order status');
    }

    return res.json();
}

/**
 * Create a payment for a session.
 */
export async function createPayment(
    sessionId: number,
    request: CreatePaymentRequest
): Promise<Payment> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
    });

    if (!res.ok) {
        throw new Error('Failed to create payment');
    }

    return res.json();
}

/**
 * Create a reservation.
 */
export async function createReservation(request: CreateReservationRequest): Promise<Reservation> {
    const res = await fetch(`${API_BASE}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
    });

    if (!res.ok) {
        throw new Error('Failed to create reservation');
    }

    return res.json();
}

/**
 * Get reservations by venue and date.
 */
export async function getReservations(venueId: number, date: string): Promise<Reservation[]> {
    const res = await fetch(`${API_BASE}/reservations?venueId=${venueId}&date=${date}`);

    if (!res.ok) {
        throw new Error('Failed to fetch reservations');
    }

    return res.json();
}

// ============================================
// CART API FUNCTIONS
// ============================================

/**
 * Get all cart items for a session.
 */
export async function getSessionCart(sessionId: number): Promise<CartItem[]> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/cart`);

    if (!res.ok) {
        throw new Error('Failed to fetch cart');
    }

    return res.json();
}

/**
 * Add item to cart.
 */
export async function addToCart(
    sessionId: number,
    menuItemId: number,
    menuItemName: string,
    unitPrice: number,
    menuItemImage?: string
): Promise<CartItem> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            menuItemId,
            menuItemName,
            unitPrice,
            menuItemImage,
        }),
    });

    if (!res.ok) {
        throw new Error('Failed to add to cart');
    }

    return res.json();
}

/**
 * Update cart item quantity.
 */
export async function updateCartItemQuantity(
    cartItemId: number,
    quantity: number
): Promise<CartItem> {
    const res = await fetch(`${API_BASE}/cart/${cartItemId}?quantity=${quantity}`, {
        method: 'PATCH',
    });

    if (!res.ok) {
        throw new Error('Failed to update cart item');
    }

    return res.json();
}

/**
 * Remove item from cart.
 */
export async function removeFromCart(cartItemId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/cart/${cartItemId}`, {
        method: 'DELETE',
    });

    if (!res.ok) {
        throw new Error('Failed to remove from cart');
    }
}

/**
 * Clear entire cart for a session.
 */
export async function clearCart(sessionId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/cart`, {
        method: 'DELETE',
    });

    if (!res.ok) {
        throw new Error('Failed to clear cart');
    }
}
