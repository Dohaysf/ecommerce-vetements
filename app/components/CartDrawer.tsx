"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/app/store/cartStore";

const DISPLAY = "font-[family-name:var(--font-display)]";
const euro = (value: number) => `${value.toFixed(2).replace(".", ",")}\u00a0€`;

export default function CartDrawer() {
  const pathname = usePathname();
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  // Le tiroir se referme quand on change de page
  useEffect(() => {
    closeCart();
  }, [pathname, closeCart]);

  // Ouverture : focus sur la croix, blocage du défilement, touche Échap
  useEffect(() => {
    if (!isOpen) return;

    lastFocus.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      lastFocus.current?.focus?.();
    };
  }, [isOpen, closeCart]);

  // Les articles ne s'affichent qu'après le montage (évite un décalage serveur/navigateur)
  const list = mounted ? items : [];
  const count = list.reduce((sum, i) => sum + i.quantity, 0);
  const total = list.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={closeCart}
        className={`fixed inset-0 z-[89] bg-[#2A1B20]/45 backdrop-blur-[2px] transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Votre panier"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`fixed right-0 top-0 z-[90] flex h-dvh w-full max-w-md flex-col border-l border-[#B8975A]/60 bg-[#FCF8F0] text-[#2A1B20] shadow-[-24px_0_60px_-20px_rgba(42,27,32,0.35)] transition-transform duration-500 ease-[cubic-bezier(.22,.8,.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-[#E3D3B4] px-7 py-6">
          <div>
            <h2 className={`${DISPLAY} text-3xl italic leading-none`}>
              Votre panier
            </h2>
            <p className="mt-1.5 text-sm text-[#6B5A5C]">
              {count === 0
                ? "Aucun article"
                : `${count} article${count > 1 ? "s" : ""}`}
            </p>
          </div>

          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            aria-label="Fermer le panier"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D8C39A] text-[#5A1E2E] transition hover:border-[#5A1E2E]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto px-7">
          {list.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                <path
                  d="M12 1 L14.2 9.8 L23 12 L14.2 14.2 L12 23 L9.8 14.2 L1 12 L9.8 9.8 Z"
                  fill="#B8975A"
                />
              </svg>
              <p className={`${DISPLAY} mt-5 text-2xl italic`}>
                Votre panier est vide
              </p>
              <p className="mt-2 max-w-[16rem] text-sm text-[#6B5A5C]">
                Découvrez la collection et choisissez les pièces qui vous
                ressemblent.
              </p>
              <Link
                href="/#collection"
                onClick={closeCart}
                className="mt-7 bg-[#5A1E2E] px-8 py-3.5 text-[12px] uppercase tracking-[0.2em] text-[#F7F1E8] transition hover:bg-[#7A2D40]"
              >
                Voir la collection
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#E3D3B4]">
              {list.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-6">
                  <Link
                    href={`/produits/${item.productSlug}`}
                    onClick={closeCart}
                    aria-label={item.productName}
                    className="relative block h-28 w-20 shrink-0 overflow-hidden rounded-b-md rounded-t-full bg-[#EADFCB] ring-1 ring-[#E3D3B4]"
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/produits/${item.productSlug}`}
                          onClick={closeCart}
                          className={`${DISPLAY} block text-xl italic leading-tight transition hover:text-[#7A2D40]`}
                        >
                          {item.productName}
                        </Link>
                        <p className="mt-1 text-sm text-[#6B5A5C]">
                          Taille {item.size}, {item.color}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        aria-label={`Retirer ${item.productName} du panier`}
                        className="shrink-0 text-xs text-[#8A7A7C] underline underline-offset-4 transition hover:text-[#7A2D40]"
                      >
                        Retirer
                      </button>
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-4">
                      <div className="inline-flex items-center border border-[#D8C39A]">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          aria-label={`Diminuer la quantité de ${item.productName}`}
                          className="flex h-9 w-9 items-center justify-center text-lg text-[#5A1E2E] transition hover:bg-[#F1E7D6] disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
                          aria-label={`Augmenter la quantité de ${item.productName}`}
                          className="flex h-9 w-9 items-center justify-center text-lg text-[#5A1E2E] transition hover:bg-[#F1E7D6] disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <p className="font-medium text-[#7A2D40]">
                        {euro(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pied */}
        {list.length > 0 && (
          <div className="border-t border-[#E3D3B4] bg-[#F7F1E8] px-7 py-6">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-[#6B5A5C]">Sous-total</span>
              <span className={`${DISPLAY} text-3xl text-[#5A1E2E]`}>
                {euro(total)}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#8A7A7C]">
              L&apos;adresse de livraison et le paiement se font à l&apos;étape
              suivante.
            </p>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="mt-5 block bg-[#5A1E2E] py-4 text-center text-[12px] uppercase tracking-[0.2em] text-[#F7F1E8] outline outline-1 -outline-offset-4 outline-[#B8975A]/60 transition hover:bg-[#7A2D40]"
            >
              Passer la commande
            </Link>
            <Link
              href="/panier"
              onClick={closeCart}
              className="mt-3 block text-center text-sm text-[#5A1E2E] underline decoration-[#B8975A] underline-offset-4"
            >
              Voir le panier détaillé
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}