'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import {
  User, api, getStoredUser, getToken, saveSession, clearSession, MenuItem,
} from '@/lib/api';

// ---------------------------------------------------------------- auth

type AuthValue = {
  user: User | null;
  loading: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <Providers>');
  return ctx;
}

// ---------------------------------------------------------------- cart

export type CartLine = { item: MenuItem; quantity: number };

type CartValue = {
  restaurantId: number | null;
  restaurantName: string | null;
  lines: CartLine[];
  count: number;
  subtotal: number;
  /** @returns false when the cart already holds another restaurant's items. */
  add: (restaurantId: number, restaurantName: string, item: MenuItem) => boolean;
  setQuantity: (itemId: number, quantity: number) => void;
  remove: (itemId: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <Providers>');
  return ctx;
}

const CART_KEY = 'yb_cart';

export function Providers({ children }: { children: ReactNode }) {
  // ---- auth state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trust the cookie for an instant first paint, then confirm with the server
    // so a revoked or expired token cannot linger as a fake session.
    const cached = getStoredUser();
    if (cached) setUser(cached);

    if (!getToken()) {
      setLoading(false);
      return;
    }

    api.me()
      .then(fresh => setUser(fresh))
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = (token: string, u: User) => {
    saveSession(token, u);
    setUser(u);
  };

  const signOut = () => {
    clearSession();
    setUser(null);
    if (typeof window !== 'undefined') localStorage.removeItem(CART_KEY);
    setLines([]);
    setRestaurantId(null);
    setRestaurantName(null);
  };

  // ---- cart state (persisted so a page refresh doesn't lose the order)
  const [lines, setLines] = useState<CartLine[]>([]);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      setLines(saved.lines ?? []);
      setRestaurantId(saved.restaurantId ?? null);
      setRestaurantName(saved.restaurantName ?? null);
    } catch {
      localStorage.removeItem(CART_KEY);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify({ lines, restaurantId, restaurantName }));
    } catch {
      // Storage full or blocked — the cart still works for this page view.
    }
  }, [lines, restaurantId, restaurantName]);

  const add: CartValue['add'] = (rid, rname, item) => {
    // The backend refuses a mixed-restaurant order, so block it here with a
    // clear signal rather than letting checkout fail later.
    if (restaurantId !== null && restaurantId !== rid && lines.length > 0) return false;

    setRestaurantId(rid);
    setRestaurantName(rname);
    setLines(prev => {
      const found = prev.find(l => l.item.id === item.id);
      return found
        ? prev.map(l => (l.item.id === item.id ? { ...l, quantity: l.quantity + 1 } : l))
        : [...prev, { item, quantity: 1 }];
    });
    return true;
  };

  const setQuantity: CartValue['setQuantity'] = (itemId, quantity) => {
    if (quantity < 1) {
      remove(itemId);
      return;
    }
    setLines(prev => prev.map(l => (l.item.id === itemId ? { ...l, quantity } : l)));
  };

  const remove: CartValue['remove'] = itemId => {
    setLines(prev => {
      const next = prev.filter(l => l.item.id !== itemId);
      if (next.length === 0) {
        setRestaurantId(null);
        setRestaurantName(null);
      }
      return next;
    });
  };

  const clear = () => {
    setLines([]);
    setRestaurantId(null);
    setRestaurantName(null);
  };

  const cart = useMemo<CartValue>(() => ({
    restaurantId,
    restaurantName,
    lines,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: lines.reduce((n, l) => n + Number(l.item.price) * l.quantity, 0),
    add, setQuantity, remove, clear,
  }), [lines, restaurantId, restaurantName]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      <CartContext.Provider value={cart}>{children}</CartContext.Provider>
    </AuthContext.Provider>
  );
}
