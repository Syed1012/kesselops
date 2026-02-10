"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingCart,
    Trash2,
    ArrowLeft,
    Package,
    Loader2,
    Minus,
    Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/cart-context";
import { purchaseOrderApi } from "@/lib/api";
import Link from "next/link";

const VENUE_ID = 1;

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, clearCart, totalCost } = useCart();
    const [placing, setPlacing] = useState(false);
    const router = useRouter();

    const handlePlaceOrder = async () => {
        if (items.length === 0) return;

        setPlacing(true);
        try {
            await purchaseOrderApi.create({
                venueId: VENUE_ID,
                lines: items.map((item) => ({
                    inventoryItemId: item.inventoryItemId,
                    quantity: item.quantity,
                    unitCost: item.unitCost,
                })),
            });
            clearCart();
            toast.success("Order placed successfully!");
            router.push("/dashboard/inventory");
        } catch (err) {
            console.error("Failed to place order:", err);
            toast.error("Failed to place order. Please try again.");
        } finally {
            setPlacing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/inventory">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Purchase Cart</h1>
                        <p className="text-muted-foreground">
                            {items.length} {items.length === 1 ? "item" : "items"} in cart
                        </p>
                    </div>
                </div>
                {items.length > 0 && (
                    <Button variant="outline" className="text-danger border-danger/30 hover:bg-danger/10" onClick={clearCart}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Cart
                    </Button>
                )}
            </div>

            {/* Empty State */}
            {items.length === 0 ? (
                <Card>
                    <CardContent className="py-16">
                        <div className="text-center space-y-4">
                            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30" />
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Your cart is empty</h3>
                                <p className="text-muted-foreground mt-1">
                                    Use the &quot;Quick Order&quot; button on inventory items to add them here.
                                </p>
                            </div>
                            <Link href="/dashboard/inventory">
                                <Button className="gap-2 mt-2">
                                    <Package className="h-4 w-4" />
                                    Go to Inventory
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Cart Table */}
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
                                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">SKU</th>
                                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Unit</th>
                                            <th className="text-center p-4 text-sm font-medium text-muted-foreground">Quantity</th>
                                            <th className="text-right p-4 text-sm font-medium text-muted-foreground">Unit Cost</th>
                                            <th className="text-right p-4 text-sm font-medium text-muted-foreground">Line Total</th>
                                            <th className="text-right p-4 text-sm font-medium text-muted-foreground w-16"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {items.map((item, i) => (
                                                <motion.tr
                                                    key={item.inventoryItemId}
                                                    className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    transition={{ delay: i * 0.03 }}
                                                >
                                                    <td className="p-4">
                                                        <p className="font-medium text-foreground">{item.name}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-sm text-muted-foreground font-mono">{item.sku}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-sm text-muted-foreground">{item.unit}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => updateQuantity(item.inventoryItemId, Math.max(1, item.quantity - 1))}
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                value={item.quantity}
                                                                onChange={(e) => {
                                                                    const val = parseFloat(e.target.value);
                                                                    if (!isNaN(val) && val > 0) {
                                                                        updateQuantity(item.inventoryItemId, val);
                                                                    }
                                                                }}
                                                                className="w-20 text-center h-8"
                                                            />
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => updateQuantity(item.inventoryItemId, item.quantity + 1)}
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <span className="text-sm text-foreground">€{item.unitCost.toFixed(2)}</span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <span className="font-medium text-foreground">
                                                            €{(item.quantity * item.unitCost).toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-danger"
                                                            onClick={() => removeFromCart(item.inventoryItemId)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Summary */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-semibold text-foreground">Order Total</p>
                                    <p className="text-sm text-muted-foreground">
                                        {items.length} {items.length === 1 ? "item" : "items"} ·{" "}
                                        {items.reduce((sum, i) => sum + i.quantity, 0)} units
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-foreground">€{totalCost.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <Button
                                    size="lg"
                                    className="gap-2 px-8"
                                    onClick={handlePlaceOrder}
                                    disabled={placing}
                                >
                                    {placing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Placing Order...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="h-4 w-4" />
                                            Place Order
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
