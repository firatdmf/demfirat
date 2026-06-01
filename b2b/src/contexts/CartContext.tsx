'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  useRef,
} from 'react';
import type { CartLine } from '@/types/product';
import { useAuth } from './AuthContext';
import {
  getCart as apiGetCart,
  addCartItem as apiAddCartItem,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart,
} from '@/lib/account';
import { getProducts } from '@/lib/api';

/*
 * Cart with two lifecycles:
 *  - Anonymous: in-memory only (cleared on reload). Same as before.
 *  - Signed in: hydrated from Django on mount + writes through to the
 *    backend on add/qty-change/remove. Refresh persists the cart;
 *    sign-out wipes the local mirror.
 *
 * Optimistic updates: local state changes first, server reconciles.
 * If the server call fails we roll back the line so the user sees
 * truthful state — no silent drift.
 */

type CartContextType = {
  items: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (line: Omit<CartLine, 'id' | 'serverId'>) => void;
  remove: (id: string) => void;
  setQty: (id: string, delta: number) => void;
  clear: () => Promise<void>;
  subtotal: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const lastUserIdRef = useRef<number | null>(null);

  // Hydrate / clear on auth changes
  useEffect(() => {
    const currentId = user?.id ?? null;
    if (lastUserIdRef.current === currentId) return;
    lastUserIdRef.current = currentId;

    if (!user) {
      // Signed out — drop the in-memory mirror.
      setItems([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [serverItems, products] = await Promise.all([
          apiGetCart(user.id),
          getProducts(),
        ]);
        if (cancelled) return;
        const lines: CartLine[] = [];
        for (const it of serverItems) {
          const product = products.find((p) => p.sku === it.product_sku);
          if (!product) continue;
          // variant_sku encodes "<colorId>-<sizeId>"; sizeId may
          // contain dashes (e.g. "39-42") so we split off the first
          // segment as colorId and rejoin the rest as sizeId.
          const [colorId, ...rest] = (it.variant_sku ?? '').split('-');
          const sizeId = rest.join('-');
          const color = product.colors?.find((c) => c.id === colorId);
          const size = product.sizes?.find((s) => s.id === sizeId);
          lines.push({
            id: `srv-${it.id}`,
            serverId: it.id,
            productId: product.id,
            productSku: product.sku,
            variantSku: it.variant_sku ?? '',
            name: product.name,
            category: product.category,
            variant: color?.label ?? { tr: '-', en: '-' },
            size: size?.label ?? '-',
            qty: Number(it.quantity) || 1,
            price: product.price,
            bg: color?.bg ?? product.bg,
          });
        }
        setItems(lines);
      } catch {
        // Leave the cart empty; user can re-add. Backend errors
        // shouldn't block the UI.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const add = useCallback(
    (line: Omit<CartLine, 'id' | 'serverId'>) => {
      // Merge with an existing line (same product+variant+size) the
      // way Django's add_to_cart does on the server.
      const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      let mergedExisting = false;
      setItems((prev) => {
        const idx = prev.findIndex(
          (it) =>
            it.productSku === line.productSku &&
            it.variantSku === line.variantSku &&
            it.size === line.size,
        );
        if (idx >= 0) {
          mergedExisting = true;
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + line.qty };
          return next;
        }
        return [...prev, { ...line, id: tempId, serverId: null }];
      });
      setIsOpen(true);

      if (!user) return;

      // Persist to Django. Even on merge we POST (Django merges by
      // SKU+variant on its side). Then reconcile the serverId.
      apiAddCartItem(user.id, {
        product_sku: line.productSku,
        variant_sku: line.variantSku,
        quantity: line.qty,
      })
        .then((srv) => {
          setItems((prev) =>
            prev.map((it) => {
              if (mergedExisting) {
                if (
                  it.productSku === line.productSku &&
                  it.variantSku === line.variantSku &&
                  it.size === line.size
                ) {
                  return {
                    ...it,
                    serverId: srv.id,
                    id: `srv-${srv.id}`,
                    qty: Number(srv.quantity) || it.qty,
                  };
                }
                return it;
              }
              if (it.id === tempId) {
                return {
                  ...it,
                  serverId: srv.id,
                  id: `srv-${srv.id}`,
                };
              }
              return it;
            }),
          );
        })
        .catch(() => {
          // Roll back the optimistic add.
          setItems((prev) => prev.filter((it) => it.id !== tempId));
        });
    },
    [user],
  );

  const remove = useCallback(
    (id: string) => {
      const target = items.find((it) => it.id === id);
      setItems((prev) => prev.filter((it) => it.id !== id));
      if (user && target?.serverId != null) {
        apiRemoveCartItem(user.id, target.serverId).catch(() => {
          // Re-insert on failure to stay truthful.
          setItems((prev) => [...prev, target]);
        });
      }
    },
    [items, user],
  );

  const setQty = useCallback(
    (id: string, delta: number) => {
      const target = items.find((it) => it.id === id);
      if (!target) return;
      const nextQty = Math.max(1, target.qty + delta);
      if (nextQty === target.qty) return;
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, qty: nextQty } : it)),
      );
      if (user && target.serverId != null) {
        apiUpdateCartItem(user.id, target.serverId, nextQty).catch(() => {
          // Roll back the optimistic qty change.
          setItems((prev) =>
            prev.map((it) => (it.id === id ? { ...it, qty: target.qty } : it)),
          );
        });
      }
    },
    [items, user],
  );

  const clear = useCallback(async () => {
    setItems([]);
    if (user) {
      try { await apiClearCart(user.id); } catch { /* best-effort */ }
    }
  }, [user]);

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((v) => !v),
        add,
        remove,
        setQty,
        clear,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
