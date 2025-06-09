"use client";

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useEffect, useState } from 'react';

export function CartIcon() {
  const { getCartItemCount } = useCart();
  const [itemCount, setItemCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      setItemCount(getCartItemCount());
    }
  }, [getCartItemCount, isClient, useCart().cartItems]); // Depend on cartItems to re-render

  return (
    <Button variant="ghost" size="icon" asChild>
      <Link href="/cart" aria-label={`Shopping cart with ${itemCount} items`}>
        <ShoppingCart className="h-5 w-5" />
        {isClient && itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {itemCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
