"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import ProductCard from '@/components/product/product-card';
import { mockProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import { SearchBar } from '@/components/ui/search-bar'; // Re-using the search bar for consistency

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (query) {
      const results = mockProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(results);
    } else {
      setFilteredProducts(mockProducts); // Show all if no query
    }
  }, [query]);

  return (
    <div className="space-y-8">
      <div className="md:hidden mb-6"> {/* Search bar for mobile, as header one might be smaller */}
        <SearchBar />
      </div>
      {query && (
        <h1 className="text-3xl font-headline font-bold">
          Search Results for "{query}"
        </h1>
      )}
      {!query && (
        <h1 className="text-3xl font-headline font-bold">
          Browse All Products
        </h1>
      )}

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No products found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
}


export default function SearchPage() {
  return (
    // Suspense is required by Next.js when using useSearchParams in a page component
    <Suspense fallback={<div className="text-center py-12">Loading search results...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}

