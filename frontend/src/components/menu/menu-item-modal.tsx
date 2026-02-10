"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MenuItem, MenuItemRequest, MenuCategory } from "@/lib/api";

interface MenuItemModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item?: MenuItem | null;
    venueId: number;
    onSuccess: () => void;
}

const CATEGORY_OPTIONS: { value: MenuCategory; label: string }[] = [
    { value: "COCKTAIL", label: "Cocktails" },
    { value: "BEER", label: "Beer" },
    { value: "WINE", label: "Wine" },
    { value: "SPIRIT", label: "Spirits" },
    { value: "SOFT_DRINK", label: "Soft Drinks" },
    { value: "HOT_DRINK", label: "Hot Drinks" },
    { value: "FOOD", label: "Food" },
    { value: "DESSERT", label: "Desserts" },
    { value: "SNACK", label: "Snacks" },
    { value: "OTHER", label: "Other" },
];

export function MenuItemModal({
    open,
    onOpenChange,
    item,
    venueId,
    onSuccess,
}: MenuItemModalProps) {
    const isEditing = !!item;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "COCKTAIL" as MenuCategory,
        price: "",
        cost: "",
        venueId: venueId,
    });

    // Reset form when modal opens/closes or item changes
    useEffect(() => {
        if (open) {
            if (item) {
                setFormData({
                    name: item.name,
                    description: item.description || "",
                    category: item.category,
                    price: item.price.toString(),
                    cost: item.cost.toString(),
                    venueId: item.venueId,
                });
            } else {
                setFormData({
                    name: "",
                    description: "",
                    category: "COCKTAIL",
                    price: "",
                    cost: "",
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
        const priceNum = parseFloat(formData.price);
        const costNum = parseFloat(formData.cost);

        if (!formData.price || priceNum <= 0) {
            setError("Price is required and must be greater than 0");
            setLoading(false);
            return;
        }

        if (!formData.cost || costNum <= 0) {
            setError("Cost is required and must be greater than 0");
            setLoading(false);
            return;
        }

        try {
            const payload: MenuItemRequest = {
                name: formData.name,
                description: formData.description || undefined,
                category: formData.category,
                price: priceNum,
                cost: costNum,
                venueId: formData.venueId,
            };

            const { menuItemApi } = await import("@/lib/api");

            if (isEditing && item) {
                await menuItemApi.update(item.id, payload);
                toast.success("Menu item updated successfully");
            } else {
                await menuItemApi.create(payload);
                toast.success("Menu item added successfully");
            }
            onSuccess();
            onOpenChange(false);
        } catch (err) {
            console.error("Failed to save menu item:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to save menu item";
            setError(errorMessage);
            toast.error(errorMessage);
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
                    <DialogTitle>{isEditing ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the menu item details below."
                            : "Fill in the details to add a new menu item."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="text-sm text-danger bg-danger/10 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder="e.g., Vodka Tonic"
                                required
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                placeholder="Optional description"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value: string) => handleChange("category", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORY_OPTIONS.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Price (€) *</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => handleChange("price", e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="cost">Cost (€) *</Label>
                            <Input
                                id="cost"
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={formData.cost}
                                onChange={(e) => handleChange("cost", e.target.value)}
                                placeholder="0.00"
                                required
                            />
                            {formData.price && formData.cost && (
                                <p className="text-xs text-muted-foreground">
                                    Margin:{" "}
                                    {((parseFloat(formData.price) - parseFloat(formData.cost)) /
                                        parseFloat(formData.price) *
                                        100 || 0
                                    ).toFixed(1)}
                                    %
                                </p>
                            )}
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
