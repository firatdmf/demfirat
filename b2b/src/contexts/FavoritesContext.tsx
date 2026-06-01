'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getFavorites, toggleFavorite as apiToggle } from '@/lib/account';

/*
 * Maintains the set of favorite product SKUs for the signed-in user.
 * On sign-in, hydrates from Django; toggle() optimistically updates
 * local state then writes through. Anonymous users get a no-op.
 */

type FavoritesContextType = {
  skus: Set<string>;
  isFav: (sku: string) => boolean;
  toggle: (sku: string) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [skus, setSkus] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setSkus(new Set());
      return;
    }
    getFavorites(user.id)
      .then((favs) => setSkus(new Set(favs.map((f) => f.product_sku))))
      .catch(() => setSkus(new Set()));
  }, [user]);

  const isFav = useCallback((sku: string) => skus.has(sku), [skus]);

  const toggle = useCallback(
    async (sku: string) => {
      if (!user) return;
      // Optimistic update
      setSkus((prev) => {
        const next = new Set(prev);
        if (next.has(sku)) next.delete(sku);
        else next.add(sku);
        return next;
      });
      try {
        const result = await apiToggle(user.id, sku);
        // Reconcile in case server says otherwise
        setSkus((prev) => {
          const next = new Set(prev);
          if (result) next.add(sku);
          else next.delete(sku);
          return next;
        });
      } catch {
        // Roll back on failure
        setSkus((prev) => {
          const next = new Set(prev);
          if (next.has(sku)) next.delete(sku);
          else next.add(sku);
          return next;
        });
      }
    },
    [user],
  );

  return (
    <FavoritesContext.Provider value={{ skus, isFav, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
