import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { productSchema } from "@/lib/validations/product";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  const incomingIds = data.variants.filter((v) => v.id).map((v) => v.id as string);
  const idsToDelete = existing.variants
    .filter((v) => !incomingIds.includes(v.id))
    .map((v) => v.id);

  try {
    await prisma.$transaction([
      prisma.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price,
          categoryId: data.categoryId,
        },
      }),
      prisma.productVariant.deleteMany({ where: { id: { in: idsToDelete } } }),
      ...data.variants
        .filter((v) => v.id)
        .map((v) =>
          prisma.productVariant.update({
            where: { id: v.id as string },
            data: { size: v.size, color: v.color, stock: v.stock, sku: v.sku },
          })
        ),
      ...data.variants
        .filter((v) => !v.id)
        .map((v) =>
          prisma.productVariant.create({
            data: {
              productId: id,
              size: v.size,
              color: v.color,
              stock: v.stock,
              sku: v.sku,
            },
          })
        ),
      prisma.productImage.deleteMany({ where: { productId: id } }),
      ...(data.imageUrl
        ? [
            prisma.productImage.create({
              data: { productId: id, url: data.imageUrl },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") {
      return NextResponse.json(
        { error: "Ce slug ou ce SKU est déjà utilisé" },
        { status: 409 }
      );
    }
    if (code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer une variante déjà présente dans une commande",
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if ((err as { code?: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Impossible de supprimer : ce produit a déjà été commandé" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}