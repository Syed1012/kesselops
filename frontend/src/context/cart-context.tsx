"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CartItem {
    inventoryItemId: number;
    name: string;
    sku: string;
    unit: string;
    quantity: number;
    unitCost: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (inventoryItemId: number) => void;
    updateQuantity: (inventoryItemId: number, quantity: number) => void;
    clearCart: () => void;
    itemCount: number;
    totalCost: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "kesselops_cart";

function loadCartFromStorage(): CartItem[] {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveCartToStorage(items: CartItem[]) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
        // silently fail
    }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [hydrated, setHydrated] = useState(false);

    // Hydrate from localStorage on mount
    useEffect(() => {
        setItems(loadCartFromStorage());
        setHydrated(true);
    }, []);

    // Persist to localStorage on every change (after hydration)
    useEffect(() => {
        if (hydrated) {
            saveCartToStorage(items);
        }
    }, [items, hydrated]);

    const addToCart = useCallback((newItem: CartItem) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.inventoryItemId === newItem.inventoryItemId);
            if (existing) {
                // Increase quantity if already in cart
                return prev.map((i) =>
                    i.inventoryItemId === newItem.inventoryItemId
                        ? { ...i, quantity: i.quantity + newItem.quantity }
                        : i
                );
            }
            return [...prev, newItem];
        });
    }, []);

    const removeFromCart = useCallback((inventoryItemId: number) => {
        setItems((prev) => prev.filter((i) => i.inventoryItemId !== inventoryItemId));
    }, []);

    const updateQuantity = useCallback((inventoryItemId: number, quantity: number) => {
        if (quantity <= 0) return;
        setItems((prev) =>
            prev.map((i) =>
                i.inventoryItemId === inventoryItemId ? { ...i, quantity } : i
            )
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const itemCount = items.length;

    const totalCost = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

    return (
        <CartContext.Provider
            value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, totalCost }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
