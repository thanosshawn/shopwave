
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/firebase/services';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProductDetailClientInteractions from './product-detail-client-interactions'; // New client component
import { makeProductPlain, type PlainProduct } from '@/lib/utils';

interface ProductDetailsPageProps {
  params: { id: string };
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const productData = await getProductById(params.id);

  if (!productData) {
    notFound(); // Triggers the not-found.js or default Next.js 404 page
  }
  
  const plainProduct = makeProductPlain(productData) as PlainProduct; // Cast because we know productData exists here

  if (!plainProduct) {
    notFound(); // Should not happen if productData exists, but good for type safety
  }

  const productImages = [plainProduct.imageUrl, ...(plainProduct.images || [])];

  return (
    <div className="max-w-5xl mx-auto">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Link>
      </Button>
      <ProductDetailClientInteractions product={plainProduct} productImages={productImages} />
    </div>
  );
}
