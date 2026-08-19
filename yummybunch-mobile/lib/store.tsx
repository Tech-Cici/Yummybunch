/**
 * Auth session and cart, shared across the whole app.
 * The cart is persisted to AsyncStorage so backgrounding the app never loses an
 * order in progress — on a phone that happens constantly.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback,
} from 'react';
import { api, clearToken, loadToken, MenuItem, saveToken, User } from './api';

// ---------------------------------------------------------------- auth

type AuthValue = {
  user: User | null;
  loading: boolean;
  /**
   * True once the visitor has explicitly chosen to look around without an
   * account. Without this flag the auth gate would bounce them straight back
   * to the welcome screen the moment they tapped "browse".
   */
  guestMode: boolean;
  continueAsGuest: () => Promise<void>;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AppProviders>');
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
  /** false when the cart already holds another restaurant's items */
  add: (restaurantId: number, restaurantName: string, item: MenuItem) => boolean;
  setQuantity: (itemId: number, quantity: number) => void;
  remove: (itemId: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <AppProviders>');
  return ctx;
}

const CART_KEY = 'yb_cart_v1';
const GUEST_KEY = 'yb_guest_mode';

export function AppProviders({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);

  const [lines, setLines] = useState<CartLine[]>([]);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [cartReady, setCartReady] = useState(false);

  // Restore the session on launch: a stored token is only trusted after the
  // server confirms it, so a revoked or expired token cannot linger.
  useEffect(() => {
    (async () => {
      try {
        setGuestMode((await AsyncStorage.getItem(GUEST_KEY)) === '1');
        const token = await loadToken();
        if (!token) return;
        setUser(await api.me());
      } catch {
        await clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Restore the cart.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CART_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          setLines(saved.lines ?? []);
          setRestaurantId(saved.restaurantId ?? null);
          setRestaurantName(saved.restaurantName ?? null);
        }
      } catch {
        await AsyncStorage.removeItem(CART_KEY);
      } finally {
        setCartReady(true);
      }
    })();
  }, []);

  // Persist the cart, but not before it has been restored, or the first render
  // would overwrite a saved cart with an empty one.
  useEffect(() => {
    if (!cartReady) return;
    AsyncStorage.setItem(
      CART_KEY,
      JSON.stringify({ lines, restaurantId, restaurantName })
    ).catch(() => {});
  }, [cartReady, lines, restaurantId, restaurantName]);

  const signIn = useCallback(async (token: string, u: User) => {
    await saveToken(token);
    setUser(u);
  }, []);

  const continueAsGuest = useCallback(async () => {
    setGuestMode(true);
    await AsyncStorage.setItem(GUEST_KEY, '1');
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setRestaurantId(null);
    setRestaurantName(null);
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    setUser(null);
    setGuestMode(false);
    await AsyncStorage.removeItem(GUEST_KEY);
    clear();
  }, [clear]);

  const remove = useCallback((itemId: number) => {
    setLines(prev => {
      const next = prev.filter(l => l.item.id !== itemId);
      if (next.length === 0) {
        setRestaurantId(null);
        setRestaurantName(null);
      }
      return next;
    });
  }, []);

  const add = useCallback<CartValue['add']>((rid, rname, item) => {
    // The backend rejects a mixed-restaurant order, so refuse here with a clear
    // signal rather than letting checkout fail later.
    let allowed = true;
    setLines(prev => {
      if (restaurantId !== null && restaurantId !== rid && prev.length > 0) {
        allowed = false;
        return prev;
      }
      const found = prev.find(l => l.item.id === item.id);
      return found
        ? prev.map(l => (l.item.id === item.id ? { ...l, quantity: l.quantity + 1 } : l))
        : [...prev, { item, quantity: 1 }];
    });
    if (allowed) {
      setRestaurantId(rid);
      setRestaurantName(rname);
    }
    return allowed;
  }, [restaurantId]);

  const setQuantity = useCallback<CartValue['setQuantity']>((itemId, quantity) => {
    if (quantity < 1) {
      remove(itemId);
      return;
    }
    setLines(prev => prev.map(l => (l.item.id === itemId ? { ...l, quantity } : l)));
  }, [remove]);

  const cart = useMemo<CartValue>(() => ({
    restaurantId,
    restaurantName,
    lines,
    count: lines.reduce((n, l) => n + l.quantity, 0),
    subtotal: lines.reduce((n, l) => n + Number(l.item.price) * l.quantity, 0),
    add, setQuantity, remove, clear,
  }), [lines, restaurantId, restaurantName, add, setQuantity, remove, clear]);

  const auth = useMemo<AuthValue>(
    () => ({ user, loading, guestMode, continueAsGuest, signIn, signOut }),
    [user, loading, guestMode, continueAsGuest, signIn, signOut]
  );

  return (
    <AuthContext.Provider value={auth}>
      <CartContext.Provider value={cart}>{children}</CartContext.Provider>
    </AuthContext.Provider>
  );
}
