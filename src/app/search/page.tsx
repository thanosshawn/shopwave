
"use client"; // Keep as client component due to useSearchParams and direct search interaction

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense, useCallback } from 'react';
import ProductCard from '@/components/product/product-card';
import { searchProducts } from '@/lib/firebase/services';
import type { Product } from '@/lib/types';
import { SearchBar } from '@/components/ui/search-bar';
import { Loader2, SearchX } from 'lucide-react';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (searchTerm: string | null) => {
    if (searchTerm && searchTerm.trim()) {
      setIsLoading(true);
      setHasSearched(true);
      try {
        const results = await searchProducts(searchTerm);
        setFilteredProducts(results);
      } catch (error) {
        console.error("Error searching products:", error);
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setFilteredProducts([]); // Clear results if query is empty
      setHasSearched(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  return (
    <div className="space-y-8">
      <div className="md:hidden mb-6"> {/* Search bar for mobile */}
        <SearchBar />
      </div>
      {query && (
        <h1 className="text-3xl font-headline font-bold">
          Search Results for "{query}"
        </h1>
      )}
      {!query && !hasSearched && (
        <h1 className="text-3xl font-headline font-bold text-center md:text-left">
          Search for Products
        </h1>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : hasSearched ? (
        <div className="text-center py-12">
          <SearchX className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
          <p className="text-xl text-muted-foreground">No products found matching your search criteria.</p>
          <p className="text-sm text-muted-foreground mt-2">Try a different search term or check your spelling.</p>
        </div>
      ) : !query ? (
         <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">Enter a search term above to find products.</p>
        </div>
      ) : null}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center py-12"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
