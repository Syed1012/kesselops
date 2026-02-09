package de.kesselops.guest.model;

/**
 * Order status following kitchen workflow.
 * PENDING → KITCHEN → READY → SERVED
 */
public enum OrderStatus {
    PENDING,
    KITCHEN,
    READY,
    SERVED
}
