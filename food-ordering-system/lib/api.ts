/**
 * Single place where the frontend talks to the Spring backend.
 * Every call goes through `request`, so auth headers and error shapes are
 * handled once instead of being re-invented in each page.
 */
import Cookies from 'js-cookie';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const TOKEN_COOKIE = 'yb_token';
export const USER_COOKIE = 'yb_user';

export type Role = 'CUSTOMER' | 'RESTAURANT' | 'ADMIN';

export type User = {
  id: number;
  email: string;
  name: string;
  phone?: string | null;
  role: Role;
  emailVerified: boolean;
};

export type Restaurant = {
  id: number;
  name: string;
  description?: string | null;
  cuisine?: string | null;
  address?: string | null;
  phone?: string | null;
  coverImageUrl?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
  acceptingOrders: boolean;
  menuItemCount: number;
};

export type MenuItem = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  category?: string | null;
  imageUrl?: string | null;
  available: boolean;
};

export type OrderStatus =
  | 'PLACED' | 'RECEIVED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';

export type Order = {
  id: number;
  status: OrderStatus;
  total: number;
  deliveryAddress: string;
  notes?: string | null;
  rejectionReason?: string | null;
  placedAt: string;
  updatedAt: string;
  restaurantId: number;
  restaurantName: string;
  restaurantPhone?: string | null;
  customerName: string;
  customerPhone?: string | null;
  customerEmail: string;
  items: { itemName: string; unitPrice: number; quantity: number; lineTotal: number }[];
  timeline: { status: OrderStatus; note?: string | null; at: string }[];
  nextStatuses: OrderStatus[];
};

export type AuthResponse = { token: string; user: User };

/** Thrown for any non-2xx response, carrying the backend's own message. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const getToken = () => Cookies.get(TOKEN_COOKIE);

export const getStoredUser = (): User | null => {
  const raw = Cookies.get(USER_COOKIE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const saveSession = (token: string, user: User) => {
  Cookies.set(TOKEN_COOKIE, token, { expires: 7, path: '/', sameSite: 'lax' });
  Cookies.set(USER_COOKIE, JSON.stringify(user), { expires: 7, path: '/', sameSite: 'lax' });
};

export const clearSession = () => {
  Cookies.remove(TOKEN_COOKIE, { path: '/' });
  Cookies.remove(USER_COOKIE, { path: '/' });
};

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean; form?: FormData } = {}
): Promise<T> {
  const { method = 'GET', body, auth = false, form } = options;

  const headers: Record<string, string> = {};
  if (!form) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: form ? form : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Distinguish "server unreachable" from "server said no" — the most common
    // confusion when the backend simply isn't running.
    throw new ApiError(0, `Cannot reach the server at ${API_URL}. Is the backend running?`);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let payload: any = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, payload?.message || `Request failed (${res.status})`);
  }
  return payload as T;
}

/** Turns a backend path like /uploads/x.jpg into a full URL. */
export const imageUrl = (path?: string | null) =>
  !path ? null : path.startsWith('http') ? path : `${API_URL}${path}`;

export const api = {
  // ---- auth
  register: (body: {
    email: string; password: string; name: string; phone?: string; role: Role;
    restaurantName?: string; cuisine?: string; address?: string;
  }) => request<{ message: string; email: string }>('/api/auth/register', { method: 'POST', body }),

  verify: (body: { email: string; code: string }) =>
    request<AuthResponse>('/api/auth/verify', { method: 'POST', body }),

  resend: (email: string) =>
    request<{ message: string }>('/api/auth/resend', { method: 'POST', body: { email } }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body }),

  me: () => request<User>('/api/auth/me', { auth: true }),

  // ---- public catalogue
  restaurants: (params: { q?: string; cuisine?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.cuisine) qs.set('cuisine', params.cuisine);
    const suffix = qs.toString() ? `?${qs}` : '';
    return request<Restaurant[]>(`/api/restaurants${suffix}`);
  },
  restaurant: (id: number | string) => request<Restaurant>(`/api/restaurants/${id}`),
  publicMenu: (id: number | string) => request<MenuItem[]>(`/api/restaurants/${id}/menu`),
  cuisines: () => request<string[]>('/api/restaurants/cuisines'),

  // ---- customer orders
  placeOrder: (body: {
    restaurantId: number; deliveryAddress: string; notes?: string;
    items: { menuItemId: number; quantity: number }[];
  }) => request<Order>('/api/orders', { method: 'POST', body, auth: true }),

  myOrders: () => request<Order[]>('/api/orders', { auth: true }),
  order: (id: number | string) => request<Order>(`/api/orders/${id}`, { auth: true }),
  cancelOrder: (id: number) => request<Order>(`/api/orders/${id}/cancel`, { method: 'POST', auth: true }),

  // ---- restaurant owner
  myRestaurant: () => request<Restaurant>('/api/my-restaurant', { auth: true }),
  updateMyRestaurant: (body: Partial<Restaurant>) =>
    request<Restaurant>('/api/my-restaurant', { method: 'PUT', body, auth: true }),
  uploadCover: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<Restaurant>('/api/my-restaurant/cover', { method: 'POST', form, auth: true });
  },

  ownerMenu: () => request<MenuItem[]>('/api/my-restaurant/menu', { auth: true }),
  addMenuItem: (body: { name: string; description?: string; price: number; category?: string; available?: boolean }) =>
    request<MenuItem>('/api/my-restaurant/menu', { method: 'POST', body, auth: true }),
  updateMenuItem: (id: number, body: Partial<{ name: string; description: string; price: number; category: string; available: boolean }>) =>
    request<MenuItem>(`/api/my-restaurant/menu/${id}`, { method: 'PUT', body, auth: true }),
  deleteMenuItem: (id: number) =>
    request<{ message: string }>(`/api/my-restaurant/menu/${id}`, { method: 'DELETE', auth: true }),
  uploadItemImage: (id: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<MenuItem>(`/api/my-restaurant/menu/${id}/image`, { method: 'POST', form, auth: true });
  },

  ownerOrders: () => request<Order[]>('/api/my-restaurant/orders', { auth: true }),
  advanceOrder: (id: number, status: OrderStatus, note?: string) =>
    request<Order>(`/api/my-restaurant/orders/${id}/status`, {
      method: 'POST', body: { status, note }, auth: true,
    }),
};

/** Money formatting used everywhere, so totals never render as "36" or "11.5". */
export const money = (n: number | string | null | undefined) => {
  const value = typeof n === 'string' ? parseFloat(n) : n ?? 0;
  return `$${(Number.isFinite(value) ? value : 0).toFixed(2)}`;
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PLACED: 'Waiting for restaurant',
  RECEIVED: 'Order received',
  PREPARING: 'Being prepared',
  READY: 'Ready',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REJECTED: 'Declined',
};

/** The happy path, for rendering a progress tracker. */
export const PROGRESSION: OrderStatus[] = ['PLACED', 'RECEIVED', 'PREPARING', 'READY', 'COMPLETED'];
