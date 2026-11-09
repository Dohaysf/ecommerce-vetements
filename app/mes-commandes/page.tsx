import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";
import { getClientSession } from "@/lib/clientSession";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/orderStatus";

export default async function MyOrdersPage() {
  const session = await getClientSession();
  if (!session) redirect("/connexion?redirect=/mes-commandes");

  const orders = await withRetry(() =>
    prisma.order.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            variant: { include: { product: { select: { name: true } } } },
          },
        },
      },
    })
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F6D5D0] via-[#FBE6DF] to-[#FFF8F3] px-6 py-12 text-[#3A2A2E] sm:px-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.3em] text-[#A08A8E] hover:text-[#C9566F]"
        >
          ← Retour à la boutique
        </Link>

        <h1 className="mb-8 mt-6 font-serif text-4xl italic text-[#5E2536]">
          Mes commandes
        </h1>

        {orders.length === 0 ? (
          <p className="text-[#7A5A60]">
            Tu n&apos;as pas encore passé de commande.{" "}
            <Link href="/" className="text-[#C9566F] underline">
              Découvre la collection
            </Link>
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/commande/${order.id}`}
                className="block rounded-2xl bg-white p-5 shadow-[0_3px_14px_rgba(201,86,111,0.08)] transition hover:shadow-[0_8px_24px_rgba(201,86,111,0.18)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-[#A08A8E]">
                      #{order.id.slice(-8).toUpperCase()} ·{" "}
                      {order.createdAt.toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-1 text-sm">
                      {order.items
                        .map((i) => `${i.variant.product.name} × ${i.quantity}`)
                        .join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${STATUS_STYLES[order.status]}`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                    <span className="font-serif text-lg text-[#B8445E]">
                      {Number(order.total).toFixed(2)} €
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}