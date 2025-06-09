
import { getAllProductsAdmin } from "@/lib/firebase/services";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AdminProductsClientTable } from "@/components/admin/admin-products-client-table";
import { makeProductPlain, type PlainProduct } from "@/lib/utils"; // Import serialization utils
import type { Product } from "@/lib/types";

export default async function AdminProductsPage() {
  const productsData = await getAllProductsAdmin();
  const plainProducts = productsData.map(p => makeProductPlain(p as Product)).filter(p => p !== null) as PlainProduct[];


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
      <AdminProductsClientTable products={plainProducts} />
    </div>
  );
}

// This can be removed if not used elsewhere or defined in a more global scope
// declare module '@tanstack/react-table' {
//   interface TableMeta<TData extends unknown> {
//     refreshData?: () => void
//   }
// }
