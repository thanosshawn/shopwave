
import { ProductForm } from "@/components/admin/product-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AddProductPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Add New Product</CardTitle>
          <CardDescription>Fill in the details below to add a new product to the catalog.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
