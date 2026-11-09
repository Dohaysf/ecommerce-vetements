import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";
import {
  ORDER_STATUSES,
  STATUS_LABELS,
  STATUS_STYLES,
} from "@/lib/orderStatus";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const { statut } = await searchParams;
  const filter = ORDER_STATUSES.find((s) => s === statut);

  const orders = await withRetry(() =>
    prisma.order.findMany({
      where: filter ? { status: filter } : undefined,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    })
  );

  const tabClass = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-xs uppercase tracking-widest transition ${
      active
        ? "border-[#E8B4B0] bg-[#E8B4B0] text-white"
        : "border-[#E8D5CE] bg-white text-[#7A6B65] hover:border-[#E8B4B0]"
    }`;

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl italic">Commandes</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/admin/commandes" className={tabClass(!filter)}>
          Toutes
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/commandes?statut=${s}`}
            className={tabClass(filter === s)}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-[#B0A29B] shadow-[0_2px_12px_rgba(196,135,126,0.08)]">
          Aucune commande pour l&apos;instant.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-[0_2px_12px_rgba(196,135,126,0.08)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E8D5CE] text-[#B0A29B]">
                <th className="p-4">N°</th>
                <th className="p-4">Date</th>
                <th className="p-4">Client</th>
                <th className="p-4">Articles</th>
                <th className="p-4">Total</th>
                <th className="p-4">Statut</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[#F2E8E1] last:border-0"
                >
                  <td className="p-4 font-mono text-xs">
                    #{order.id.slice(-8).toUpperCase()}
                  </td>
                  <td className="p-4 text-[#7A6B65]">
                    {order.createdAt.toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4">
                    <p className="font-medium">{order.user.name}</p>
                    <p className="text-xs text-[#B0A29B]">{order.user.email}</p>
                  </td>
                  <td className="p-4">{order._count.items}</td>
                  <td className="p-4">{Number(order.total).toFixed(2)} €</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${STATUS_STYLES[order.status]}`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/admin/commandes/${order.id}`}
                      className="text-[#7A6B65] hover:text-[#C4877E]"
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}