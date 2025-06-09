
"use client";

import type { Product } from "@/lib/types";
import { ProductDataTable } from "@/components/admin/product-data-table";
import { getProductColumns } from "@/components/admin/product-columns";
import { useRouter } from "next/navigation";

interface AdminProductsClientTableProps {
  products: Product[];
}

export function AdminProductsClientTable({ products }: AdminProductsClientTableProps) {
  const router = useRouter();
  
  const refreshPageData = () => {
    router.refresh();
  };

  // getProductColumns now uses its own router and toast instances due to "use client" in its file.
  const columns = getProductColumns(); 

  return (
    <ProductDataTable columns={columns} data={products} refreshData={refreshPageData} />
  );
}
