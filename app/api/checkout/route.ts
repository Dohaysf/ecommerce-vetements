import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientSession } from "@/lib/clientSession";
import { checkoutSchema } from "@/lib/validations/checkout";

class CheckoutError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function POST(request: Request) {
  const session = await getClientSession();
  if (!session) {
    return NextResponse.json(
      { error: "Connecte-toi pour commander" },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { items, shipping } = parsed.data;

  // Regroupe les doublons éventuels d'une même variante
  const quantities = new Map<string, number>();
  for (const item of items) {
    quantities.set(
      item.variantId,
      (quantities.get(item.variantId) ?? 0) + item.quantity
    );
  }

  try {
    const order = await prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: session.userId },
          select: { id: true },
        });
        if (!user) {
          throw new CheckoutError("Session expirée, reconnecte-toi", 401);
        }

        // Les prix viennent de la base, jamais du navigateur
        const variants = await tx.productVariant.findMany({
          where: { id: { in: [...quantities.keys()] } },
          include: { product: { select: { name: true, price: true } } },
        });

        if (variants.length !== quantities.size) {
          throw new CheckoutError(
            "Un article de ton panier n'est plus disponible",
            409
          );
        }

        let totalCents = 0;
        const lines: { variantId: string; quantity: number; unitPrice: number }[] = [];

        for (const variant of variants) {
          const quantity = quantities.get(variant.id)!;

          // Retire le stock seulement s'il y en a assez (opération atomique)
          const updated = await tx.productVariant.updateMany({
            where: { id: variant.id, stock: { gte: quantity } },
            data: { stock: { decrement: quantity } },
          });

          if (updated.count === 0) {
            throw new CheckoutError(
              `Stock insuffisant pour « ${variant.product.name} » (taille ${variant.size})`,
              409
            );
          }

          const unitPrice = Number(variant.product.price);
          totalCents += Math.round(unitPrice * 100) * quantity;
          lines.push({ variantId: variant.id, quantity, unitPrice });
        }

        return tx.order.create({
          data: {
            userId: user.id,
            total: totalCents / 100,
            shippingAddress: shipping.address,
            shippingZip: shipping.zip,
            shippingCity: shipping.city,
            items: { create: lines },
          },
          select: { id: true },
        });
      },
      { maxWait: 10000, timeout: 20000 }
    );

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: "Impossible d'enregistrer la commande, réessaie" },
      { status: 500 }
    );
  }
}