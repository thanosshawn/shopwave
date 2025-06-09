
import ProductCard from '@/components/product/product-card';
import { getProducts } from '@/lib/firebase/services';
import type { Product } from '@/lib/types';

export default async function UsedProductsPage() {
  // Fetch products from Firestore with condition 'used'
  // You might need to create an index in Firestore for this query:
  // Collection: products, Fields: condition (ASC), name (ASC)
  const usedProducts = await getProducts({ condition: 'used' }, 20); // Get up to 20 used products

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-headline font-bold mb-8 text-center md:text-left">
          {usedProducts.length > 0 ? "Discover Used Products" : "No Used Products Available"}
        </h1>
        {usedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {usedProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">
            We currently don't have any used products listed. Please check back later!
          </p>
        )}
      </div>
    </div>
  );
}
