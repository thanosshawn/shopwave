
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types"; // Original Product type for payload
import type { PlainProduct } from "@/lib/utils"; // PlainProduct for props
import { createProduct, updateProduct } from "@/lib/firebase/services";
import { Loader2 } from "lucide-react";
import { useState } from "react";

// Form schema uses fields that are directly editable, not including createdAt/updatedAt
const productFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be a positive number"),
  imageUrl: z.string().url("Main image URL must be a valid URL"),
  images: z.string().optional().refine(val => {
    if (!val || val.trim() === "") return true; // Optional, so empty is fine
    const urls = val.split(',').map(url => url.trim());
    return urls.every(url => {
      try {
        new URL(url);
        return true;
      } catch (_) {
        return false;
      }
    });
  }, { message: "All additional image URLs must be valid URLs, comma-separated." }),
  category: z.string().min(2, "Category is required"),
  featured: z.boolean().default(false).optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative").default(0),
  condition: z.enum(['new', 'used']).default('new').optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: PlainProduct | null; // Expect PlainProduct for initialData
  productId?: string | null; // For editing
}

export function ProductForm({ initialData, productId }: ProductFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const defaultValues = initialData ? {
    ...initialData, // Spread plain product data
    images: initialData.images?.join(', ') || '', 
    condition: initialData.condition || 'new',
  } : {
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    images: "",
    category: "",
    featured: false,
    stock: 0,
    condition: 'new' as 'new' | 'used',
  };

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  async function onSubmit(data: ProductFormData) {
    setIsSaving(true);
    try {
      // The payload for createProduct/updateProduct expects specific fields, not full Product/PlainProduct
      const productPayload: Omit<Product, 'id' | 'name_lowercase' | 'images' | 'createdAt' | 'updatedAt'> & { images?: string } = {
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        category: data.category,
        featured: data.featured,
        stock: data.stock,
        condition: data.condition || 'new',
        images: data.images, // Pass as string, services will handle splitting
      };

      if (productId && initialData) { 
        await updateProduct(productId, productPayload);
        toast({ title: "Product Updated", description: `"${data.name}" has been successfully updated.` });
      } else { 
        await createProduct(productPayload);
        toast({ title: "Product Created", description: `"${data.name}" has been successfully created.` });
      }
      router.push("/admin/products"); 
      router.refresh(); 
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error Saving Product",
        description: "Could not save the product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl><Input placeholder="e.g., Classic Leather Wallet" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea placeholder="Describe the product..." {...field} rows={5} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (USD)</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="e.g., 49.99" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl><Input type="number" step="1" placeholder="e.g., 100" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl><Input placeholder="e.g., Accessories, Electronics" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condition</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Main Image URL</FormLabel>
              <FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Image URLs (comma-separated)</FormLabel>
              <FormControl><Textarea placeholder="https://url1.png, https://url2.png" {...field} rows={3} /></FormControl>
              <FormDescription>Enter multiple URLs separated by commas.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Featured Product</FormLabel>
                <FormDescription>
                  Display this product prominently on the homepage or featured sections.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving ? (productId ? 'Updating...' : 'Creating...') : (productId ? 'Update Product' : 'Create Product')}
        </Button>
      </form>
    </Form>
  );
}
