
"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Product } from "@/lib/types"
import { deleteProduct } from "@/lib/firebase/services"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const ProductImageCell = ({ row }: { row: any }) => {
  const imageUrl = row.getValue("imageUrl") as string;
  const productName = row.getValue("name") as string;
  return (
    <div className="w-16 h-16 relative rounded-md overflow-hidden border">
      {imageUrl ? (
        <Image src={imageUrl} alt={productName} fill className="object-cover" data-ai-hint="product admin table" />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
          No Image
        </div>
      )}
    </div>
  );
};


export const getProductColumns = (
  refreshProducts: () => void // Callback to refresh data after deletion
): ColumnDef<Product>[] => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { toast } = useToast();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();


  const handleDelete = async (productId: string, productName: string) => {
    try {
      await deleteProduct(productId);
      toast({
        title: "Product Deleted",
        description: `"${productName}" has been successfully deleted.`,
      });
      refreshProducts(); // Refresh the table data
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error Deleting Product",
        description: "Could not delete the product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "imageUrl",
      header: "Image",
      cell: ProductImageCell,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-right w-full justify-end"
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => <div className="text-center">{row.getValue("stock")}</div>,
    },
    {
      accessorKey: "featured",
      header: "Featured",
      cell: ({ row }) => (row.getValue("featured") ? "Yes" : "No"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/products/edit/${product.id}`}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product
                  "{product.name}" and remove its data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(product.id, product.name)}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Delete Product
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
    },
  ];
};
