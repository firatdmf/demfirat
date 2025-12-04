'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
  addToCartCount: (quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState<number>(0);

  // Load cart count on mount and when session changes
  useEffect(() => {
    loadCartCount();
  }, [session?.user?.email]);

  // Listen cart events to update badge without full reload
  useEffect(() => {
    const handleCartUpdated = () => {
      loadCartCount();
    };
    const handleCartCleared = () => {
      setCartCount(0);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('cartUpdated', handleCartUpdated as EventListener);
      window.addEventListener('cartCleared', handleCartCleared as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('cartUpdated', handleCartUpdated as EventListener);
        window.removeEventListener('cartCleared', handleCartCleared as EventListener);
      }
    };
  }, []);

  const loadCartCount = async () => {
    if (!session?.user?.email) {
      setCartCount(0);
      return;
    }

    try {
      const userId = (session.user as any)?.id || session.user.email;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_cart/${userId}/`
      );

      if (response.ok) {
        const data = await response.json();
        // Count total unique items in cart
        const count = data.cart_items?.length || 0;
        setCartCount(count);
      }
    } catch (error) {
      console.error('[CART] Error loading cart count:', error);
    }
  };

  const refreshCart = async () => {
    await loadCartCount();
  };

  const addToCartCount = (quantity: number) => {
    // Optimistically update count when adding to cart
    setCartCount(prev => prev + 1); // Add 1 for each unique item
  };

  return (
    <CartContext.Provider
      value={{
        cartCount,
        refreshCart,
        addToCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
