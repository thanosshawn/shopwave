
"use client";

import { useState } from 'react';
import Image from 'next/image';
import type { PlainProduct } from '@/lib/utils'; // Updated to PlainProduct
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types'; // Keep Product for addToCart if its signature expects original Product

interface ProductDetailClientInteractionsProps {
  product: PlainProduct; // Changed to PlainProduct
  productImages: string[];
}

export default function ProductDetailClientInteractions({ product, productImages }: ProductDetailClientInteractionsProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>(product.imageUrl);

  const handleAddToCart = async () => {
    try {
      // useCart's addToCart might expect the original Product type with Timestamps if it interacts with Firestore directly.
      // For now, we cast. If addToCart in useCart also needs plain objects, that needs adjustment too.
      // However, addToCart in CartProvider seems to re-construct CartItem which doesn't have timestamps.
      await addToCart(product as unknown as Product, quantity);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast({
        title: "Error",
        description: "Could not add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  return (
    <Card className="overflow-hidden shadow-xl">
      <CardContent className="p-0 md:p-0">
        <div className="grid md:grid-cols-2 gap-0 md:gap-8">
          {/* Image Gallery Section */}
          <div className="p-4 md:p-6">
            <div className="aspect-square relative w-full rounded-lg overflow-hidden border mb-4">
              {selectedImage && (
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                  priority // Prioritize loading for LCP
                  data-ai-hint={`${product.category} product detail`}
                />
              )}
            </div>
            {productImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {productImages.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`flex-none w-20 h-20 relative rounded-md overflow-hidden border-2 transition-all
                      ${selectedImage === imgUrl ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-muted-foreground'}`}
                  >
                    <Image
                      src={imgUrl}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      data-ai-hint="product thumbnail"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="p-6 md:p-8 flex flex-col">
            <h1 className="text-3xl md:text-4xl font-headline font-bold mb-3">{product.name}</h1>
            <p className="text-sm text-muted-foreground mb-3">Category: {product.category}</p>
            <p className="text-3xl font-semibold text-primary mb-6">${product.price.toFixed(2)}</p>
            
            <Separator className="my-6" />

            <p className="text-foreground leading-relaxed mb-6">{product.description}</p>

            <div className="mt-auto"> {/* Pushes controls to the bottom */}
              <div className="flex items-center space-x-3 mb-6">
                <Label htmlFor="quantity" className="text-sm font-medium">Quantity:</Label>
                <div className="flex items-center border rounded-md">
                  <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} aria-label="Decrease quantity">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    readOnly
                    className="w-16 h-10 text-center border-0 focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    aria-label="Current quantity"
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(1)} aria-label="Increase quantity">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={product.stock !== undefined && product.stock <= 0}>
                <ShoppingCart className="mr-2 h-5 w-5" /> 
                {product.stock !== undefined && product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              {product.stock !== undefined && (
                <p className={`text-sm mt-3 text-center ${product.stock > 0 ? 'text-muted-foreground' : 'text-destructive'}`}>
                  {product.stock > 0 ? `${product.stock} items in stock` : 'Currently out of stock'}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
