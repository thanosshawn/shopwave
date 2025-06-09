
import { getAllProductsAdmin } from "@/lib/firebase/services";
import type { Product } from "@/lib/types";
import { ProductDataTable } from "@/components/admin/product-data-table";
import { getProductColumns } from "@/components/admin/product-columns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

// Define a client component or move data fetching and state to ProductDataTable if client-side fetching is preferred
// For this example, we keep data fetching server-side and pass to a client table.
// To enable refresh, ProductDataTable itself would need to re-fetch or this page needs revalidation.

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  // This function would ideally trigger a revalidation of this page's data or be passed to the client to refetch
  const refreshProducts = async () => {
    // For server components, revalidation is needed.
    // For client components, you'd typically re-fetch data.
    // This is a placeholder as revalidation from server components directly initiated by client action is complex.
    // The ProductDataTable will handle local state updates or use router.refresh() for simple re-renders.
    console.log("Refreshing products list (server-side revalidation would be needed for full effect)");
  };

  const columns = getProductColumns(refreshProducts); // Pass the refresh function

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold">Manage Products</h1>
        <Button asChild>
          <Link href="/admin/products/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
          </Link>
        </Button>
      </div>
      <ProductDataTable columns={columns} data={products} refreshData={refreshProducts} />
    </div>
  );
}

// Extend react-table types for meta
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends unknown> {
    refreshData?: () => void
  }
}
