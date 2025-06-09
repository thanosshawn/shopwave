
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/firebase/services';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ProductDetailClientInteractions from './product-detail-client-interactions'; // New client component

interface ProductDetailsPageProps {
  params: { id: string };
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound(); // Triggers the not-found.js or default Next.js 404 page
  }
  
  const productImages = [product.imageUrl, ...(product.images || [])];

  return (
    <div className="max-w-5xl mx-auto">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Link>
      </Button>
      <ProductDetailClientInteractions product={product} productImages={productImages} />
    </div>
  );
}
