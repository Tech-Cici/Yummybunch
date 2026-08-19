/**
 * The only place this app talks to the Spring backend.
 * Endpoint contracts are identical to the web app; the differences are storage
 * (SecureStore instead of cookies) and the base URL, which must be reachable
 * from the phone rather than from the Mac.
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'yb_token';

/**
 * Resolving the backend address is the single most common setup mistake, so it
 * is deliberate and explicit here:
 *
 *  1. EXPO_PUBLIC_API_URL wins if set (put it in .env).
 *  2. Otherwise, when running through Expo Go we reuse the host your Mac is
 *     already serving Metro on — that IP is by definition reachable from the
 *     phone, so it needs no manual configuration on the same Wi-Fi.
 *  3. Android emulator maps the host machine to 10.0.2.2, never localhost.
 */
function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost;

  const host = hostUri?.split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:8080`;
  }

  if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
  return 'http://localhost:8080';
}

export const API_URL = resolveApiUrl();

// ---------------------------------------------------------------- types
// Mirror the backend Dtos exactly.

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

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ---------------------------------------------------------------- token storage

/**
 * SecureStore is the Keychain / Android Keystore — the right home for a JWT.
 * It is unavailable on web, so fall back to memory there (Expo web only).
 */
let memoryToken: string | null = null;
const canUseSecureStore = Platform.OS !== 'web';

export async function saveToken(token: string) {
  memoryToken = token;
  if (canUseSecureStore) await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function loadToken(): Promise<string | null> {
  if (memoryToken) return memoryToken;
  if (!canUseSecureStore) return null;
  memoryToken = await SecureStore.getItemAsync(TOKEN_KEY);
  return memoryToken;
}

export async function clearToken() {
  memoryToken = null;
  if (canUseSecureStore) await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ---------------------------------------------------------------- request

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean; form?: FormData } = {}
): Promise<T> {
  const { method = 'GET', body, auth = false, form } = options;

  const headers: Record<string, string> = {};
  if (!form) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = await loadToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch {
    // On a phone this nearly always means the wrong host, not a dead server.
    throw new ApiError(
      0,
      `Cannot reach the server at ${API_URL}.\n\nCheck that the backend is running and that your phone is on the same Wi-Fi as your computer.`
    );
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

  if (!res.ok) throw new ApiError(res.status, payload?.message || `Request failed (${res.status})`);
  return payload as T;
}

/** Backend image paths are relative (/uploads/x.jpg); RN needs absolute. */
export const imageUrl = (path?: string | null) =>
  !path ? null : path.startsWith('http') ? path : `${API_URL}${path}`;

export const api = {
  // auth
  register: (body: {
    email: string; password: string; name: string; phone?: string; role: Role;
  }) => request<{ message: string; email: string }>('/api/auth/register', { method: 'POST', body }),

  verify: (body: { email: string; code: string }) =>
    request<AuthResponse>('/api/auth/verify', { method: 'POST', body }),

  resend: (email: string) =>
    request<{ message: string }>('/api/auth/resend', { method: 'POST', body: { email } }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body }),

  me: () => request<User>('/api/auth/me', { auth: true }),

  // public catalogue
  restaurants: (params: { q?: string; cuisine?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.cuisine) qs.set('cuisine', params.cuisine);
    const s = qs.toString();
    return request<Restaurant[]>(`/api/restaurants${s ? `?${s}` : ''}`);
  },
  restaurant: (id: number | string) => request<Restaurant>(`/api/restaurants/${id}`),
  publicMenu: (id: number | string) => request<MenuItem[]>(`/api/restaurants/${id}/menu`),
  cuisines: () => request<string[]>('/api/restaurants/cuisines'),

  // orders
  placeOrder: (body: {
    restaurantId: number; deliveryAddress: string; notes?: string;
    items: { menuItemId: number; quantity: number }[];
  }) => request<Order>('/api/orders', { method: 'POST', body, auth: true }),

  myOrders: () => request<Order[]>('/api/orders', { auth: true }),
  order: (id: number | string) => request<Order>(`/api/orders/${id}`, { auth: true }),
  cancelOrder: (id: number) =>
    request<Order>(`/api/orders/${id}/cancel`, { method: 'POST', auth: true }),
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

export const PROGRESSION: OrderStatus[] = [
  'PLACED', 'RECEIVED', 'PREPARING', 'READY', 'COMPLETED',
];

export const ACTIVE_STATUSES: OrderStatus[] = ['PLACED', 'RECEIVED', 'PREPARING', 'READY'];
