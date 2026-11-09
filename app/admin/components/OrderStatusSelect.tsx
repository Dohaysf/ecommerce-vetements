"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ORDER_STATUSES,
  STATUS_LABELS,
  type OrderStatusValue,
} from "@/lib/orderStatus";

export default function OrderStatusSelect({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatusValue;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatusValue>(current);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const dirty = status !== current;

  const handleSave = async () => {
    if (status === "CANCELLED" && !confirm("Annuler cette commande ?")) return;

    setSaving(true);
    setError("");
    setMessage("");

    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setSaving(false);

    if (res.ok) {
      setMessage("Statut mis à jour ✓");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Une erreur est survenue");
    }
  };

  return (
    <div>
      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value as OrderStatusValue);
          setMessage("");
        }}
        className="w-full rounded-full border border-[#E8D5CE] bg-[#FBF5F0] px-4 py-2.5 text-sm outline-none focus:border-[#E8B4B0]"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <button
        onClick={handleSave}
        disabled={!dirty || saving}
        className="mt-3 w-full rounded-full bg-[#E8B4B0] py-2.5 text-xs uppercase tracking-widest text-white transition hover:bg-[#C4877E] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "Enregistrement..." : "Mettre à jour"}
      </button>

      {message && <p className="mt-2 text-xs text-[#3E6B45]">{message}</p>}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}