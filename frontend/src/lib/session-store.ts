/**
 * Session Store - Zustand state management for guest ordering
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, Order, CartItem as ApiCartItem } from './api';

// ============================================
// CART ITEM TYPE (using API type)
// ============================================

export type CartItem = ApiCartItem;

// ============================================
// STORE STATE
// ============================================

interface SessionState {
    // Session data
    session: Session | null;
    tableId: number | null;
    tableCode: string | null;

    // Cart (items pending order)
    cart: CartItem[];

    // Submitted orders
    orders: Order[];

    // Loading states
    isLoading: boolean;
    error: string | null;

    // Actions
    setSession: (session: Session) => void;
    setTableInfo: (tableId: number, tableCode: string) => void;

    // Cart actions
    syncCart: (cart: CartItem[]) => void;
    clearCart: () => void;

    // Order actions
    addOrder: (order: Order) => void;
    updateOrderStatus: (orderId: number, status: Order['status']) => void;
    syncOrders: (orders: Order[]) => void;

    // Session actions
    closeSession: () => void;

    // Loading/Error
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useSessionStore = create<SessionState>()(
    persist(
        (set, get) => ({
            // Initial state
            session: null,
            tableId: null,
            tableCode: null,
            cart: [],
            orders: [],
            isLoading: false,
            error: null,

            // Session setters
            setSession: (session) => set({ session, error: null }),
            setTableInfo: (tableId, tableCode) => set({ tableId, tableCode }),

            // Cart actions (synced from database)
            syncCart: (cart) => set({ cart }),
            clearCart: () => set({ cart: [] }),

            // Order actions
            addOrder: (order) => {
                set({ orders: [...get().orders, order] });
            },

            updateOrderStatus: (orderId, status) => {
                set({
                    orders: get().orders.map((o) =>
                        o.id === orderId ? { ...o, status } : o
                    ),
                });
            },

            syncOrders: (orders) => {
                set({ orders });
            },

            // Session actions
            closeSession: () => {
                set({
                    session: null,
                    tableId: null,
                    tableCode: null,
                    cart: [],
                    orders: [],
                });
            },

            // Loading/Error
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
        }),
        {
            name: 'kesselops-session',
            partialize: (state) => ({
                session: state.session,
                tableId: state.tableId,
                tableCode: state.tableCode,
                cart: state.cart,
                orders: state.orders,
            }),
        }
    )
);

// ============================================
// SELECTORS
// ============================================

export const selectCartTotal = (state: SessionState): number => {
    return state.cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
};

export const selectCartItemCount = (state: SessionState): number => {
    return state.cart.reduce((sum, item) => sum + item.quantity, 0);
};

export const selectOrdersTotal = (state: SessionState): number => {
    return state.orders.reduce((sum, order) => sum + order.totalAmount, 0);
};

export const selectIsSessionActive = (state: SessionState): boolean => {
    return state.session?.status === 'ACTIVE';
};
