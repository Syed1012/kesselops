// API Service for KesselOps Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

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

