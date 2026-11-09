"use client";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/app/store/cartStore";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#FAF7F2] px-6 py-16 sm:px-12">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-8 h-3 w-40 rounded bg-[#EAE0D6]" />
          <div className="mb-10 h-10 w-64 rounded bg-[#EAE0D6]" />
          <div className="h-48 rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  const subtotal = totalPrice();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-4 py-10 text-[#29211F] sm:px-8 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-[#84756E] transition hover:text-[#81394B]"
        >
          <span aria-hidden="true">←</span>
          Retour à la collection
        </Link>

        {/* En-tête */}
        <div className="mb-10 mt-8 border-b border-[#EAE0D6] pb-8 sm:mb-12">
          <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#B99A61]">
            Douceur &amp; Élégance
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-serif text-4xl italic text-[#29211F] sm:text-5xl">
                Votre panier
              </h1>
              <p className="mt-3 text-sm text-[#84756E]">
                Retrouvez vos pièces préférées avant de finaliser votre commande.
              </p>
            </div>

            {items.length > 0 && (
              <p className="text-xs uppercase tracking-widest text-[#84756E]">
                {itemCount} article{itemCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Panier vide */}
        {items.length === 0 ? (
          <section className="rounded-3xl border border-[#EAE0D6] bg-white px-6 py-16 text-center sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F5E9E6] text-[#81394B]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                className="h-7 w-7"
                aria-hidden="true"
              >
                <path d="M3 3h2l2.5 12.5a2 2 0 0 0 2 1.5h7.8a2 2 0 0 0 2-1.6L21 8H6" />
                <circle cx="10" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
            </div>

            <h2 className="mt-6 font-serif text-2xl italic text-[#29211F]">
              Un peu de douceur vous attend
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#84756E]">
              Votre panier est encore vide. Découvrez notre collection et
              trouvez les pièces qui vous ressemblent.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-[#81394B] px-7 py-3.5 text-[10px] uppercase tracking-[0.2em] text-white transition hover:bg-[#652A3A]"
            >
              Découvrir la collection
            </Link>
          </section>
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3 lg:gap-10">
            {/* Liste des articles */}
            <section className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-serif text-xl italic">Vos articles</h2>
                <span className="text-xs text-[#A2948C]">
                  {items.length} référence{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <article
                    key={item.variantId}
                    className="rounded-2xl border border-[#EAE0D6] bg-white p-4 transition hover:shadow-[0_8px_30px_rgba(41,33,31,0.04)] sm:p-5"
                  >
                    <div className="flex gap-4 sm:gap-6">
                      {/* Image produit */}
                      <Link
                        href={`/produits/${item.productSlug}`}
                        className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F5F0EA] sm:h-40 sm:w-32"
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.productName}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 96px, 128px"
                            className="object-cover transition duration-500 hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-[#A2948C]">
                            Sans image
                          </div>
                        )}
                      </Link>

                      {/* Informations produit */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-5">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <Link
                                href={`/produits/${item.productSlug}`}
                                className="font-serif text-lg italic text-[#29211F] transition hover:text-[#81394B] sm:text-xl"
                              >
                                {item.productName}
                              </Link>

                              <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#95857D]">
                                Taille : {item.size}
                              </p>

                              <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[#95857D]">
                                Couleur : {item.color}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.variantId)}
                              aria-label={`Retirer ${item.productName} du panier`}
                              className="shrink-0 text-xs text-[#A2948C] transition hover:text-[#81394B]"
                            >
                              Retirer
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-end justify-between gap-4">
                          {/* Quantité */}
                          <div>
                            <p className="mb-2 text-[9px] uppercase tracking-[0.18em] text-[#A2948C]">
                              Quantité
                            </p>

                            <div className="inline-flex items-center rounded-full border border-[#EAE0D6]">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.variantId,
                                    item.quantity - 1
                                  )
                                }
                                aria-label={`Diminuer la quantité de ${item.productName}`}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-[#81394B] transition hover:bg-[#F5E9E6]"
                              >
                                −
                              </button>

                              <span className="w-8 text-center text-sm tabular-nums">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.variantId,
                                    item.quantity + 1
                                  )
                                }
                                disabled={item.quantity >= item.stock}
                                aria-label={`Augmenter la quantité de ${item.productName}`}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-[#81394B] transition hover:bg-[#F5E9E6] disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                +
                              </button>
                            </div>

                            {item.quantity >= item.stock && (
                              <p className="mt-2 text-[10px] text-[#A0783F]">
                                Stock maximal atteint
                              </p>
                            )}
                          </div>

                          {/* Prix */}
                          <div className="text-right">
                            <p className="text-[10px] text-[#A2948C]">
                              {Number(item.price).toLocaleString("fr-FR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{" "}
                              € / unité
                            </p>

                            <p className="mt-1 font-serif text-xl text-[#81394B]">
                              {Number(item.price * item.quantity).toLocaleString(
                                "fr-FR",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}{" "}
                              €
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#81394B] transition hover:text-[#652A3A]"
              >
                <span aria-hidden="true">←</span>
                Continuer mes achats
              </Link>
            </section>

            {/* Récapitulatif */}
            <aside className="rounded-2xl border border-[#EAE0D6] bg-white p-6 shadow-[0_8px_30px_rgba(41,33,31,0.03)] sm:p-7 lg:sticky lg:top-8">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#B99A61]">
                Votre commande
              </p>

              <h2 className="mt-3 font-serif text-2xl italic text-[#29211F]">
                Récapitulatif
              </h2>

              <div className="mt-7 space-y-4 border-b border-[#EAE0D6] pb-5">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-[#84756E]">
                    Sous-total ({itemCount} article{itemCount !== 1 ? "s" : ""})
                  </span>
                  <span className="font-medium tabular-nums">
                    {subtotal.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    €
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-[#84756E]">Livraison</span>
                  <span className="text-xs text-[#A2948C]">
                    Adresse saisie à l&apos;étape suivante
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between gap-4 py-5">
                <span className="text-xs uppercase tracking-[0.15em] text-[#84756E]">
                  Total
                </span>

                <span className="font-serif text-2xl text-[#81394B] tabular-nums">
                  {subtotal.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  €
                </span>
              </div>

              <Link
                href="/checkout"
                className="block w-full rounded-full bg-[#81394B] px-5 py-4 text-center text-[10px] uppercase tracking-[0.2em] text-white transition hover:bg-[#652A3A]"
              >
                Passer la commande
              </Link>

              <p className="mt-3 text-center text-[10px] leading-5 text-[#A2948C]">
                Vous devrez vous connecter ou créer un compte pour finaliser
                votre commande.
              </p>

              {/* Réassurance */}
              <div className="mt-7 space-y-4 border-t border-[#EAE0D6] pt-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5E9E6] text-[#81394B]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M12 3 19 6v5c0 4.5-3 7.5-7 10-4-2.5-7-5.5-7-10V6l7-3Z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-medium text-[#29211F]">
                      Une sélection soignée
                    </p>
                    <p className="mt-1 text-[10px] text-[#A2948C]">
                      Chaque détail compte
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5E9E6] text-[#81394B]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
                      <circle cx="7.5" cy="19" r="2" />
                      <circle cx="17.5" cy="19" r="2" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-medium text-[#29211F]">
                      Livraison
                    </p>
                    <p className="mt-1 text-[10px] text-[#A2948C]">
                      Modalités précisées à la commande
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}