
"use client";

import type { PlainProduct } from "@/lib/utils"; // Updated to PlainProduct
import { ProductDataTable } from "@/components/admin/product-data-table";
import { getProductColumns } from "@/components/admin/product-columns";
import { useRouter } from "next/navigation";

interface AdminProductsClientTableProps {
  products: PlainProduct[]; // Expect PlainProduct
}

export function AdminProductsClientTable({ products }: AdminProductsClientTableProps) {
  const router = useRouter();
  
  const refreshPageData = () => {
    router.refresh();
  };

  const columns = getProductColumns(); 

  return (
    <ProductDataTable columns={columns} data={products} refreshData={refreshPageData} />
  );
}
