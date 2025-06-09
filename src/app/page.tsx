import FeaturedProductCarousel from '@/components/product/featured-product-carousel';
import ProductCard from '@/components/product/product-card';
import { mockProducts } from '@/lib/data';
import type { Product } from '@/lib/types';

export default function HomePage() {
  const featuredProducts = mockProducts.filter(p => p.featured);
  const allProducts = mockProducts;

  return (
    <div className="space-y-12">
      <FeaturedProductCarousel products={featuredProducts} />

      <div>
        <h2 className="text-3xl font-headline font-bold mb-6 text-center md:text-left">All Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
