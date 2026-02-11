/**
 * KesselOps API Client
 * Consolidated type-safe API client for both Guest and Staff operations.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ============================================
// BASE TYPES
// ============================================

export interface ErrorDetails {
  code: string;
  message: string;
  field?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  error?: string;
  errorDetails?: ErrorDetails;
  timestamp?: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
}

// ============================================
// GUEST ENGINE TYPES
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
  tip?: number;
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
// INVENTORY & MENU TYPES
// ============================================

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
  imageUrl: string | null;
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

export type MenuType =
  | "DRINKS" | "FOOD" | "HAPPY_HOUR" | "BRUNCH"
  | "COCKTAILS" | "WINE" | "BEER" | "SPECIALS";

export interface MenuRequest {
  name: string;
  description?: string;
  type: MenuType;
  venueId: number;
  displayOrder?: number;
}

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

// ============================================
// OPERATIONS TYPES
// ============================================

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'CHEF' | 'STAFF' | 'TRAINEE';
  venueId: number | null;
  isActive: boolean;
  phone?: string;
  createdAt: string;
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

export type ChecklistCategory = 'OPENING' | 'CLOSING' | 'CLEANING' | 'INVENTORY' | 'OTHER';

export interface Checklist {
  id: number;
  shiftId: number;
  category: ChecklistCategory;
  title: string;
  isCompleted: boolean;
  completionPercentage: number;
  createdAt: string;
}

export interface TaskItem {
  id: number;
  description: string;
  status: 'NOT_DONE' | 'DONE' | 'SKIPPED';
  sortOrder: number;
  requiresPhoto: boolean;
  completedAt: string | null;
  completedByUserId: number | null;
}

export interface ChecklistDetail extends Checklist {
  tasks: TaskItem[];
}

// Renamed from KanbanTask to Task to match UI expectations, while keeping description handling robust.
export interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  requiresPhoto: boolean;
  photoUrl: string | null;
  assigneeId: number | null;
  assigneeName: string | null;
  dueDate: string | null;
  venueId: number;
  createdByUserId: number;
  createdFromTemplate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type KanbanTask = Task; // Alias for backward compatibility

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

export type LearningProgressMap = Record<string, string[]>;

// ============================================
// AUTH & AI TYPES
// ============================================

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

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIChatResponse {
  reply: string;
  model: string;
}

export interface AIRecommendation {
  item: MenuItem;
  reason: string;
}

export interface AIRecommendationResponse {
  recommendations: AIRecommendation[];
  reasoning: string;
}

// ============================================
// TOKEN MANAGEMENT
// ============================================

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

// ============================================
// FETCH WRAPPER
// ============================================

async function fetchAuthApi<T>(
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

  const fullEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;

  try {
    const response = await fetch(`${API_BASE}${fullEndpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        const newToken = getStoredToken();
        (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(`${API_BASE}${fullEndpoint}`, {
          ...options,
          headers,
        });
        return processJsonResponse<T>(retryResponse);
      } else {
        clearTokens();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
        return { success: false, data: null, error: 'Session expired' };
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = typeof errorData.error === 'string'
        ? errorData.error
        : (errorData.error?.message || `HTTP ${response.status}`);

      return {
        success: false,
        data: null,
        error: errorMessage,
        errorDetails: typeof errorData.error === 'object' ? errorData.error : undefined
      };
    }

    return processJsonResponse<T>(response);
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

async function processJsonResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const json = await response.json();

  // Handle sanitization for Task types to ensure description is never null
  if (json.data) {
    if (Array.isArray(json.data)) {
      json.data = json.data.map((item: any) => sanitizeTask(item));
    } else {
      json.data = sanitizeTask(json.data);
    }
  }

  return json;
}

function sanitizeTask(item: any): any {
  if (item && typeof item === 'object' && ('title' in item || 'priority' in item)) {
    return {
      ...item,
      description: item.description || ""
    };
  }
  return item;
}

// ============================================
// AUTH API
// ============================================

export async function login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
  const response = await fetchAuthApi<LoginResponse>('/auth/login', {
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
  return fetchAuthApi<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function refreshToken(): Promise<boolean> {
  const refreshTokenValue = getStoredRefreshToken();
  if (!refreshTokenValue) return false;

  try {
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
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
      await fetch(`${API_BASE}/api/auth/logout`, {
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
  return fetchAuthApi<User>('/auth/me');
}

// ============================================
// GUEST API
// ============================================

export async function startSession(tableId: number, code?: string | null): Promise<Session> {
  const params = code ? `?code=${code}` : '';
  const res = await fetchAuthApi<Session>(`/tables/${tableId}/sessions/start${params}`, {
    method: 'POST'
  });
  if (!res.success || !res.data) throw new Error(res.error || 'Failed to start session');
  return res.data;
}

export async function checkActiveSession(tableId: number): Promise<boolean> {
  const res = await fetchAuthApi<boolean>(`/tables/${tableId}/active-status`);
  return res.data || false;
}

export async function getSession(sessionId: number): Promise<Session> {
  const res = await fetchAuthApi<Session>(`/sessions/${sessionId}`);
  if (!res.success || !res.data) throw new Error(res.error || 'Session not found');
  return res.data;
}

export async function findSessionByCode(code: string): Promise<Session> {
  const res = await fetchAuthApi<Session>(`/sessions/search?code=${code}`);
  if (!res.success || !res.data) throw new Error(res.error || 'Session not found');
  return res.data;
}

export async function createOrder(sessionId: number, request: any): Promise<Order> {
  const res = await fetchAuthApi<Order>(`/sessions/${sessionId}/orders`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
  if (!res.success || !res.data) throw new Error(res.error || 'Failed to create order');
  return res.data;
}

export async function getSessionOrders(sessionId: number): Promise<Order[]> {
  const res = await fetchAuthApi<Order[]>(`/sessions/${sessionId}/orders`);
  return res.data || [];
}

export async function createPayment(sessionId: number, request: any): Promise<Payment> {
  const res = await fetchAuthApi<Payment>(`/sessions/${sessionId}/payments`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
  if (!res.success || !res.data) throw new Error(res.error || 'Failed to create payment');
  return res.data;
}

export async function getSessionPayments(sessionId: number): Promise<Payment[]> {
  const res = await fetchAuthApi<Payment[]>(`/sessions/${sessionId}/payments`);
  return res.data || [];
}

export async function createReservation(request: any): Promise<Reservation> {
  const res = await fetchAuthApi<Reservation>('/reservations', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  if (!res.success || !res.data) throw new Error(res.error || 'Failed to create reservation');
  return res.data;
}

export async function getReservations(venueId: number, date: string): Promise<Reservation[]> {
  const res = await fetchAuthApi<Reservation[]>(`/reservations?venueId=${venueId}&date=${date}`);
  return res.data || [];
}

// ============================================
// CART API
// ============================================

export async function getSessionCart(sessionId: number): Promise<CartItem[]> {
  const res = await fetchAuthApi<CartItem[]>(`/sessions/${sessionId}/cart`);
  return res.data || [];
}

export async function addToCart(sessionId: number, menuItemId: number, menuItemName: string, unitPrice: number, menuItemImage?: string): Promise<CartItem> {
  const res = await fetchAuthApi<CartItem>(`/sessions/${sessionId}/cart`, {
    method: 'POST',
    body: JSON.stringify({ menuItemId, menuItemName, unitPrice, menuItemImage }),
  });
  if (!res.success || !res.data) throw new Error(res.error || 'Failed to add to cart');
  return res.data;
}

export async function updateCartItemQuantity(cartItemId: number, quantity: number): Promise<CartItem> {
  const res = await fetchAuthApi<CartItem>(`/cart/${cartItemId}?quantity=${quantity}`, {
    method: 'PATCH',
  });
  if (!res.success || !res.data) throw new Error(res.error || 'Failed to update cart');
  return res.data;
}

export async function removeFromCart(cartItemId: number): Promise<void> {
  const res = await fetchAuthApi<void>(`/cart/${cartItemId}`, {
    method: 'DELETE',
  });
  if (!res.success) throw new Error(res.error || 'Failed to remove from cart');
}

export async function clearCart(sessionId: number): Promise<void> {
  const res = await fetchAuthApi<void>(`/sessions/${sessionId}/cart`, {
    method: 'DELETE',
  });
  if (!res.success) throw new Error(res.error || 'Failed to clear cart');
}

// ============================================
// AI API
// ============================================

export async function aiChat(message: string, history: AIChatMessage[], venueId: number = 1, sessionId?: number): Promise<AIChatResponse> {
  const res = await fetchAuthApi<AIChatResponse>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history, venueId, sessionId: sessionId || null }),
  });
  if (!res.success || !res.data) throw new Error(res.error || 'AI chat failed');
  return res.data;
}

export async function aiRecommendations(venueId: number = 1, cartItemNames?: string[], preferences?: string): Promise<AIRecommendationResponse> {
  const res = await fetchAuthApi<AIRecommendationResponse>(`/ai/recommendations?venueId=${venueId}`, {
    method: 'POST',
    body: JSON.stringify({ cartItemNames: cartItemNames || [], preferences: preferences || '' }),
  });
  if (!res.success || !res.data) throw new Error(res.error || 'AI recommendations failed');
  return res.data;
}

// ============================================
// INVENTORY API
// ============================================

const DEFAULT_PAGED_RESPONSE = { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 };

export const inventoryApi = {
  list: async (venueId: number, page = 0, size = 20, search?: string): Promise<PagedResponse<InventoryItem>> => {
    const params = new URLSearchParams({ venueId: venueId.toString(), page: page.toString(), size: size.toString() });
    if (search) params.set("search", search);
    const res = await fetchAuthApi<PagedResponse<InventoryItem>>(`/inventory-items?${params}`);
    return res.data || DEFAULT_PAGED_RESPONSE;
  },
  getById: async (id: number): Promise<InventoryItem> => {
    const res = await fetchAuthApi<InventoryItem>(`/inventory-items/${id}`);
    if (!res.success || !res.data) throw new Error(res.error || "Inventory item not found");
    return res.data;
  },
  create: async (item: InventoryItemRequest): Promise<InventoryItem> => {
    const res = await fetchAuthApi<InventoryItem>("/inventory-items", {
      method: "POST",
      body: JSON.stringify(item),
    });
    if (!res.success || !res.data) throw new Error(res.error || "Failed to create inventory item");
    return res.data;
  },
  update: async (id: number, item: InventoryItemRequest): Promise<InventoryItem> => {
    const res = await fetchAuthApi<InventoryItem>(`/inventory-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(item),
    });
    if (!res.success || !res.data) throw new Error(res.error || "Failed to update inventory item");
    return res.data;
  },
  deactivate: async (id: number): Promise<void> => {
    const res = await fetchAuthApi<void>(`/inventory-items/${id}`, { method: "DELETE" });
    if (!res.success) throw new Error(res.error || "Failed to deactivate inventory item");
  },
  getLowStock: async (venueId: number): Promise<InventoryItem[]> => {
    const res = await fetchAuthApi<InventoryItem[]>(`/inventory-items/low-stock?venueId=${venueId}`);
    return res.data || [];
  },
};

// ============================================
// SUPPLIER API
// ============================================

export const supplierApi = {
  list: async (page = 0, size = 20, search?: string): Promise<PagedResponse<Supplier>> => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (search) params.set("search", search);
    const res = await fetchAuthApi<PagedResponse<Supplier>>(`/suppliers?${params}`);
    return res.data || DEFAULT_PAGED_RESPONSE;
  },
  getById: async (id: number): Promise<Supplier> => {
    const res = await fetchAuthApi<Supplier>(`/suppliers/${id}`);
    if (!res.success || !res.data) throw new Error(res.error || "Supplier not found");
    return res.data;
  },
  create: async (supplier: any): Promise<Supplier> => {
    const res = await fetchAuthApi<Supplier>("/suppliers", {
      method: "POST",
      body: JSON.stringify(supplier),
    });
    if (!res.success || !res.data) throw new Error(res.error || "Failed to create supplier");
    return res.data;
  },
};

// ============================================
// MENU ITEM API
// ============================================

export const menuItemApi = {
  list: async (venueId: number, category?: MenuCategory): Promise<MenuItem[]> => {
    const params = new URLSearchParams({ venueId: venueId.toString() });
    if (category) params.set("category", category);
    const res = await fetchAuthApi<PagedResponse<MenuItem>>(`/menu-items?${params}`);
    return res.data?.content ?? [];
  },
  getById: async (id: number): Promise<MenuItem> => {
    const res = await fetchAuthApi<MenuItem>(`/menu-items/${id}`);
    if (!res.success || !res.data) throw new Error(res.error || "Menu item not found");
    return res.data;
  },
  create: async (item: MenuItemRequest): Promise<MenuItem> => {
    const res = await fetchAuthApi<MenuItem>("/menu-items", {
      method: "POST",
      body: JSON.stringify(item),
    });
    if (!res.success || !res.data) throw new Error(res.error || "Failed to create menu item");
    return res.data;
  },
  update: async (id: number, item: MenuItemRequest): Promise<MenuItem> => {
    const res = await fetchAuthApi<MenuItem>(`/menu-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(item),
    });
    if (!res.success || !res.data) throw new Error(res.error || "Failed to update menu item");
    return res.data;
  },
  toggleAvailability: async (id: number, available: boolean): Promise<MenuItem> => {
    const res = await fetchAuthApi<MenuItem>(`/menu-items/${id}/availability?available=${available}`, {
      method: "PATCH",
    });
    if (!res.success || !res.data) throw new Error(res.error || "Failed to toggle availability");
    return res.data;
  },
  deactivate: async (id: number): Promise<void> => {
    const res = await fetchAuthApi<void>(`/menu-items/${id}`, { method: "DELETE" });
    if (!res.success) throw new Error(res.error || "Failed to deactivate menu item");
  },
};

export async function getAvailableMenuItems(venueId: number): Promise<MenuItem[]> {
  const res = await fetchAuthApi<MenuItem[]>(`/menu-items/available?venueId=${venueId}`);
  return res.data || [];
}

export async function getMenuItems(venueId: number, options?: any): Promise<any> {
  const params = new URLSearchParams();
  params.set('venueId', String(venueId));
  params.set('size', String(options?.size || 50));
  params.set('page', String(options?.page || 0));
  if (options?.category) params.set('category', options.category);
  if (options?.search) params.set('search', options.search);

  const res = await fetchAuthApi<PagedResponse<MenuItem>>(`/menu-items?${params.toString()}`);
  return {
    items: res.data?.content || [],
    totalElements: res.data?.totalElements || 0,
    totalPages: res.data?.totalPages || 0,
  };
}

// ============================================
// MENU API
// ============================================

export const menuApi = {
  list: async (venueId: number, type?: MenuType): Promise<Menu[]> => {
    const params = new URLSearchParams({ venueId: venueId.toString() });
    if (type) params.set("type", type);
    const res = await fetchAuthApi<Menu[]>(`/menus?${params}`);
    return res.data || [];
  },
  getById: async (id: number, includeItems = false): Promise<Menu> => {
    const res = await fetchAuthApi<Menu>(`/menus/${id}?includeItems=${includeItems}`);
    if (!res.success || !res.data) throw new Error(res.error || "Menu not found");
    return res.data;
  },
  create: async (menu: MenuRequest): Promise<Menu> => {
    const res = await fetchAuthApi<Menu>("/menus", {
      method: "POST",
      body: JSON.stringify(menu),
    });
    if (!res.success || !res.data) throw new Error(res.error || "Failed to create menu");
    return res.data;
  },
  update: async (id: number, menu: MenuRequest): Promise<Menu> => {
    const res = await fetchAuthApi<Menu>(`/menus/${id}`, {
      method: "PUT",
      body: JSON.stringify(menu),
    });
    if (!res.success || !res.data) throw new Error(res.error || "Failed to update menu");
    return res.data;
  },
  deactivate: async (id: number): Promise<void> => {
    const res = await fetchAuthApi<void>(`/menus/${id}`, { method: "DELETE" });
    if (!res.success) throw new Error(res.error || "Failed to deactivate menu");
  },
  addItem: async (menuId: number, menuItemId: number): Promise<Menu> => {
    const res = await fetchAuthApi<Menu>(`/menus/${menuId}/items/${menuItemId}`, { method: "POST" });
    if (!res.success || !res.data) throw new Error(res.error || "Failed to add item to menu");
    return res.data;
  },
  removeItem: async (menuId: number, menuItemId: number): Promise<Menu> => {
    const res = await fetchAuthApi<Menu>(`/menus/${menuId}/items/${menuItemId}`, { method: "DELETE" });
    if (!res.success || !res.data) throw new Error(res.error || "Failed to remove item from menu");
    return res.data;
  },
  addSyndication: async (menuId: number, target: SyndicationTarget, enabled: boolean, configJson?: string): Promise<Menu> => {
    const res = await fetchAuthApi<Menu>(`/menus/${menuId}/syndications`, {
      method: "POST",
      body: JSON.stringify({ target, enabled, configJson }),
    });
    if (!res.success || !res.data) throw new Error(res.error || "Failed to add syndication");
    return res.data;
  },
  toggleSyndication: async (menuId: number, syndicationId: number, enabled: boolean): Promise<void> => {
    const res = await fetchAuthApi<void>(`/menus/${menuId}/syndications/${syndicationId}?enabled=${enabled}`, { method: "PATCH" });
    if (!res.success) throw new Error(res.error || "Failed to toggle syndication");
  },
  removeSyndication: async (menuId: number, syndicationId: number): Promise<void> => {
    const res = await fetchAuthApi<void>(`/menus/${menuId}/syndications/${syndicationId}`, { method: "DELETE" });
    if (!res.success) throw new Error(res.error || "Failed to remove syndication");
  },
};

// ============================================
// PURCHASE ORDER API
// ============================================

export const purchaseOrderApi = {
  create: async (order: PurchaseOrderRequest): Promise<PurchaseOrderResponse> => {
    const res = await fetchAuthApi<PurchaseOrderResponse>("/purchase-orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
    if (!res.success || !res.data) throw new Error(res.error || "Failed to create purchase order");
    return res.data;
  },
  list: async (venueId: number, page = 0, size = 20, status?: PurchaseOrderStatus): Promise<PagedResponse<PurchaseOrderResponse>> => {
    const params = new URLSearchParams({ venueId: venueId.toString(), page: page.toString(), size: size.toString() });
    if (status) params.set("status", status);
    const res = await fetchAuthApi<PagedResponse<PurchaseOrderResponse>>(`/purchase-orders?${params}`);
    return res.data || DEFAULT_PAGED_RESPONSE;
  },
  getById: async (id: number): Promise<PurchaseOrderResponse> => {
    const res = await fetchAuthApi<PurchaseOrderResponse>(`/purchase-orders/${id}`);
    if (!res.success || !res.data) throw new Error(res.error || "Purchase order not found");
    return res.data;
  },
  updateStatus: async (id: number, status: PurchaseOrderStatus): Promise<PurchaseOrderResponse> => {
    const res = await fetchAuthApi<PurchaseOrderResponse>(`/purchase-orders/${id}/status?status=${status}`, { method: "PATCH" });
    if (!res.success || !res.data) throw new Error(res.error || "Failed to update status");
    return res.data;
  },
  cancel: async (id: number): Promise<void> => {
    const res = await fetchAuthApi<void>(`/purchase-orders/${id}`, { method: "DELETE" });
    if (!res.success) throw new Error(res.error || "Failed to cancel order");
  },
};

// ============================================
// USER API
// ============================================

export async function getUsers(venueId?: number): Promise<ApiResponse<User[]>> {
  const query = venueId ? `?venueId=${venueId}` : '';
  return fetchAuthApi<User[]>(`/users${query}`);
}

export async function getUser(id: number): Promise<ApiResponse<User>> {
  return fetchAuthApi<User>(`/users/${id}`);
}

export async function updateUser(id: number, data: any): Promise<ApiResponse<User>> {
  return fetchAuthApi<User>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function activateUser(id: number): Promise<ApiResponse<void>> {
  return fetchAuthApi<void>(`/users/${id}/activate`, { method: 'PATCH' });
}

export async function deactivateUser(id: number): Promise<ApiResponse<void>> {
  return fetchAuthApi<void>(`/users/${id}/deactivate`, { method: 'PATCH' });
}

export async function deleteUser(id: number): Promise<ApiResponse<void>> {
  return fetchAuthApi<void>(`/users/${id}`, { method: 'DELETE' });
}

// ============================================
// LEARNING PROGRESS API
// ============================================

export async function getLearningProgress(): Promise<ApiResponse<LearningProgressMap>> {
  return fetchAuthApi<LearningProgressMap>('/learning/progress');
}

export async function updateLearningModuleProgress(
  moduleId: string,
  completedChapterIds: string[]
): Promise<ApiResponse<string[]>> {
  return fetchAuthApi<string[]>(`/learning/progress/${encodeURIComponent(moduleId)}`, {
    method: 'PUT',
    body: JSON.stringify({ completedChapterIds }),
  });
}

// ============================================
// VENUE API
// ============================================

export async function getVenues(): Promise<ApiResponse<Venue[]>> {
  return fetchAuthApi<Venue[]>('/venues');
}

export async function getVenue(id: number): Promise<ApiResponse<Venue>> {
  return fetchAuthApi<Venue>(`/venues/${id}`);
}

export async function createVenue(data: any): Promise<ApiResponse<Venue>> {
  return fetchAuthApi<Venue>('/venues', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateVenue(id: number, data: any): Promise<ApiResponse<Venue>> {
  return fetchAuthApi<Venue>(`/venues/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============================================
// SHIFT API
// ============================================

export async function getShifts(venueId: number, from?: string, to?: string): Promise<ApiResponse<PagedResponse<Shift>>> {
  let query = `venueId=${venueId}`;
  if (from) query += `&from=${encodeURIComponent(from)}`;
  if (to) query += `&to=${encodeURIComponent(to)}`;
  return fetchAuthApi<PagedResponse<Shift>>(`/shifts?${query}`);
}

export async function getShift(id: number): Promise<ApiResponse<Shift>> {
  return fetchAuthApi<Shift>(`/shifts/${id}`);
}

export async function createShift(data: any): Promise<ApiResponse<Shift>> {
  return fetchAuthApi<Shift>('/shifts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteShift(id: number): Promise<ApiResponse<void>> {
  return fetchAuthApi<void>(`/shifts/${id}`, { method: 'DELETE' });
}

export async function updateShift(id: number, data: any): Promise<ApiResponse<Shift>> {
  return fetchAuthApi<Shift>(`/shifts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function startShift(id: number): Promise<ApiResponse<Shift>> {
  return fetchAuthApi<Shift>(`/shifts/${id}/start`, { method: 'POST' });
}

export async function endShift(id: number): Promise<ApiResponse<Shift>> {
  return fetchAuthApi<Shift>(`/shifts/${id}/end`, { method: 'POST' });
}

// ============================================
// INVITE API
// ============================================

export async function inviteUser(data: InviteRequest): Promise<ApiResponse<InviteResponse>> {
  return fetchAuthApi<InviteResponse>('/auth/invite', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

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

// ============================================
// TASK API
// ============================================

export async function getTasks(venueId: number, status?: string, category?: string): Promise<ApiResponse<Task[]>> {
  const params = new URLSearchParams({ venueId: venueId.toString() });
  if (status) params.set('status', status);
  if (category) params.set('category', category);
  return fetchAuthApi<Task[]>(`/tasks?${params}`);
}

export async function createTask(data: any): Promise<ApiResponse<Task>> {
  return fetchAuthApi<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createTasksBatch(data: any): Promise<ApiResponse<Task[]>> {
  return fetchAuthApi<Task[]>('/tasks/batch', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTask(id: number, data: any): Promise<ApiResponse<Task>> {
  return fetchAuthApi<Task>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateTaskStatus(id: number, status: string): Promise<ApiResponse<Task>> {
  return fetchAuthApi<Task>(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function uploadTaskPhoto(id: number, file: File, markDone: boolean = true): Promise<ApiResponse<Task>> {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('markDone', String(markDone));

  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/api/tasks/${id}/photo`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, data: null, error: errorData.error?.message || `HTTP ${response.status}` };
    }

    return processJsonResponse<Task>(response);
  } catch (error) {
    console.error('Upload Error:', error);
    return { success: false, data: null, error: error instanceof Error ? error.message : 'Upload failed' };
  }
}

export async function deleteTask(id: number): Promise<ApiResponse<void>> {
  return fetchAuthApi<void>(`/tasks/${id}`, { method: 'DELETE' });
}

// ============================================
// CHECKLIST API
// ============================================

export async function createChecklist(shiftId: number, data: { category: string; title: string }): Promise<ApiResponse<Checklist>> {
  return fetchAuthApi<Checklist>(`/shifts/${shiftId}/checklists`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function getChecklists(shiftId: number): Promise<ApiResponse<Checklist[]>> {
  return fetchAuthApi<Checklist[]>(`/shifts/${shiftId}/checklists`);
}

export async function getChecklist(shiftId: number, checklistId: number): Promise<ApiResponse<ChecklistDetail>> {
  return fetchAuthApi<ChecklistDetail>(`/shifts/${shiftId}/checklists/${checklistId}`);
}

export async function addChecklistTask(shiftId: number, checklistId: number, data: { description: string; sortOrder: number; requiresPhoto: boolean }): Promise<ApiResponse<TaskItem>> {
  return fetchAuthApi<TaskItem>(`/shifts/${shiftId}/checklists/${checklistId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function markChecklistTaskDone(shiftId: number, checklistId: number, taskId: number): Promise<ApiResponse<TaskItem>> {
  return fetchAuthApi<TaskItem>(`/shifts/${shiftId}/checklists/${checklistId}/tasks/${taskId}/done`, {
    method: 'PATCH'
  });
}

export async function skipChecklistTask(shiftId: number, checklistId: number, taskId: number): Promise<ApiResponse<TaskItem>> {
  return fetchAuthApi<TaskItem>(`/shifts/${shiftId}/checklists/${checklistId}/tasks/${taskId}/skip`, {
    method: 'PATCH'
  });
}

// ============================================
// HANDOVER API
// ============================================

export async function createHandover(shiftId: number, data: any): Promise<ApiResponse<Handover>> {
  return fetchAuthApi<Handover>(`/shifts/${shiftId}/handover`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getOutgoingHandover(shiftId: number): Promise<ApiResponse<Handover>> {
  return fetchAuthApi<Handover>(`/shifts/${shiftId}/handover`);
}

export async function getIncomingHandover(shiftId: number): Promise<ApiResponse<Handover>> {
  return fetchAuthApi<Handover>(`/shifts/${shiftId}/handover/incoming`);
}

export async function acknowledgeHandover(shiftId: number): Promise<ApiResponse<Handover>> {
  return fetchAuthApi<Handover>(`/shifts/${shiftId}/handover/acknowledge`, { method: 'POST' });
}

// ============================================
// EXPORT CONVENIENCE OBJECT
// ============================================

const api = {
  inventory: inventoryApi,
  supplier: supplierApi,
  menuItem: menuItemApi,
  menu: menuApi,
  purchaseOrder: purchaseOrderApi,
  auth: {
    login,
    register,
    logout,
    refresh: refreshToken,
    me: getCurrentUser
  },
  guest: {
    startSession,
    checkActiveSession,
    getSession,
    findSessionByCode,
    createOrder,
    getSessionOrders,
    createPayment,
    getSessionPayments,
    createReservation,
    getReservations,
    cart: {
      get: getSessionCart,
      add: addToCart,
      update: updateCartItemQuantity,
      remove: removeFromCart,
      clear: clearCart
    },
    ai: {
      chat: aiChat,
      recommendations: aiRecommendations
    }
  },
  ops: {
    users: {
      list: getUsers,
      get: getUser,
      update: updateUser,
      activate: activateUser,
      deactivate: deactivateUser,
      delete: deleteUser,
      invite: inviteUser
    },
    venues: {
      list: getVenues,
      get: getVenue,
      create: createVenue,
      update: updateVenue
    },
    shifts: {
      list: getShifts,
      get: getShift,
      create: createShift,
      update: updateShift,
      delete: deleteShift,
      start: startShift,
      end: endShift
    },
    tasks: {
      list: getTasks,
      create: createTask,
      batch: createTasksBatch,
      update: updateTask,
      status: updateTaskStatus,
      photo: uploadTaskPhoto,
      delete: deleteTask
    },
    checklists: {
      create: createChecklist,
      list: getChecklists,
      get: getChecklist,
      addTask: addChecklistTask,
      markDone: markChecklistTaskDone,
      skip: skipChecklistTask
    },
    handovers: {
      create: createHandover,
      outgoing: getOutgoingHandover,
      incoming: getIncomingHandover,
      acknowledge: acknowledgeHandover
    }
  }
};

export default api;
