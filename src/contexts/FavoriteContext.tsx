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

export function FavoriteProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Load favorites on mount and when session changes
  useEffect(() => {
    loadFavorites();
  }, [session?.user?.email]);

  const loadFavorites = async () => {
    if (!session?.user?.email) {
      setFavorites(new Set());
      return;
    }

    try {
      const userId = (session.user as any)?.id || session.user.email;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_user_favorites/${userId}/`
      );

      if (response.ok) {
        const data = await response.json();
        const skus = new Set<string>(data.favorites.map((fav: any) => fav.product_sku));
        setFavorites(skus);
      }
    } catch (error) {
      console.error('[FAVORITES] Error loading:', error);
    }
  };

  const toggleFavorite = async (sku: string) => {
    if (!session?.user?.email) {
      return;
    }

    // Optimistic update
    const newFavorites = new Set(favorites);
    if (newFavorites.has(sku)) {
      newFavorites.delete(sku);
    } else {
      newFavorites.add(sku);
    }
    setFavorites(newFavorites);

    // API call
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
        // Revert on error
        setFavorites(favorites);
      }
    } catch (error) {
      console.error('[FAVORITES] Error toggling:', error);
      // Revert on error
      setFavorites(favorites);
    }
  };

  const isFavorite = (sku: string): boolean => {
    return favorites.has(sku);
  };

  const refreshFavorites = async () => {
    await loadFavorites();
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
