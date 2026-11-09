import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";
import Link from "next/link";


export default async function AdminProductsPage() {
  const products = await withRetry(() =>
    prisma.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  );

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) =>
      total +
      product.variants.reduce((sum, variant) => sum + variant.stock, 0),
    0
  );

  const lowStockProducts = products.filter((product) => {
    const stock = product.variants.reduce(
      (sum, variant) => sum + variant.stock,
      0
    );

    return stock < 5;
  }).length;

  return (
    <div className="min-h-screen bg-[#FAF7F2] p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#B99A61]">
            Boutique · Administration
          </p>

          <h1 className="font-[family-name:var(--font-display)] text-3xl italic text-[#29211F] sm:text-4xl">
            Nos produits
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#84756E]">
            Gérez votre catalogue, surveillez les stocks et gardez votre
            boutique à jour.
          </p>
        </div>

        <Link
          href="/admin/produits/nouveau"
          className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#81394B] px-6 py-3 text-xs font-medium uppercase tracking-[0.15em] text-white transition hover:bg-[#652A3A] sm:self-auto"
        >
          <span className="text-lg leading-none">+</span>
          Ajouter un produit
        </Link>
      </div>

      {/* Indicateurs */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#EAE0D6] bg-white p-5 shadow-[0_4px_20px_rgba(41,33,31,0.03)]">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.15em] text-[#84756E]">
              Produits au catalogue
            </p>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5E9E6] text-[#81394B]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
                <path d="m4.5 7.7 7.5 4.4 7.5-4.4M12 12v9M8 5.3l8 4.5" />
              </svg>
            </span>
          </div>
          <p className="mt-5 font-[family-name:var(--font-display)] text-4xl text-[#29211F]">
            {totalProducts.toString().padStart(2, "0")}
          </p>
          <p className="mt-2 text-xs text-[#A2948C]">
            Références enregistrées
          </p>
        </div>

        <div className="rounded-2xl border border-[#EAE0D6] bg-white p-5 shadow-[0_4px_20px_rgba(41,33,31,0.03)]">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.15em] text-[#84756E]">
              Stock disponible
            </p>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF0E8] text-[#637B60]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M5 12.5 9.5 17 19 7.5" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </span>
          </div>
          <p className="mt-5 font-[family-name:var(--font-display)] text-4xl text-[#29211F]">
            {totalStock.toLocaleString("fr-FR")}
          </p>
          <p className="mt-2 text-xs text-[#A2948C]">
            Unités toutes variantes confondues
          </p>
        </div>

        <div className="rounded-2xl border border-[#EAE0D6] bg-white p-5 shadow-[0_4px_20px_rgba(41,33,31,0.03)]">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.15em] text-[#84756E]">
              Stocks faibles
            </p>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FBF0DF] text-[#B07836]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M12 3 22 20H2L12 3Z" />
                <path d="M12 9v5M12 17.5v.1" />
              </svg>
            </span>
          </div>
          <p className="mt-5 font-[family-name:var(--font-display)] text-4xl text-[#B07836]">
            {lowStockProducts.toString().padStart(2, "0")}
          </p>
          <p className="mt-2 text-xs text-[#A2948C]">
            Produits avec moins de 5 unités
          </p>
        </div>
      </div>

      {/* Tableau des produits */}
      <div className="overflow-hidden rounded-2xl border border-[#EAE0D6] bg-white shadow-[0_4px_24px_rgba(41,33,31,0.04)]">
        <div className="flex flex-col gap-2 border-b border-[#EEE5DD] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[#29211F]">
              Catalogue
            </h2>
            <p className="mt-1 text-xs text-[#A2948C]">
              Les produits les plus récemment ajoutés apparaissent en premier.
            </p>
          </div>

          <span className="self-start rounded-full bg-[#F5E9E6] px-3 py-1.5 text-xs text-[#81394B]">
            {totalProducts} produit{totalProducts !== 1 ? "s" : ""}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F5E9E6] text-[#81394B]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-7 w-7"
                aria-hidden="true"
              >
                <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
                <path d="M12 12v9M4.5 7.7 12 12l7.5-4.3" />
              </svg>
            </div>

            <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl text-[#29211F]">
              Votre catalogue est encore vide
            </h3>

            <p className="mt-2 text-sm text-[#84756E]">
              Ajoutez votre premier produit pour commencer.
            </p>

            <Link
              href="/admin/produits/nouveau"
              className="mt-6 inline-flex rounded-full bg-[#81394B] px-5 py-3 text-xs uppercase tracking-widest text-white transition hover:bg-[#652A3A]"
            >
              Créer un produit
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#EEE5DD] bg-[#FCFAF7] text-[10px] uppercase tracking-[0.16em] text-[#95857D]">
                  <th className="px-6 py-4 font-medium">Produit</th>
                  <th className="px-6 py-4 font-medium">Catégorie</th>
                  <th className="px-6 py-4 font-medium">Prix</th>
                  <th className="px-6 py-4 font-medium">Stock total</th>
                  <th className="px-6 py-4 font-medium">Variantes</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const stock = product.variants.reduce(
                    (sum, variant) => sum + variant.stock,
                    0
                  );

                  const isOutOfStock = stock === 0;
                  const isLowStock = stock > 0 && stock < 5;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-[#F2ECE6] transition hover:bg-[#FCFAF7] last:border-0"
                    >
                      <td className="px-6 py-5">
                        <div className="font-medium text-[#29211F]">
                          {product.name}
                        </div>
                        <div className="mt-1 text-xs text-[#A2948C]">
                          Réf. {product.id}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full bg-[#F7F1EB] px-3 py-1.5 text-xs text-[#79665D]">
                          {product.category.name}
                        </span>
                      </td>

                      <td className="px-6 py-5 font-medium text-[#29211F]">
                        {Number(product.price).toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        €
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                            isOutOfStock
                              ? "bg-[#FBE8E7] text-[#A63838]"
                              : isLowStock
                                ? "bg-[#FBF0DF] text-[#9A652B]"
                                : "bg-[#EAF0E8] text-[#55734F]"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isOutOfStock
                                ? "bg-[#A63838]"
                                : isLowStock
                                  ? "bg-[#9A652B]"
                                  : "bg-[#55734F]"
                            }`}
                          />
                          {stock} unité{stock !== 1 ? "s" : ""}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-[#79665D]">
                        {product.variants.length}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/admin/produits/${product.id}`}
                          className="inline-flex items-center gap-2 rounded-full border border-[#EAE0D6] px-4 py-2 text-xs font-medium text-[#81394B] transition hover:border-[#81394B] hover:bg-[#F8F0EF]"
                        >
                          Modifier
                          <span aria-hidden="true">→</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-[#EEE5DD] bg-[#FCFAF7] px-5 py-4 sm:px-6">
          <p className="text-xs text-[#A2948C]">
            Douceur & Élégance · Gestion du catalogue
          </p>
        </div>
      </div>
    </div>
  );
}