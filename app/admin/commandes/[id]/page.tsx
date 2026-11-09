import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/orderStatus";
import OrderStatusSelect from "@/app/admin/components/OrderStatusSelect";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await withRetry(() =>
    prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: {
            variant: {
              include: { product: { include: { images: true } } },
            },
          },
        },
      },
    })
  );

  if (!order) notFound();

  const card =
    "rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(196,135,126,0.08)]";
  const label = "mb-2 text-xs uppercase tracking-widest text-[#B0A29B]";

  return (
    <div>
      <Link
        href="/admin/commandes"
        className="text-xs uppercase tracking-[0.3em] text-[#B0A29B] hover:text-[#C4877E]"
      >
        ← Retour aux commandes
      </Link>

      <div className="mb-8 mt-4 flex flex-wrap items-center gap-4">
        <h1 className="font-serif text-2xl italic">
          Commande #{order.id.slice(-8).toUpperCase()}
        </h1>
        <span
          className={`rounded-full px-3 py-1 text-xs ${STATUS_STYLES[order.status]}`}
        >
          {STATUS_LABELS[order.status]}
        </span>
        <span className="text-sm text-[#7A6B65]">
          {order.createdAt.toLocaleString("fr-FR", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ARTICLES */}
        <div className={`${card} lg:col-span-2`}>
          <p className={label}>Articles</p>
          <div className="divide-y divide-[#F2E8E1]">
            {order.items.map((item) => {
              const image = item.variant.product.images[0]?.url;
              const line = Number(item.unitPrice) * item.quantity;
              return (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[#FBF5F0]">
                    {image && (
                      <Image
                        src={image}
                        alt={item.variant.product.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-serif italic">
                      {item.variant.product.name}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-[#B0A29B]">
                      {item.variant.size} · {item.variant.color}
                    </p>
                    <p className="mt-1 text-xs text-[#7A6B65]">
                      {item.quantity} × {Number(item.unitPrice).toFixed(2)} €
                    </p>
                  </div>
                  <p className="text-[#C4877E]">{line.toFixed(2)} €</p>
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex justify-between border-t border-[#E8D5CE] pt-4">
            <span>Total</span>
            <span className="font-serif text-xl text-[#C4877E]">
              {Number(order.total).toFixed(2)} €
            </span>
          </div>
        </div>

        {/* COLONNE DE DROITE */}
        <div className="space-y-6">
          <div className={card}>
            <p className={label}>Statut</p>
            <OrderStatusSelect orderId={order.id} current={order.status} />
          </div>

          <div className={card}>
            <p className={label}>Client</p>
            <p className="font-medium">{order.user.name}</p>
            <p className="text-sm text-[#7A6B65]">{order.user.email}</p>
          </div>

          <div className={card}>
            <p className={label}>Livraison</p>
            <p className="text-sm leading-relaxed text-[#3D302C]">
              {order.shippingAddress}
              <br />
              {order.shippingZip} {order.shippingCity}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}