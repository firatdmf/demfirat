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
  is_sample?: boolean;
  custom_attributes?: {
    mountingType?: string;
    pleatType?: string;
    pleatDensity?: string;
    width?: string;
    height?: string;
    wingType?: string;
    [key: string]: any;
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
  const [authenticatedCartCount, setAuthenticatedCartCount] = useState<number>(0);
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  const [hasMerged, setHasMerged] = useState(false);

  // Derive isGuest and cartCount
  const isGuest = status === 'unauthenticated' || (status !== 'loading' && !session);
  const cartCount = isGuest ? guestCart.length : authenticatedCartCount;

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
    if (typeof window !== 'undefined') {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
    }
  }, [guestCart]);

  // Update authenticated cart count
  useEffect(() => {
    if (!isGuest && session?.user?.email) {
      loadCartCount();
    }
  }, [session?.user?.email, isGuest]);

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
      if (!isGuest) {
        loadCartCount();
      }
    };
    const handleCartCleared = () => {
      setAuthenticatedCartCount(0);
      setGuestCart([]);
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
  }, [isGuest, guestCart]);

  const loadCartCount = async () => {
    if (!session?.user?.email) return;

    try {
      const userId = (session.user as any)?.id || session.user.email;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/authentication/api/get_cart/${userId}/`
      );

      if (response.ok) {
        const data = await response.json();
        const items = data.cart_items || [];
        const validItems = items.filter((i: any) => i && i.id);
        setAuthenticatedCartCount(validItems.length);
      }
    } catch (error) {
      console.error('[CART] Error loading cart count:', error);
    }
  };

  const refreshCart = async () => {
    if (!isGuest) {
      await loadCartCount();
    }
  };

  const addToCartCount = (quantity: number) => {
    if (!isGuest) {
      setAuthenticatedCartCount(prev => prev + 1);
    }
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
        i => {
          const isSameSku = i.product_sku?.toLowerCase().trim() === item.product_sku?.toLowerCase().trim();
          const isSameVariant = (i.variant_sku?.toLowerCase().trim() || null) === (item.variant_sku?.toLowerCase().trim() || null);
          const isSameSample = (!!i.is_sample === !!item.is_sample);
          const isSameCustomType = (!!i.is_custom_curtain === !!item.is_custom_curtain);

          if (!isSameSku || !isSameVariant || !isSameSample || !isSameCustomType) {
            return false;
          }

          // If it is a custom curtain, checking custom attributes equality
          if (item.is_custom_curtain) {
            // Function to sort object keys for consistent stringify
            const sortObj = (obj: any) => {
              if (typeof obj !== 'object' || obj === null) return obj;
              return Object.keys(obj).sort().reduce((acc: any, key) => {
                acc[key] = obj[key];
                return acc;
              }, {});
            };

            const attr1 = JSON.stringify(sortObj(i.custom_attributes || {}));
            const attr2 = JSON.stringify(sortObj(item.custom_attributes || {}));
            return attr1 === attr2;
          }

          return true;
        }
      );

      if (existingIndex >= 0) {
        // Update quantity (with deep copy to prevent mutation issues)
        const updated = [...prev];
        const existingItem = updated[existingIndex];
        const newTotalQty = (parseFloat(existingItem.quantity) + parseFloat(item.quantity)).toString();

        updated[existingIndex] = {
          ...existingItem,
          quantity: newTotalQty
        };
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
              is_sample: item.is_sample || false,
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
