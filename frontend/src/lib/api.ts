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
// API Service for KesselOps Backend

// Types
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'CHEF' | 'STAFF' | 'TRAINEE';
  venueId: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Venue {
  id: number;
  name: string;
  address: string;
  city: string;
  type: string;
  timezone: string;
  createdAt: string;
}

export interface Shift {
  id: number;
  venueId: number;
  userId: number | null;
  startTime: string;
  endTime: string;
  type: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  notes: string | null;
  isActive: boolean;
  durationHours: number;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

// Token management
const TOKEN_KEY = 'kesselops_access_token';
const REFRESH_TOKEN_KEY = 'kesselops_refresh_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function storeTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Fetch wrapper with auth
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getStoredToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry with new token
        const newToken = getStoredToken();
        (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });
        return retryResponse.json();
      } else {
        clearTokens();
        window.location.href = '/login';
        return { success: false, data: null, error: 'Session expired' };
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        data: null,
        error: errorData.error || `HTTP ${response.status}`
      };
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

// Auth API
export async function login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
  const response = await fetchApi<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (response.success && response.data) {
    storeTokens(response.data.accessToken, response.data.refreshToken);
  }

  return response;
}

export async function register(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<ApiResponse<User>> {
  return fetchApi<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function refreshToken(): Promise<boolean> {
  const refreshTokenValue = getStoredRefreshToken();
  if (!refreshTokenValue) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });

    if (!response.ok) return false;

    const data: ApiResponse<TokenPair> = await response.json();
    if (data.success && data.data) {
      storeTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function logout(): Promise<void> {
  const refreshTokenValue = getStoredRefreshToken();
  const token = getStoredToken();

  if (refreshTokenValue && token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });
    } catch {
      // Ignore errors on logout
    }
  }
  clearTokens();
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  return fetchApi<User>('/auth/me');
}

// User API
export async function getUsers(venueId?: number): Promise<ApiResponse<User[]>> {
  const query = venueId ? `?venueId=${venueId}` : '';
  return fetchApi<User[]>(`/users${query}`);
}

export async function getUser(id: number): Promise<ApiResponse<User>> {
  return fetchApi<User>(`/users/${id}`);
}

// Venue API
export async function getVenues(): Promise<ApiResponse<Venue[]>> {
  return fetchApi<Venue[]>('/venues');
}

export async function getVenue(id: number): Promise<ApiResponse<Venue>> {
  return fetchApi<Venue>(`/venues/${id}`);
}

export async function createVenue(data: {
  name: string;
  address: string;
  city: string;
  type: string;
  timezone?: string;
}): Promise<ApiResponse<Venue>> {
  return fetchApi<Venue>('/venues', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateVenue(id: number, data: {
  name: string;
  address: string;
  city: string;
  type: string;
  timezone?: string;
}): Promise<ApiResponse<Venue>> {
  return fetchApi<Venue>(`/venues/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Shift API
export async function getShifts(
  venueId: number,
  from?: string,
  to?: string
): Promise<ApiResponse<{ content: Shift[] }>> {
  let query = `venueId=${venueId}`;
  if (from) query += `&from=${encodeURIComponent(from)}`;
  if (to) query += `&to=${encodeURIComponent(to)}`;
  return fetchApi<{ content: Shift[] }>(`/shifts?${query}`);
}

export async function getShift(id: number): Promise<ApiResponse<Shift>> {
  return fetchApi<Shift>(`/shifts/${id}`);
}

export async function createShift(data: {
  venueId: number;
  userId?: number;
  startTime: string;
  endTime: string;
  type: string;
  notes?: string;
}): Promise<ApiResponse<Shift>> {
  return fetchApi<Shift>('/shifts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteShift(id: number): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/shifts/${id}`, { method: 'DELETE' });
}

export async function updateShift(id: number, data: {
  startTime?: string;
  endTime?: string;
  type?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
  notes?: string;
}): Promise<ApiResponse<Shift>> {
  return fetchApi<Shift>(`/shifts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function startShift(id: number): Promise<ApiResponse<Shift>> {
  return fetchApi<Shift>(`/shifts/${id}/start`, { method: 'POST' });
}

export async function endShift(id: number): Promise<ApiResponse<Shift>> {
  return fetchApi<Shift>(`/shifts/${id}/end`, { method: 'POST' });
}

// Invite API
export interface InviteRequest {
  firstName: string;
  lastName: string;
  role: 'MANAGER' | 'CHEF' | 'STAFF' | 'TRAINEE';
  venueId: number;
}

export interface InviteResponse {
  email: string;
  password: string;
  user: User;
}

export async function inviteUser(data: InviteRequest): Promise<ApiResponse<InviteResponse>> {
  return fetchApi<InviteResponse>('/auth/invite', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: number): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/users/${id}`, { method: 'DELETE' });
}

// ─── Task API ─────────────────────────────────────────────

export async function getTasks(venueId: number): Promise<ApiResponse<any[]>> {
  return fetchApi<any[]>(`/tasks?venueId=${venueId}`);
}

export async function createTask(data: {
  title: string;
  description?: string;
  priority: string;
  category: string;
  requiresPhoto?: boolean;
  assigneeId?: number | null;
  dueDate?: string;
  venueId: number;
}): Promise<ApiResponse<any>> {
  return fetchApi<any>('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createTasksBatch(data: {
  venueId: number;
  templateName: string;
  tasks: { title: string; description: string; priority: string; category: string; requiresPhoto: boolean }[];
}): Promise<ApiResponse<any[]>> {
  return fetchApi<any[]>('/tasks/batch', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTask(id: number, data: {
  title: string;
  description?: string;
  priority: string;
  category: string;
  requiresPhoto?: boolean;
  assigneeId?: number | null;
  dueDate?: string;
}): Promise<ApiResponse<any>> {
  return fetchApi<any>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateTaskStatus(id: number, status: string): Promise<ApiResponse<any>> {
  return fetchApi<any>(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function uploadTaskPhoto(id: number, file: File, markDone: boolean = true): Promise<ApiResponse<any>> {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('markDone', String(markDone));

  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/tasks/${id}/photo`,
      {
        method: 'POST',
        headers,
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, data: null, error: errorData.error || `HTTP ${response.status}` };
    }

    return response.json();
  } catch (error) {
    console.error('Upload Error:', error);
    return { success: false, data: null, error: error instanceof Error ? error.message : 'Upload failed' };
  }
}

export async function deleteTask(id: number): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/tasks/${id}`, { method: 'DELETE' });
}

// ─── Handover API ─────────────────────────────────────────

export interface Handover {
  id: number;
  fromShiftId: number;
  toShiftId: number | null;
  authorUserId: number;
  summary: string;
  openIssues: string | null;
  nextSteps: string | null;
  acknowledgedByUserId: number | null;
  acknowledgedAt: string | null;
  createdAt: string;
}

export async function createHandover(shiftId: number, data: {
  toShiftId: number;
  summary: string;
  openIssues?: string;
  nextSteps?: string;
}): Promise<ApiResponse<Handover>> {
  return fetchApi<Handover>(`/shifts/${shiftId}/handover`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getOutgoingHandover(shiftId: number): Promise<ApiResponse<Handover>> {
  return fetchApi<Handover>(`/shifts/${shiftId}/handover`);
}

export async function getIncomingHandover(shiftId: number): Promise<ApiResponse<Handover>> {
  return fetchApi<Handover>(`/shifts/${shiftId}/handover/incoming`);
}

export async function acknowledgeHandover(shiftId: number): Promise<ApiResponse<Handover>> {
  // The backend acknowledges the *incoming* handover for this shift
  return fetchApi<Handover>(`/shifts/${shiftId}/handover/acknowledge`, { method: 'POST' });
}
