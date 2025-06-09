import type { Product } from '@/lib/types';
import ProductCard from './product-card';

interface FeaturedProductCarouselProps {
  products: Product[];
}

export default function FeaturedProductCarousel({ products }: FeaturedProductCarouselProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-headline font-bold mb-6 text-center md:text-left">Featured Products</h2>
      <div className="relative">
        <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-accent/20">
          {products.map((product) => (
            <div key={product.id} className="flex-none w-72 md:w-80">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        {/* Basic gradient overlays for a more polished look if desired */}
        <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none md:hidden"></div>
        <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden"></div>
      </div>
    </div>
  );
}
