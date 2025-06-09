
import { getProductById } from "@/lib/firebase/services";
import { ProductForm } from "@/components/admin/product-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { notFound } from "next/navigation";

interface EditProductPageProps {
  params: { id: string };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound(); // Or redirect to a "product not found" page within admin
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Edit Product</CardTitle>
          <CardDescription>Update the details for "{product.name}".</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm initialData={product} productId={params.id} />
        </CardContent>
      </Card>
    </div>
  );
}
