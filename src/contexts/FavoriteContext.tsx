'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface FavoriteContextType {
  favorites: Set<string>;
  isLoading: boolean;
  toggleFavorite: (sku: string) => Promise<void>;
  isFavorite: (sku: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

const GUEST_FAVORITES_KEY = 'karven_guest_favorites';

export function FavoriteProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const isGuest = status === 'unauthenticated' || (status !== 'loading' && !session);

  // Load guest favorites from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !loaded) {
      try {
        const saved = localStorage.getItem(GUEST_FAVORITES_KEY);
        if (saved) {
          const arr = JSON.parse(saved);
          if (Array.isArray(arr)) setFavorites(new Set(arr));
        }
      } catch { /* ignore */ }
      setLoaded(true);
    }
  }, [loaded]);

  // Load from backend when authenticated; merge guest favorites
  useEffect(() => {
    if (!loaded) return;
    if (session?.user?.email) {
      loadAndMergeFavorites();
    }
    // When logged out, keep whatever is in state (guest favorites from localStorage)
  }, [session?.user?.email, loaded]);

  const loadAndMergeFavorites = async () => {
    if (!session?.user?.email) return;

    try {
      const userId = (session.user as any)?.id || session.user.email;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_user_favorites/${userId}/`
      );

      if (response.ok) {
        const data = await response.json();
        const backendSkus = new Set<string>((data.favorites || []).map((fav: any) => fav.product_sku));

        // Merge guest favorites into backend
        const guestOnly: string[] = [];
        favorites.forEach(sku => {
          if (!backendSkus.has(sku)) guestOnly.push(sku);
        });

        // Push guest favorites to backend
        for (const sku of guestOnly) {
          try {
            await fetch(
              `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/toggle_favorite/${userId}/`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_sku: sku }),
              }
            );
            backendSkus.add(sku);
          } catch { /* ignore */ }
        }

        setFavorites(backendSkus);
        // Clear guest storage after merge
        if (typeof window !== 'undefined') {
          localStorage.removeItem(GUEST_FAVORITES_KEY);
        }
      }
    } catch (error) {
      console.error('[FAVORITES] Error loading:', error);
    }
  };

  // Save guest favorites to localStorage
  useEffect(() => {
    if (!loaded || !isGuest) return;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
      } catch { /* quota */ }
    }
  }, [favorites, isGuest, loaded]);

  const toggleFavorite = async (sku: string) => {
    // Optimistic update
    const newFavorites = new Set(favorites);
    if (newFavorites.has(sku)) {
      newFavorites.delete(sku);
    } else {
      newFavorites.add(sku);
    }
    setFavorites(newFavorites);

    // Guest: only localStorage (useEffect handles it)
    if (!session?.user?.email) {
      return;
    }

    // Authenticated: also sync with backend
    try {
      const userId = (session.user as any)?.id || session.user.email;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/toggle_favorite/${userId}/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_sku: sku }),
        }
      );

      if (!response.ok) {
        setFavorites(favorites);
      }
    } catch (error) {
      console.error('[FAVORITES] Error toggling:', error);
      setFavorites(favorites);
    }
  };

  const isFavorite = (sku: string): boolean => {
    return favorites.has(sku);
  };

  const refreshFavorites = async () => {
    if (session?.user?.email) await loadAndMergeFavorites();
  };

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        isLoading,
        toggleFavorite,
        isFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
}
