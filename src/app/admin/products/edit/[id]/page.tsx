
import { getProductById } from "@/lib/firebase/services";
import { ProductForm } from "@/components/admin/product-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { makeProductPlain, type PlainProduct } from "@/lib/utils"; // Import serialization utils

interface EditProductPageProps {
  params: { id: string };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const productData = await getProductById(params.id);

  if (!productData) {
    notFound(); 
  }

  const plainProduct = makeProductPlain(productData) as PlainProduct;

  if (!plainProduct) {
      notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Edit Product</CardTitle>
          <CardDescription>Update the details for "{plainProduct.name}".</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Pass the plain product to the form */}
          <ProductForm initialData={plainProduct} productId={params.id} />
        </CardContent>
      </Card>
    </div>
  );
}
