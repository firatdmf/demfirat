'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// Guest cart item interface
interface GuestCartItem {
  id: string; // Unique ID for guest cart (timestamp-based)
  product_sku: string;
  variant_sku: string | null;
  quantity: string;
  product_category?: string;
  variant_attributes?: { [key: string]: string };
  is_custom_curtain?: boolean;
  custom_attributes?: {
    mountingType?: string;
    pleatType?: string;
    pleatDensity?: string;
    width?: string;
    height?: string;
    wingType?: string;
  };
  custom_price?: string | number;
  product?: {
    title: string;
    price: string | number | null;
    primary_image: string;
    category?: string;
  };
}

interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
  addToCartCount: (quantity: number) => void;
  // Guest cart methods
  guestCart: GuestCartItem[];
  addToGuestCart: (item: Omit<GuestCartItem, 'id'>) => void;
  removeFromGuestCart: (itemId: string) => void;
  updateGuestCartQuantity: (itemId: string, quantity: string) => void;
  clearGuestCart: () => void;
  mergeGuestCartToUser: () => Promise<void>;
  isGuest: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'karven_guest_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [cartCount, setCartCount] = useState<number>(0);
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  const [hasMerged, setHasMerged] = useState(false);

  const isGuest = status === 'unauthenticated';

  // Load guest cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem(GUEST_CART_KEY);
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          setGuestCart(parsed);
        } catch (e) {
          console.error('Error parsing guest cart:', e);
          localStorage.removeItem(GUEST_CART_KEY);
        }
      }
    }
  }, []);

  // Save guest cart to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && guestCart.length > 0) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
    }
  }, [guestCart]);

  // Update cart count based on auth status
  useEffect(() => {
    if (isGuest) {
      // For guests, count from localStorage
      setCartCount(guestCart.length);
    } else if (session?.user?.email) {
      // For authenticated users, load from API
      loadCartCount();
    }
  }, [session?.user?.email, isGuest, guestCart.length]);

  // Merge guest cart when user logs in
  useEffect(() => {
    if (session?.user?.email && guestCart.length > 0 && !hasMerged) {
      mergeGuestCartToUser();
      setHasMerged(true);
    }
  }, [session?.user?.email, guestCart.length, hasMerged]);

  // Listen cart events to update badge without full reload
  useEffect(() => {
    const handleCartUpdated = () => {
      if (isGuest) {
        setCartCount(guestCart.length);
      } else {
        loadCartCount();
      }
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
  }, [isGuest, guestCart.length]);

  const loadCartCount = async () => {
    if (!session?.user?.email) {
      return;
    }

    try {
      const userId = (session.user as any)?.id || session.user.email;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_cart/${userId}/`
      );

      if (response.ok) {
        const data = await response.json();
        const count = data.cart_items?.length || 0;
        setCartCount(count);
      }
    } catch (error) {
      console.error('[CART] Error loading cart count:', error);
    }
  };

  const refreshCart = async () => {
    if (isGuest) {
      setCartCount(guestCart.length);
    } else {
      await loadCartCount();
    }
  };

  const addToCartCount = (quantity: number) => {
    setCartCount(prev => prev + 1);
  };

  // Guest cart methods
  const addToGuestCart = useCallback((item: Omit<GuestCartItem, 'id'>) => {
    const newItem: GuestCartItem = {
      ...item,
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    setGuestCart(prev => {
      // Check if item already exists (same SKU and variant)
      const existingIndex = prev.findIndex(
        i => i.product_sku === item.product_sku && i.variant_sku === item.variant_sku
      );

      if (existingIndex >= 0) {
        // Update quantity
        const updated = [...prev];
        const existingQty = parseFloat(updated[existingIndex].quantity);
        const newQty = parseFloat(item.quantity);
        updated[existingIndex].quantity = (existingQty + newQty).toString();
        return updated;
      }

      return [...prev, newItem];
    });

    // Dispatch event for header update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }, []);

  const removeFromGuestCart = useCallback((itemId: string) => {
    setGuestCart(prev => {
      const updated = prev.filter(item => item.id !== itemId);
      if (updated.length === 0) {
        localStorage.removeItem(GUEST_CART_KEY);
      }
      return updated;
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }, []);

  const updateGuestCartQuantity = useCallback((itemId: string, quantity: string) => {
    setGuestCart(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearGuestCart = useCallback(() => {
    setGuestCart([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GUEST_CART_KEY);
      window.dispatchEvent(new CustomEvent('cartCleared'));
    }
  }, []);

  const mergeGuestCartToUser = useCallback(async () => {
    if (!session?.user?.email || guestCart.length === 0) return;

    try {
      const userId = (session.user as any)?.id || session.user.email;

      // Add each guest cart item to user's cart
      for (const item of guestCart) {
        await fetch(
          `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/add_to_cart/${userId}/`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_sku: item.product_sku,
              variant_sku: item.variant_sku,
              quantity: item.quantity,
              is_custom_curtain: item.is_custom_curtain || false,
              custom_attributes: item.custom_attributes || {},
              custom_price: item.custom_price || null,
            }),
          }
        );
      }

      // Clear guest cart after merge
      clearGuestCart();

      // Refresh cart count
      await loadCartCount();

      console.log('[CART] Guest cart merged successfully');
    } catch (error) {
      console.error('[CART] Error merging guest cart:', error);
    }
  }, [session?.user?.email, guestCart, clearGuestCart]);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        refreshCart,
        addToCartCount,
        guestCart,
        addToGuestCart,
        removeFromGuestCart,
        updateGuestCartQuantity,
        clearGuestCart,
        mergeGuestCartToUser,
        isGuest,
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
