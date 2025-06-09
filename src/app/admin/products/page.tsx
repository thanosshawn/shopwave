
import { getAllProductsAdmin } from "@/lib/firebase/services";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AdminProductsClientTable } from "@/components/admin/admin-products-client-table"; // New client component

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

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
      <AdminProductsClientTable products={products} />
    </div>
  );
}

// Extend react-table types for meta - this can remain if other parts of the table use meta
// If only used by product-columns.tsx for refreshData (which is now handled internally), this could be removed
// or moved to a more global types definition file or alongside ProductDataTable if it directly uses meta.refreshData.
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends unknown> {
    refreshData?: () => void
  }
}
