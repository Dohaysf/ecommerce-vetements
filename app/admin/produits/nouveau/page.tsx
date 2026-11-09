import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";
import ProductForm from "@/app/admin/components/ProductForm";

export default async function NewProductPage() {
  const categories = await withRetry(() =>
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    })
  );

  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl italic">Nouveau produit</h1>
      <ProductForm categories={categories} />
    </div>
  );
}