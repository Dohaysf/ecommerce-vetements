import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";
import { getClientSession } from "@/lib/clientSession";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/orderStatus";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getClientSession();
  if (!session) redirect(`/connexion?redirect=/commande/${id}`);

  const order = await withRetry(() =>
    prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: { include: { product: { select: { name: true } } } },
          },
        },
      },
    })
  );

  if (!order || order.userId !== session.userId) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F6D5D0] via-[#FBE6DF] to-[#FFF8F3] px-6 py-12 text-[#3A2A2E] sm:px-12">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <p className="text-4xl text-[#C9566F]">✓</p>
          <h1 className="mt-3 font-serif text-4xl italic text-[#5E2536]">
            Merci pour ta commande !
          </h1>
          <p className="mt-3 text-sm text-[#7A5A60]">
            Commande{" "}
            <span className="font-mono">
              #{order.id.slice(-8).toUpperCase()}
            </span>{" "}
            · {order.createdAt.toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
          <span
            className={`mt-4 inline-block rounded-full px-4 py-1 text-xs ${STATUS_STYLES[order.status]}`}
          >
            {STATUS_LABELS[order.status]}
          </span>
        </div>

        <div className="mt-10 rounded-3xl bg-white p-6 shadow-[0_4px_20px_rgba(201,86,111,0.1)] sm:p-8">
          <div className="divide-y divide-[#F1DCD6]">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{item.variant.product.name}</p>
                  <p className="text-xs text-[#A08A8E]">
                    {item.variant.size} · {item.variant.color} · ×{" "}
                    {item.quantity}
                  </p>
                </div>
                <p className="shrink-0">
                  {(Number(item.unitPrice) * item.quantity).toFixed(2)} €
                </p>
              </div>
            ))}
          </div>

          <div className="mt-2 flex justify-between border-t border-[#F1DCD6] pt-4">
            <span>Total</span>
            <span className="font-serif text-xl text-[#B8445E]">
              {Number(order.total).toFixed(2)} €
            </span>
          </div>

          <div className="mt-6 rounded-2xl bg-[#FFF8F3] p-4 text-sm">
            <p className="mb-1 text-xs uppercase tracking-widest text-[#A08A8E]">
              Livraison
            </p>
            {order.shippingAddress}
            <br />
            {order.shippingZip} {order.shippingCity}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/mes-commandes"
            className="rounded-full bg-[#C9566F] px-7 py-3 text-xs uppercase tracking-widest text-white hover:bg-[#B8445E]"
          >
            Mes commandes
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[#E9CFC9] bg-white px-7 py-3 text-xs uppercase tracking-widest text-[#7A5A60] hover:border-[#C9566F]"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    </main>
  );
}