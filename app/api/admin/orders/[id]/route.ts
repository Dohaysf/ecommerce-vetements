import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";
import { ORDER_STATUSES } from "@/lib/orderStatus";

const schema = z.object({ status: z.enum(ORDER_STATUSES) });

type Ctx = { params: Promise<{ id: string }> };

class OrderError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function PATCH(request: Request, { params }: Ctx) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findUnique({
          where: { id },
          include: { items: true },
        });
        if (!order) throw new OrderError("Commande introuvable", 404);

        const wasCancelled = order.status === "CANCELLED";
        const willBeCancelled = parsed.data.status === "CANCELLED";

        // Annulation : les articles retournent en stock
        if (!wasCancelled && willBeCancelled) {
          for (const item of order.items) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }

        // Réactivation : on retire à nouveau le stock, s'il y en a assez
        if (wasCancelled && !willBeCancelled) {
          for (const item of order.items) {
            const result = await tx.productVariant.updateMany({
              where: { id: item.variantId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            });
            if (result.count === 0) {
              throw new OrderError(
                "Stock insuffisant pour réactiver cette commande",
                409
              );
            }
          }
        }

        await tx.order.update({
          where: { id },
          data: { status: parsed.data.status },
        });
      },
      { maxWait: 10000, timeout: 20000 }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}