"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inventoryApi, InventoryItem, InventoryItemRequest } from "@/lib/api";

interface ProductModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item?: InventoryItem | null;
    venueId: number;
    onSuccess: () => void;
}

export function ProductModal({
    open,
    onOpenChange,
    item,
    venueId,
    onSuccess,
}: ProductModalProps) {
    const isEditing = !!item;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state - using strings for numbers to handle empty states better
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        description: "",
        unit: "bottle",
        quantityOnHand: "",
        reorderLevel: "",
        reorderQuantity: "",
        unitCost: "",
        venueId: venueId,
    });

    // Reset form when modal opens/closes or item changes
    useEffect(() => {
        if (open) {
            if (item) {
                setFormData({
                    name: item.name,
                    sku: item.sku,
                    description: item.description || "",
                    unit: item.unit,
                    quantityOnHand: item.quantityOnHand.toString(),
                    reorderLevel: (item.reorderLevel || 0).toString(),
                    reorderQuantity: (item.reorderQuantity || 0).toString(),
                    unitCost: (item.unitCost || 0).toString(),
                    venueId: item.venueId,
                });
            } else {
                setFormData({
                    name: "",
                    sku: "",
                    description: "",
                    unit: "bottle",
                    quantityOnHand: "",
                    reorderLevel: "",
                    reorderQuantity: "",
                    unitCost: "",
                    venueId: venueId,
                });
            }
            setError(null);
        }
    }, [open, item, venueId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation
        if (!formData.unitCost || parseFloat(formData.unitCost) <= 0) {
            setError("Unit Cost is required and must be greater than 0");
            setLoading(false);
            return;
        }

        try {
            const payload: InventoryItemRequest = {
                name: formData.name,
                sku: formData.sku,
                description: formData.description,
                unit: formData.unit,
                quantityOnHand: parseFloat(formData.quantityOnHand) || 0,
                reorderLevel: parseFloat(formData.reorderLevel) || 0,
                reorderQuantity: parseFloat(formData.reorderQuantity) || 0,
                unitCost: parseFloat(formData.unitCost), // Mandatory now
                venueId: formData.venueId,
            };

            if (isEditing && item) {
                await inventoryApi.update(item.id, payload);
            } else {
                await inventoryApi.create(payload);
            }
            onSuccess();
            onOpenChange(false);
        } catch (err) {
            console.error("Failed to save product:", err);
            setError(err instanceof Error ? err.message : "Failed to save product");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Product" : "Add Product"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the product details below."
                            : "Fill in the details to add a new product to inventory."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="text-sm text-danger bg-danger/10 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder="e.g., Vodka Premium"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU *</Label>
                            <Input
                                id="sku"
                                value={formData.sku}
                                onChange={(e) => handleChange("sku", e.target.value)}
                                placeholder="e.g., VOD-001"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            placeholder="Optional description"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="unit">Unit *</Label>
                            <Input
                                id="unit"
                                value={formData.unit}
                                onChange={(e) => handleChange("unit", e.target.value)}
                                placeholder="e.g., bottle, kg, piece"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantityOnHand">Current Stock *</Label>
                            <Input
                                id="quantityOnHand"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.quantityOnHand}
                                onChange={(e) => handleChange("quantityOnHand", e.target.value)}
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="reorderLevel">Reorder Level</Label>
                            <Input
                                id="reorderLevel"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.reorderLevel}
                                onChange={(e) => handleChange("reorderLevel", e.target.value)}
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="unitCost">Unit Cost (€) *</Label>
                            <Input
                                id="unitCost"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={formData.unitCost}
                                onChange={(e) => handleChange("unitCost", e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
