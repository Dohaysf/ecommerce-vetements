"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/app/store/cartStore";

const inputClass =
  "w-full rounded-full border border-[#E9CFC9] bg-[#FFF8F3] px-5 py-3 text-sm outline-none transition focus:border-[#C9566F]";
const labelClass =
  "mb-1.5 block text-xs uppercase tracking-widest text-[#A08A8E]";

export default function CheckoutForm() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (done) {
    return (
      <p className="py-20 text-center text-[#7A5A60]">
        Commande enregistrée, redirection...
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="py-10 text-[#7A5A60]">
        Ton panier est vide.{" "}
        <Link href="/" className="text-[#C9566F] underline">
          Découvre la collection
        </Link>
      </p>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          shipping: { address, zip, city },
        }),
      });

      if (res.status === 401) {
        router.push("/connexion?redirect=/checkout");
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setDone(true);
        clearCart();
        router.push(`/commande/${data.orderId}`);
        return;
      }

      setError(data.error || "Une erreur est survenue");
    } catch {
      setError("Impossible de joindre le serveur, réessaie");
    }

    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
      {/* ADRESSE */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl bg-white p-6 shadow-[0_4px_20px_rgba(201,86,111,0.1)] sm:p-8 lg:col-span-3"
      >
        <p className="font-serif text-xl italic text-[#5E2536]">
          Adresse de livraison
        </p>

        <div>
          <label className={labelClass}>Adresse</label>
          <input
            required
            autoComplete="street-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputClass}
            placeholder="12 rue des Lilas"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Code postal</label>
            <input
              required
              autoComplete="postal-code"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className={inputClass}
              placeholder="69003"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Ville</label>
            <input
              required
              autoComplete="address-level2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={inputClass}
              placeholder="Lyon"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#C9566F] py-3.5 text-xs uppercase tracking-[0.25em] text-white shadow-[0_6px_18px_rgba(201,86,111,0.35)] transition hover:bg-[#B8445E] disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Confirmer la commande"}
        </button>
      </form>

      {/* RÉCAPITULATIF */}
      <div className="h-fit rounded-3xl bg-white p-6 shadow-[0_4px_20px_rgba(201,86,111,0.1)] lg:col-span-2">
        <p className="mb-4 font-serif text-xl italic text-[#5E2536]">
          Ta commande
        </p>

        <div className="divide-y divide-[#F1DCD6]">
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex justify-between gap-3 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-xs text-[#A08A8E]">
                  {item.size} · {item.color} · × {item.quantity}
                </p>
              </div>
              <p className="shrink-0">
                {(item.price * item.quantity).toFixed(2)} €
              </p>
            </div>
          ))}
        </div>

        <div className="mt-2 flex justify-between border-t border-[#F1DCD6] pt-4">
          <span>Total</span>
          <span className="font-serif text-xl text-[#B8445E]">
            {totalPrice().toFixed(2)} €
          </span>
        </div>

        <Link
          href="/panier"
          className="mt-4 block text-center text-xs uppercase tracking-widest text-[#A08A8E] hover:text-[#C9566F]"
        >
          ← Modifier le panier
        </Link>
      </div>
    </div>
  );
}