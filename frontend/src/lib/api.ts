/**
 * API Client for KesselOps Backend
 * Provides typed access to inventory and menu endpoints
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Inventory Types
export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number | null;
  reorderQuantity: number | null;
  unitCost: number | null;
  venueId: number;
  supplierId: number | null;
  supplierName: string | null;
  active: boolean;
  lowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItemRequest {
  name: string;
  sku: string;
  description?: string;
  unit: string;
  quantityOnHand: number;
  reorderLevel?: number;
  reorderQuantity?: number;
  unitCost?: number;
  venueId: number;
  supplierId?: number;
}

// Supplier Types
export interface Supplier {
  id: number;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// MenuItem Types
export type MenuCategory =
  | "COCKTAIL" | "BEER" | "WINE" | "SPIRIT"
  | "SOFT_DRINK" | "HOT_DRINK" | "FOOD"
  | "DESSERT" | "SNACK" | "OTHER";

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  category: MenuCategory;
  price: number;
  cost: number;
  profitMargin: number;
  venueId: number;
  available: boolean;
  active: boolean;
  hasRecipe: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemRequest {
  name: string;
  description?: string;
  category: MenuCategory;
  price: number;
  cost?: number;
  venueId: number;
}

// Menu Types
export type MenuType =
  | "DRINKS" | "FOOD" | "HAPPY_HOUR" | "BRUNCH"
  | "COCKTAILS" | "WINE" | "BEER" | "SPECIALS";

export type SyndicationTarget =
  | "SPEISEKARTE_DE" | "GOOGLE_BUSINESS" | "TRIPADVISOR"
  | "UBER_EATS" | "LIEFERANDO" | "WOLT";

export type SyndicationStatus =
  | "PENDING" | "IN_PROGRESS" | "SUCCESS" | "FAILED" | "DISABLED";

export interface MenuSyndication {
  id: number;
  menuId: number;
  target: SyndicationTarget;
  targetDisplayName: string;
  status: SyndicationStatus;
  enabled: boolean;
  externalId: string | null;
  externalUrl: string | null;
  lastSyncAt: string | null;
  lastError: string | null;
}

export interface Menu {
  id: number;
  name: string;
  description: string | null;
  type: MenuType;
  venueId: number;
  active: boolean;
  displayOrder: number;
  itemCount: number;
  items: MenuItem[] | null;
  syndications: MenuSyndication[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuRequest {
  name: string;
  description?: string;
  type: MenuType;
  venueId: number;
  displayOrder?: number;
}

// Purchase Order Types
export type PurchaseOrderStatus =
  | "DRAFT" | "PENDING" | "APPROVED" | "ORDERED" | "RECEIVED" | "CANCELLED";

export interface PurchaseOrderLineRequest {
  inventoryItemId: number;
  quantity: number;
  unitCost?: number;
}

export interface PurchaseOrderRequest {
  venueId: number;
  supplierId?: number;
  notes?: string;
  lines: PurchaseOrderLineRequest[];
}

export interface PurchaseOrderLineResponse {
  id: number;
  inventoryItemId: number;
  inventoryItemName: string;
  inventoryItemSku: string;
  unit: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface PurchaseOrderResponse {
  id: number;
  venueId: number;
  supplierId: number | null;
  supplierName: string | null;
  status: PurchaseOrderStatus;
  notes: string | null;
  totalAmount: number;
  lines: PurchaseOrderLineResponse[];
  createdAt: string;
  updatedAt: string;
}

// API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new ApiError(
      response.status,
      `API Error: ${response.statusText}`,
      errorBody
    );
  }

  return response.json();
}

// ==================== Inventory API ====================

export const inventoryApi = {
  list: async (venueId: number, page = 0, size = 20, search?: string) => {
    const params = new URLSearchParams({
      venueId: venueId.toString(),
      page: page.toString(),
      size: size.toString(),
    });
    if (search) params.set("search", search);

    const res = await fetchApi<ApiResponse<PagedResponse<InventoryItem>>>(`/api/inventory-items?${params}`);
    return res.data;
  },

  getById: async (id: number) => {
    const res = await fetchApi<ApiResponse<InventoryItem>>(`/api/inventory-items/${id}`);
    return res.data;
  },

  create: async (item: InventoryItemRequest) => {
    const res = await fetchApi<ApiResponse<InventoryItem>>("/api/inventory-items", {
      method: "POST",
      body: JSON.stringify(item),
    });
    return res.data;
  },

  update: async (id: number, item: InventoryItemRequest) => {
    const res = await fetchApi<ApiResponse<InventoryItem>>(`/api/inventory-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(item),
    });
    return res.data;
  },

  deactivate: async (id: number) => {
    await fetchApi<ApiResponse<void>>(`/api/inventory-items/${id}`, {
      method: "DELETE",
    });
  },

  getLowStock: async (venueId: number) => {
    const res = await fetchApi<ApiResponse<InventoryItem[]>>(`/api/inventory-items/low-stock?venueId=${venueId}`);
    return res.data;
  },
};

// ==================== Supplier API ====================

export const supplierApi = {
  list: async (page = 0, size = 20, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (search) params.set("search", search);

    return fetchApi<ApiResponse<PagedResponse<Supplier>>>(`/api/suppliers?${params}`);
  },

  getById: async (id: number) => {
    const res = await fetchApi<ApiResponse<Supplier>>(`/api/suppliers/${id}`);
    return res.data;
  },

  create: async (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt" | "active">) => {
    const res = await fetchApi<ApiResponse<Supplier>>("/api/suppliers", {
      method: "POST",
      body: JSON.stringify(supplier),
    });
    return res.data;
  },
};

// ==================== MenuItem API ====================

export const menuItemApi = {
  list: async (venueId: number, category?: MenuCategory) => {
    const params = new URLSearchParams({ venueId: venueId.toString() });
    if (category) params.set("category", category);

    const res = await fetchApi<ApiResponse<PagedResponse<MenuItem>>>(`/api/menu-items?${params}`);
    return res.data?.content ?? [];
  },

  getById: async (id: number) => {
    const res = await fetchApi<ApiResponse<MenuItem>>(`/api/menu-items/${id}`);
    return res.data;
  },

  create: async (item: MenuItemRequest) => {
    const res = await fetchApi<ApiResponse<MenuItem>>("/api/menu-items", {
      method: "POST",
      body: JSON.stringify(item),
    });
    return res.data;
  },

  update: async (id: number, item: MenuItemRequest) => {
    const res = await fetchApi<ApiResponse<MenuItem>>(`/api/menu-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(item),
    });
    return res.data;
  },

  toggleAvailability: async (id: number, available: boolean) => {
    const res = await fetchApi<ApiResponse<MenuItem>>(`/api/menu-items/${id}/availability?available=${available}`, {
      method: "PATCH",
    });
    return res.data;
  },

  deactivate: async (id: number) => {
    await fetchApi<ApiResponse<void>>(`/api/menu-items/${id}`, {
      method: "DELETE",
    });
  },
};

// ==================== Menu API ====================

export const menuApi = {
  list: async (venueId: number, type?: MenuType) => {
    const params = new URLSearchParams({ venueId: venueId.toString() });
    if (type) params.set("type", type);

    const res = await fetchApi<ApiResponse<Menu[]>>(`/api/menus?${params}`);
    return res.data;
  },

  getById: async (id: number, includeItems = false) => {
    const res = await fetchApi<ApiResponse<Menu>>(`/api/menus/${id}?includeItems=${includeItems}`);
    return res.data;
  },

  create: async (menu: MenuRequest) => {
    const res = await fetchApi<ApiResponse<Menu>>("/api/menus", {
      method: "POST",
      body: JSON.stringify(menu),
    });
    return res.data;
  },

  update: async (id: number, menu: MenuRequest) => {
    const res = await fetchApi<ApiResponse<Menu>>(`/api/menus/${id}`, {
      method: "PUT",
      body: JSON.stringify(menu),
    });
    return res.data;
  },

  deactivate: async (id: number) => {
    await fetchApi<ApiResponse<void>>(`/api/menus/${id}`, {
      method: "DELETE",
    });
  },

  addItem: async (menuId: number, menuItemId: number) => {
    const res = await fetchApi<ApiResponse<Menu>>(`/api/menus/${menuId}/items/${menuItemId}`, {
      method: "POST",
    });
    return res.data;
  },

  removeItem: async (menuId: number, menuItemId: number) => {
    const res = await fetchApi<ApiResponse<Menu>>(`/api/menus/${menuId}/items/${menuItemId}`, {
      method: "DELETE",
    });
    return res.data;
  },

  addSyndication: async (menuId: number, target: SyndicationTarget, enabled: boolean, configJson?: string) => {
    const res = await fetchApi<ApiResponse<Menu>>(`/api/menus/${menuId}/syndications`, {
      method: "POST",
      body: JSON.stringify({ target, enabled, configJson }),
    });
    return res.data;
  },

  toggleSyndication: async (menuId: number, syndicationId: number, enabled: boolean) => {
    await fetchApi<ApiResponse<void>>(`/api/menus/${menuId}/syndications/${syndicationId}?enabled=${enabled}`, {
      method: "PATCH",
    });
  },

  removeSyndication: async (menuId: number, syndicationId: number) => {
    await fetchApi<ApiResponse<void>>(`/api/menus/${menuId}/syndications/${syndicationId}`, {
      method: "DELETE",
    });
  },
};

// ==================== Purchase Order API ====================

export const purchaseOrderApi = {
  create: async (order: PurchaseOrderRequest) => {
    const res = await fetchApi<ApiResponse<PurchaseOrderResponse>>("/api/purchase-orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
    return res.data;
  },

  list: async (venueId: number, page = 0, size = 20, status?: PurchaseOrderStatus) => {
    const params = new URLSearchParams({
      venueId: venueId.toString(),
      page: page.toString(),
      size: size.toString(),
    });
    if (status) params.set("status", status);

    const res = await fetchApi<ApiResponse<PagedResponse<PurchaseOrderResponse>>>(`/api/purchase-orders?${params}`);
    return res.data;
  },

  getById: async (id: number) => {
    const res = await fetchApi<ApiResponse<PurchaseOrderResponse>>(`/api/purchase-orders/${id}`);
    return res.data;
  },

  updateStatus: async (id: number, status: PurchaseOrderStatus) => {
    const res = await fetchApi<ApiResponse<PurchaseOrderResponse>>(`/api/purchase-orders/${id}/status?status=${status}`, {
      method: "PATCH",
    });
    return res.data;
  },

  cancel: async (id: number) => {
    await fetchApi<ApiResponse<void>>(`/api/purchase-orders/${id}`, {
      method: "DELETE",
    });
  },
};

// Export default object for convenience
const api = {
  inventory: inventoryApi,
  supplier: supplierApi,
  menuItem: menuItemApi,
  menu: menuApi,
  purchaseOrder: purchaseOrderApi,
};

export default api;
