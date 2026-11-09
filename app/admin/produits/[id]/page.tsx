import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";
import ProductForm from "@/app/admin/components/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await withRetry(() =>
    prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true },
    })
  );

  if (!product) notFound();

  const categories = await withRetry(() =>
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    })
  );

  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl italic">Modifier le produit</h1>
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: Number(product.price),
          categoryId: product.categoryId,
          imageUrl: product.images[0]?.url ?? "",
          variants: product.variants.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            stock: v.stock,
            sku: v.sku,
          })),
        }}
      />
    </div>
  );
}