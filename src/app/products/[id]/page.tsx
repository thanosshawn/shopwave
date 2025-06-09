"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { mockProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      const foundProduct = mockProducts.find(p => p.id === params.id);
      if (foundProduct) {
        setProduct(foundProduct);
        setSelectedImage(foundProduct.imageUrl); // Set main image as default selected
      } else {
        // Handle product not found, e.g., redirect to 404 or product listing
        router.push('/'); 
      }
    }
  }, [params.id, router]);

  if (!product) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const productImages = [product.imageUrl, ...(product.images || [])];

  return (
    <div className="max-w-5xl mx-auto">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
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

                <Button size="lg" className="w-full" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
                {product.stock !== undefined && (
                  <p className="text-sm text-muted-foreground mt-3 text-center">
                    {product.stock > 0 ? `${product.stock} items in stock` : 'Out of stock'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
