
import FeaturedProductCarousel from '@/components/product/featured-product-carousel';
import ProductCard from '@/components/product/product-card';
import { getProducts } from '@/lib/firebase/services';
import type { Product } from '@/lib/types';

export default async function HomePage() {
  // Fetch products from Firestore
  const featuredProducts = await getProducts({ featured: true }, 5); // Get up to 5 featured products
  const allProducts = await getProducts({}, 8); // Get up to 8 general products for the main listing

  return (
    <div className="space-y-12">
      {featuredProducts.length > 0 && <FeaturedProductCarousel products={featuredProducts} />}

      <div>
        <h2 className="text-3xl font-headline font-bold mb-6 text-center md:text-left">
          {allProducts.length > 0 ? "Explore Our Products" : "No Products Available"}
        </h2>
        {allProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Please check back later for new arrivals.</p>
        )}
      </div>
    </div>
  );
}
