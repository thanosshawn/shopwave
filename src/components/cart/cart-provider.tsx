
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useCallback, useEffect } from 'react';
import type { Product, CartItem, CartContextType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  getUserCart,
  addOrUpdateCartItem,
  removeCartItem,
  clearUserCart,
  mergeLocalCartToFirestore,
} from '@/lib/firebase/services';
import { Loader2 } from 'lucide-react';

const LOCAL_CART_STORAGE_KEY = 'shopwave_local_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const loadCart = useCallback(async () => {
    setLoadingCart(true);
    try {
      if (user) {
        const firestoreCart = await getUserCart(user.uid);
        const localCart = localStorage.getItem(LOCAL_CART_STORAGE_KEY);
        if (localCart) {
          const localItems: CartItem[] = JSON.parse(localCart);
          if (localItems.length > 0) {
            await mergeLocalCartToFirestore(user.uid, localItems);
            localStorage.removeItem(LOCAL_CART_STORAGE_KEY); // Clear local after merge
            // Re-fetch cart after merge
            const mergedCart = await getUserCart(user.uid);
            setCartItems(mergedCart);
            toast({ title: "Cart Synced", description: "Your local cart has been merged with your account." });
          } else {
            setCartItems(firestoreCart);
          }
        } else {
          setCartItems(firestoreCart);
        }
      } else {
        const localCart = localStorage.getItem(LOCAL_CART_STORAGE_KEY);
        setCartItems(localCart ? JSON.parse(localCart) : []);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      toast({ title: "Cart Error", description: "Could not load your cart.", variant: "destructive" });
      setCartItems([]); // Fallback to empty cart on error
    } finally {
      setLoadingCart(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!authLoading) { // Only load cart once auth status is determined
      loadCart();
    }
  }, [user, authLoading, loadCart]);

  // Persist to localStorage for guest users
  useEffect(() => {
    if (!user && !loadingCart) { // only save if not logged in and cart isn't currently loading
      localStorage.setItem(LOCAL_CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, user, loadingCart]);

  const addToCart = useCallback(async (product: Product, quantity: number = 1) => {
    const newItem: CartItem = { ...product, id: product.id, quantity }; // Ensure id is product.id
    
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, newItem];
    });

    if (user) {
      try {
        const existingItem = cartItems.find((item) => item.id === product.id);
        const finalQuantity = existingItem ? existingItem.quantity + quantity : quantity;
        await addOrUpdateCartItem(user.uid, { ...newItem, quantity: finalQuantity });
      } catch (error) {
        console.error("Error adding to Firestore cart:", error);
        // Optionally revert local state or show specific error
      }
    }
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  }, [user, toast, cartItems]); // Added cartItems to deps for existingItem check

  const removeFromCart = useCallback(async (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    if (user) {
      try {
        await removeCartItem(user.uid, productId);
      } catch (error) {
        console.error("Error removing from Firestore cart:", error);
      }
    }
    toast({
      title: "Removed from cart",
      description: `Item has been removed from your cart.`,
    });
  }, [user, toast]);

  const updateQuantity = useCallback(async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
    if (user) {
      try {
        const itemToUpdate = cartItems.find(item => item.id === productId);
        if (itemToUpdate) {
          await addOrUpdateCartItem(user.uid, { ...itemToUpdate, quantity: newQuantity });
        }
      } catch (error) {
        console.error("Error updating Firestore cart quantity:", error);
      }
    }
  }, [user, removeFromCart, cartItems]); // Added cartItems

  const clearCart = useCallback(async () => {
    setCartItems([]);
    if (user) {
      try {
        await clearUserCart(user.uid);
      } catch (error) {
        console.error("Error clearing Firestore cart:", error);
      }
    } else {
      localStorage.removeItem(LOCAL_CART_STORAGE_KEY);
    }
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  }, [user, toast]);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  if (authLoading || loadingCart) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading Cart...</p>
      </div>
    );
  }
  

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        loadingCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
