"use client";

import { useContext } from 'react';
import CartContext from '@/components/cart/cart-provider';
import type { CartContextType } from '@/lib/types';

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
