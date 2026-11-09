import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Jost, La_Belle_Aurore } from "next/font/google";
import CartIcon from "@/app/components/CartIcon";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});
const hand = La_Belle_Aurore({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-hand",
});
const body = Jost({ subsets: ["latin"], variable: "--font-body" });

// La pièce mise en avant dans le hero (change ce nom pour mettre un autre produit en avant)
const FEATURED_SLUG = "blouse-romantique-blanche";

const DISPLAY = "font-[family-name:var(--font-display)]";
const HAND = "font-[family-name:var(--font-hand)]";
const SHADOW = "shadow-[0_22px_44px_-14px_rgba(42,27,32,0.3)]";
const H2 = `${DISPLAY} text-[2.6rem] font-normal italic leading-[1.05] sm:text-[3.4rem]`;
const GOLD_HOVER =
  "outline-1 outline-offset-[6px] outline-transparent transition-colors duration-500 group-hover:outline-[#B8975A]";
const SMALL_CAPS = "text-[13px] uppercase tracking-[0.2em]";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
const NEW_DAYS = 45;

const PERKS = [
  { icon: "truck", title: "Livraison offerte", text: "dès 60 € d’achat" },
  { icon: "return", title: "Retours simples", text: "sous 30 jours" },
  { icon: "lock", title: "Paiement sécurisé", text: "vos données protégées" },
  { icon: "gift", title: "Emballage soigné", text: "prêt à offrir" },
] as const;

const VALUES = [
  {
    title: "Des matières naturelles",
    text: "Lin, coton, satin : des tissus agréables à porter, saison après saison.",
  },
  {
    title: "Des coupes pensées",
    text: "Des lignes simples qui flattent et se marient facilement entre elles.",
  },
  {
    title: "De petites séries",
    text: "Peu de pièces par modèle, pour que votre robe reste la vôtre.",
  },
];

const REVIEWS = [
  {
    name: "Camille, Lyon",
    text: "La robe en lin est encore plus jolie en vrai. Le tombé est parfait et la matière est très douce.",
  },
  {
    name: "Sarah, Paris",
    text: "Colis soigné, livré vite, et la jupe plissée va avec tout. Je recommande les yeux fermés.",
  },
  {
    name: "Léa, Bordeaux",
    text: "Enfin une boutique où les tailles correspondent vraiment. J’ai déjà commandé une deuxième robe.",
  },
];

const FAQ = [
  {
    q: "Quels sont les délais de livraison ?",
    a: "La livraison est offerte dès 60 € d’achat. Chaque commande est préparée avec soin et expédiée sous 2 à 3 jours ouvrés.",
  },
  {
    q: "Puis-je retourner un article ?",
    a: "Oui. Vous disposez de 30 jours après réception pour retourner une pièce non portée, dans son état d’origine.",
  },
  {
    q: "Comment suivre ma commande ?",
    a: "Connectez-vous et ouvrez « Mes commandes » : le statut de chaque commande y est mis à jour à chaque étape (en préparation, expédiée, livrée).",
  },
  {
    q: "Comment prendre soin de mes pièces ?",
    a: "Nous recommandons un lavage délicat à basse température et un séchage à l’air libre, pour préserver la douceur des matières naturelles.",
  },
];

const FOOTER_COLUMNS = [
  {
    title: "Boutique",
    links: [
      { label: "La collection", href: "#collection" },
      { label: "La sélection de la maison", href: "#selection" },
      { label: "Mon panier", href: "/panier" },
    ],
  },
  {
    title: "Mon compte",
    links: [
      { label: "Connexion", href: "/connexion" },
      { label: "Créer un compte", href: "/inscription" },
      { label: "Mes commandes", href: "/mes-commandes" },
    ],
  },
  {
    title: "La maison",
    links: [
      { label: "Notre histoire", href: "#histoire" },
      { label: "Les avis", href: "#avis" },
      { label: "Questions fréquentes", href: "#faq" },
    ],
  },
];

// Ornements de la liane : position verticale et fenêtre de défilement associée
const VINE_ORNAMENTS = [
  { top: "75%", cls: "rv-vb1" },
  { top: "50%", cls: "rv-vb2" },
  { top: "25%", cls: "rv-vb3" },
  { top: "4%", cls: "rv-vb4" },
];

const CSS = `
html { scroll-behavior: smooth; }
.rv-root [id] { scroll-margin-top: 1.5rem; }
.rv-root a:focus-visible,
.rv-root button:focus-visible,
.rv-root input:focus-visible,
.rv-root summary:focus-visible { outline: 2px solid #7A2D40; outline-offset: 3px; }

/* Scène du hero : titre puis branchage */
.rv-line { display: block; opacity: 0; transform: translateY(0.35em); filter: blur(6px); animation: rv-line 1.1s cubic-bezier(.2,.7,.2,1) forwards; }
@keyframes rv-line { to { opacity: 1; transform: none; filter: blur(0); } }

.rv-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: rv-draw 2.4s cubic-bezier(.45,.05,.25,1) .5s forwards; }
.rv-leaf { opacity: 0; transform-box: fill-box; transform-origin: 0 50%; animation: rv-leaf .8s ease-out forwards; }
@keyframes rv-draw { to { stroke-dashoffset: 0; } }
@keyframes rv-leaf { from { opacity: 0; transform: scale(.2); } to { opacity: 1; transform: scale(1); } }

/* Liane qui pousse avec le défilement */
@keyframes rv-vine { from { stroke-dashoffset: .92; } to { stroke-dashoffset: 0; } }
@keyframes rv-bloom { from { opacity: 0; transform: scale(.2) rotate(-40deg); } to { opacity: 1; transform: scale(1) rotate(0deg); } }
@supports (animation-timeline: scroll()) {
  .rv-vine-stem { stroke-dasharray: 1; stroke-dashoffset: .92; animation: rv-vine linear both; animation-timeline: scroll(root); }
  .rv-vine-bloom { opacity: 0; animation: rv-bloom linear both; animation-timeline: scroll(root); }
  .rv-vb1 { animation-range: 12% 20%; }
  .rv-vb2 { animation-range: 40% 48%; }
  .rv-vb3 { animation-range: 68% 76%; }
  .rv-vb4 { animation-range: 90% 98%; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .rv-line { animation: none; opacity: 1; transform: none; filter: none; }
  .rv-draw { animation: none; stroke-dashoffset: 0; }
  .rv-leaf { animation: none; opacity: 1; }
  .rv-vine-stem { animation: none; stroke-dashoffset: 0; }
  .rv-vine-bloom { animation: none; opacity: 1; }
}
`;

const euro = (value: unknown) =>
  `${Number(value).toFixed(2).replace(".", ",")}\u00a0€`;

function sizeLabel(sizes: string[]) {
  if (sizes.length === 0) return "";
  if (sizes.length === 1) return `taille ${sizes[0]}`;
  return `du ${sizes[0]} au ${sizes[sizes.length - 1]}`;
}

const pill = (active: boolean) =>
  `border px-5 py-2.5 text-[12px] uppercase tracking-[0.18em] transition ${
    active
      ? "border-[#5A1E2E] bg-[#5A1E2E] text-[#F7F1E8]"
      : "border-[#D8C39A] text-[#6B5A5C] hover:border-[#5A1E2E] hover:text-[#5A1E2E]"
  }`;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const { categorie } = await searchParams;
  const nowMs = new Date().getTime();

  // Deux requêtes seulement : plus fiable avec ta connexion à Supabase
  const all = await withRetry(() =>
    prisma.product.findMany({
      include: { images: true, category: true, variants: true },
      orderBy: { createdAt: "desc" },
    })
  );
  const categories = await withRetry(() =>
    prisma.category.findMany({ orderBy: { name: "asc" } })
  );

  type P = (typeof all)[number];
  const stockOf = (p: P) => p.variants.reduce((sum, v) => sum + v.stock, 0);
  const sizesOf = (p: P) =>
    [...new Set(p.variants.map((v) => v.size as string))].sort(
      (a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b)
    );
  const isNew = (p: P) => nowMs - p.createdAt.getTime() < NEW_DAYS * 86400000;

  const activeCategory = categories.find((c) => c.slug === categorie);
  const shown = categorie ? all.filter((p) => p.category.slug === categorie) : all;

  // La pièce du moment : la blouse si elle existe, sinon la première pièce avec photo
  const featured =
    all.find((p) => p.slug === FEATURED_SLUG) ?? all.find((p) => p.images[0]);
  const picks = all.filter((p) => p.id !== featured?.id).slice(0, 3);

  const categoryCards = categories
    .map((c) => {
      const inCategory = all.filter((p) => p.category.id === c.id);
      const cover = inCategory.find((p) => p.images[0]);
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        count: inCategory.length,
        image: cover?.images[0]?.url,
      };
    })
    .filter((c) => c.count > 0);

  const pickLayouts = [
    { col: "md:col-span-5", aspect: "aspect-[3/4]" },
    { col: "md:col-span-4 md:mt-24", aspect: "aspect-[4/5]" },
    { col: "md:col-span-3 md:mt-8", aspect: "aspect-[3/4]" },
  ];

  return (
    <main
      className={`${display.variable} ${hand.variable} ${body.variable} rv-root relative min-h-screen overflow-x-clip bg-[#F7F1E8] font-[family-name:var(--font-body)] text-[17px] leading-relaxed text-[#2A1B20]`}
    >
      <style>{CSS}</style>

      {/* Grain de papier */}
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 h-full w-full opacity-[0.14] mix-blend-multiply"
      >
        <filter id="paper">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.42  0 0 0 0 0.3  0 0 0 0 0.28  1.3 0 0 0 -0.4"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper)" />
      </svg>

      <Vine />
      <CartIcon />

      {/* EN-TÊTE */}
      <header className="relative z-10 px-6 pt-20 sm:px-12 sm:pt-5">
        <div className="mx-auto grid max-w-6xl items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <nav
            className={`hidden items-center gap-8 text-[#6B5A5C] lg:flex ${SMALL_CAPS}`}
          >
            <Link href="#collection" className="hover:text-[#7A2D40]">
              Collection
            </Link>
            <Link href="#selection" className="hover:text-[#7A2D40]">
              Sélection
            </Link>
            <Link href="#histoire" className="hover:text-[#7A2D40]">
              Histoire
            </Link>
          </nav>

          <Link href="/" className="mx-auto flex items-center gap-3">
            <Seal className="h-12 w-12" />
            <span className="leading-none">
              <span className={`${DISPLAY} block text-[1.7rem] italic`}>
                Douceur &amp; Élégance
              </span>
              <span className="mt-1 block text-[10px] uppercase tracking-[0.35em] text-[#8F6F32]">
                Prêt-à-porter
              </span>
            </span>
          </Link>

          <div className="hidden lg:block" />
        </div>
      </header>

      {/* HERO */}
      <section className="relative px-6 pb-28 pt-10 sm:px-12 lg:pt-14">
        <Glow className="-left-24 top-0 h-[28rem] w-[28rem]" color="#EBD9C4" />
        <Glow className="right-0 top-40 h-[26rem] w-[26rem]" color="#DCE3D3" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-center lg:text-left">
            <span
              aria-hidden="true"
              className="mx-auto mb-7 block h-px w-16 bg-[#B8975A] lg:mx-0"
            />
            <h1
              className={`${DISPLAY} text-[3.1rem] font-normal italic leading-[0.98] tracking-[-0.01em] sm:text-[4.5rem] lg:text-[5.6rem]`}
            >
              <span className="rv-line" style={{ animationDelay: "0.1s" }}>
                Des pièces douces,
              </span>
              <span className="rv-line" style={{ animationDelay: "0.35s" }}>
                comme un jardin
              </span>
              <span className="rv-line" style={{ animationDelay: "0.6s" }}>
                au petit matin.
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-md text-[#6B5A5C] lg:mx-0">
              Robes, jupes et blouses dans des matières naturelles, choisies
              pour leur tombé et leur douceur. Des petites séries, jamais plus.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8 lg:justify-start">
              <Link
                href="#collection"
                className={`bg-[#5A1E2E] px-9 py-4 font-medium text-[#F7F1E8] outline outline-1 -outline-offset-4 outline-[#B8975A]/60 transition hover:bg-[#7A2D40] ${SMALL_CAPS}`}
              >
                Voir la collection
              </Link>
              <Link
                href="#histoire"
                className={`border-b border-[#B8975A] pb-1 font-medium text-[#5A1E2E] hover:text-[#7A2D40] ${SMALL_CAPS}`}
              >
                Notre histoire
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
            <Sprig draw className="absolute -right-14 -top-6 z-0 h-[108%] w-36" />
            <Sprig
              leaf="#B9C4AE"
              className="absolute -left-12 bottom-16 z-0 h-56 w-28 -scale-x-100"
            />

            <ArchFrame double className="z-10">
              <Photo
                src={featured?.images[0]?.url}
                alt={featured ? featured.name : ""}
                priority
              />
            </ArchFrame>
            <Seal className="absolute -bottom-7 -left-7 z-20 h-24 w-24 -rotate-12 drop-shadow-[0_10px_12px_rgba(42,27,32,0.3)]" />

            {featured && (
              <div className="relative z-10 mt-16 text-center">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#8F6F32]">
                  La pièce du moment
                </p>
                <Link
                  href={`/produits/${featured.slug}`}
                  className="group mt-3 block"
                >
                  <span
                    className={`${DISPLAY} block text-[2rem] italic leading-tight transition group-hover:text-[#7A2D40]`}
                  >
                    {featured.name}
                  </span>
                </Link>
                <p className="mt-1 text-[#7A2D40]">{euro(featured.price)}</p>
                <Link
                  href={`/produits/${featured.slug}`}
                  className={`mt-5 inline-block border-b border-[#B8975A] pb-0.5 text-[#5A1E2E] hover:text-[#7A2D40] ${SMALL_CAPS}`}
                >
                  Découvrir la pièce
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ENGAGEMENTS */}
      <section className="relative z-10 bg-[#FCF8F0] px-6 py-12 sm:px-12">
        <Scallop id="scallop-perks" color="#FCF8F0" />
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {PERKS.map((perk) => (
            <li
              key={perk.title}
              className="flex flex-col items-center gap-3 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#B8975A]/70 text-[#5A1E2E]">
                <PerkIcon type={perk.icon} />
              </span>
              <div>
                <p className={`${DISPLAY} text-xl italic leading-tight`}>
                  {perk.title}
                </p>
                <p className="mt-0.5 text-sm text-[#6B5A5C]">{perk.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* UNIVERS */}
      {categoryCards.length > 0 && (
        <section id="univers" className="relative px-6 py-28 sm:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 max-w-xl">
              <h2 className={H2}>Choisissez votre univers</h2>
              <p className="mt-4 text-[#6B5A5C]">
                Cliquez sur une arche pour découvrir les pièces.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-14 lg:grid-cols-4 lg:gap-x-8">
              {categoryCards.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/?categorie=${c.slug}#collection`}
                  className={`group block ${i % 2 === 1 ? "lg:mt-14" : ""}`}
                >
                  <div
                    className={`relative aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-xl bg-[#EADFCB] ${SHADOW} ${GOLD_HOVER}`}
                  >
                    <Photo src={c.image} alt="" />
                  </div>
                  <p className={`${DISPLAY} mt-6 text-[1.8rem] italic leading-none`}>
                    {c.name}
                  </p>
                  <p className="mt-1.5 text-sm text-[#6B5A5C]">
                    {c.count} pièce{c.count > 1 ? "s" : ""}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COLLECTION */}
      <section id="collection" className="relative px-6 pb-28 pt-8 sm:px-12">
        <Glow className="-right-32 top-20 h-[26rem] w-[26rem]" color="#DCE3D3" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className={H2}>Toute la collection</h2>
              <p className="mt-3 text-[#6B5A5C]">
                {shown.length} pièce{shown.length > 1 ? "s" : ""}
                {activeCategory ? ` dans « ${activeCategory.name} »` : ""}
              </p>
            </div>

            <nav
              aria-label="Filtrer par catégorie"
              className="flex flex-wrap gap-2"
            >
              <Link href="/#collection" className={pill(!categorie)}>
                Tout voir
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/?categorie=${cat.slug}#collection`}
                  className={pill(categorie === cat.slug)}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          {shown.length === 0 ? (
            <p className="py-16 text-[#6B5A5C]">
              Aucune pièce dans cette catégorie pour l&apos;instant.{" "}
              <Link href="/#collection" className="text-[#7A2D40] underline">
                Voir toute la collection
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-7">
              {shown.map((p) => {
                const stock = stockOf(p);
                const sizes = sizeLabel(sizesOf(p));

                return (
                  <Link
                    key={p.id}
                    href={`/produits/${p.slug}`}
                    className="group block"
                  >
                    <div
                      className={`relative aspect-[3/4] overflow-hidden rounded-t-[4.5rem] rounded-b-xl bg-[#EADFCB] ring-1 ring-[#E3D3B4] ${GOLD_HOVER}`}
                    >
                      <Photo
                        src={p.images[0]?.url}
                        alt={p.name}
                        className={stock === 0 ? "opacity-60 saturate-50" : ""}
                      />
                      {stock === 0 && <StockTag>Épuisé</StockTag>}
                      {stock > 0 && stock <= 4 && (
                        <StockTag>Plus que {stock}</StockTag>
                      )}
                    </div>

                    <div className="mt-5 text-center">
                      {isNew(p) && (
                        <p className="mb-1 text-[11px] uppercase tracking-[0.3em] text-[#8F6F32]">
                          Nouveau
                        </p>
                      )}
                      <p
                        className={`${DISPLAY} text-[1.55rem] italic leading-tight transition group-hover:text-[#7A2D40]`}
                      >
                        {p.name}
                      </p>
                      <p className="mt-1 text-sm text-[#6B5A5C]">
                        {p.category.name}
                        {sizes ? `, ${sizes}` : ""}
                      </p>
                      <p className="mt-2 font-medium text-[#7A2D40]">
                        {euro(p.price)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* SÉLECTION DE LA MAISON */}
      {picks.length > 0 && (
        <section
          id="selection"
          className="relative bg-[#F1E7D6] px-6 py-28 sm:px-12"
        >
          <div className="relative mx-auto max-w-6xl">
            <div className="mb-20 max-w-xl">
              <h2 className={H2}>La sélection de la maison</h2>
              <p className="mt-4 text-[#6B5A5C]">
                Les pièces que nous aimons particulièrement en ce moment.
              </p>
            </div>

            <div className="grid items-start gap-16 md:grid-cols-12 md:gap-10">
              {picks.map((p, i) => {
                const layout = pickLayouts[i] ?? pickLayouts[0];
                return (
                  <Link
                    key={p.id}
                    href={`/produits/${p.slug}`}
                    className={`group block ${layout.col}`}
                  >
                    <div className="relative mx-3">
                      <div
                        aria-hidden="true"
                        className="absolute -inset-3 rounded-t-[999px] rounded-b-[1.75rem] border border-[#B8975A]/60 transition-colors duration-500 group-hover:border-[#B8975A]"
                      />
                      <div
                        className={`relative ${layout.aspect} overflow-hidden rounded-t-[999px] rounded-b-[1.25rem] bg-[#EADFCB] ${SHADOW}`}
                      >
                        <Photo src={p.images[0]?.url} alt={p.name} />
                      </div>
                    </div>
                    <div className="mt-9 text-center">
                      <p className={`${DISPLAY} text-3xl italic leading-tight`}>
                        {p.name}
                      </p>
                      <p className="mt-1 text-[#7A2D40]">{euro(p.price)}</p>
                      <span
                        className={`mt-4 inline-block border-b border-[#B8975A] pb-0.5 text-[#5A1E2E] ${SMALL_CAPS}`}
                      >
                        Découvrir
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* NOTRE HISTOIRE */}
      <section id="histoire" className="relative px-6 py-28 sm:px-12">
        <Glow className="-right-24 top-16 h-[26rem] w-[26rem]" color="#EBD9C4" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-20 lg:grid-cols-2">
          <div className="relative mx-auto w-full max-w-sm">
            <ArchFrame double>
              <div className="relative h-full w-full bg-gradient-to-b from-[#EFE4D2] via-[#F4EBDD] to-[#DFE5D8]">
                <Sprig className="absolute bottom-0 left-2 h-[82%] w-36" />
                <Sprig
                  leaf="#B9C4AE"
                  className="absolute bottom-0 right-2 h-[64%] w-28 -scale-x-100"
                />
                <Fleuron className="absolute left-1/2 top-[20%] h-9 w-9 -translate-x-1/2" />
              </div>
            </ArchFrame>
          </div>

          <div>
            <h2 className={H2}>Une mode qui prend son temps</h2>
            <p className="mt-7 max-w-lg text-[#6B5A5C]">
              Douceur &amp; Élégance est née d&apos;une envie simple : des
              vêtements qui se portent longtemps et qui font du bien. Chaque
              pièce est choisie pour sa matière, son tombé et la façon dont
              elle vieillit.
            </p>
            <p className="mt-4 max-w-lg text-[#6B5A5C]">
              Nous travaillons en petites séries, avec des tissus naturels,
              pour que chaque robe garde son allure d&apos;une saison à
              l&apos;autre.
            </p>

            <ul className="mt-10 max-w-lg divide-y divide-[#E3D3B4] border-y border-[#E3D3B4]">
              {VALUES.map((value) => (
                <li key={value.title} className="flex gap-4 py-5">
                  <Fleuron className="mt-2 h-4 w-4 shrink-0" />
                  <div>
                    <p className={`${DISPLAY} text-2xl italic leading-tight`}>
                      {value.title}
                    </p>
                    <p className="mt-1 text-[#6B5A5C]">{value.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p className={`${HAND} mt-10 text-3xl text-[#7A2D40]`}>
              Douceur &amp; Élégance
            </p>
          </div>
        </div>
      </section>

      {/* AVIS */}
      <section id="avis" className="relative px-6 py-28 sm:px-12">
        <div className="relative mx-auto max-w-6xl">
          <h2 className={`${H2} text-center`}>Ce qu&apos;elles en disent</h2>
          <Divider className="mt-6" />

          <div className="mt-16 grid divide-y divide-[#E3D3B4] border border-[#E3D3B4] bg-[#FCF8F0] md:grid-cols-3 md:divide-x md:divide-y-0">
            {REVIEWS.map((review) => (
              <figure key={review.name} className="p-9 text-center">
                <span
                  aria-hidden="true"
                  className={`${DISPLAY} block h-10 text-6xl leading-none text-[#B8975A]`}
                >
                  &ldquo;
                </span>
                <p
                  className="mt-4 text-[#B8975A]"
                  role="img"
                  aria-label="5 étoiles sur 5"
                >
                  ★★★★★
                </p>
                <blockquote
                  className={`${DISPLAY} mt-4 text-[1.4rem] italic leading-snug`}
                >
                  {review.text}
                </blockquote>
                <figcaption className={`${HAND} mt-6 text-2xl text-[#7A2D40]`}>
                  {review.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* QUESTIONS FRÉQUENTES */}
      <section id="faq" className="relative px-6 py-24 sm:px-12">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className={H2}>Vos questions</h2>
            <p className="mt-4 max-w-sm text-[#6B5A5C]">
              L&apos;essentiel pour commander en toute sérénité.
            </p>
          </div>

          <div className="divide-y divide-[#E3D3B4] border-y border-[#E3D3B4]">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 [&::-webkit-details-marker]:hidden">
                  <span className={`${DISPLAY} text-2xl italic leading-snug`}>
                    {item.q}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#B8975A] text-lg leading-none text-[#5A1E2E] transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-xl text-[#6B5A5C]">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CARTON D'INVITATION */}
      <section className="relative px-6 pb-32 pt-16 sm:px-12">
        <div className="relative mx-auto max-w-3xl">
          <Seal className="absolute left-1/2 top-0 z-10 h-20 w-20 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_10px_12px_rgba(42,27,32,0.3)]" />

          <div
            className={`border border-[#B8975A]/70 bg-[#FCF8F0] p-2 ${SHADOW}`}
          >
            <div className="relative overflow-hidden border border-[#B8975A]/40 px-8 pb-14 pt-20 text-center sm:px-16">
              <Sprig className="absolute -bottom-6 -right-4 h-52 w-28 opacity-70" />

              <h2
                className={`${DISPLAY} relative mx-auto max-w-lg text-[2.4rem] font-normal italic leading-[1.08] sm:text-5xl`}
              >
                Recevez 10&nbsp;% sur votre première commande
              </h2>
              <p className="relative mx-auto mt-5 max-w-md text-[#6B5A5C]">
                Inscrivez-vous pour recevoir votre code et être prévenue des
                nouvelles collections.
              </p>

              <form className="relative mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row">
                <label htmlFor="newsletter-email" className="sr-only">
                  Adresse email
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="Votre adresse email"
                  className="flex-1 border border-[#D8C39A] bg-[#F7F1E8] px-5 py-3.5 text-[15px] outline-none placeholder:text-[#8A7A7C] focus:border-[#5A1E2E]"
                />
                <button
                  type="submit"
                  className={`bg-[#5A1E2E] px-7 py-3.5 font-medium text-[#F7F1E8] transition hover:bg-[#7A2D40] ${SMALL_CAPS}`}
                >
                  Je m&apos;inscris
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* PIED DE PAGE */}
      <footer className="relative bg-[#3E1521] px-6 pb-10 pt-20 text-[#F1E7D6] sm:px-12">
        <Scallop id="scallop-footer" color="#3E1521" />

        <div className="mx-auto grid max-w-6xl gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Seal className="h-14 w-14" />
              <p className={`${DISPLAY} text-2xl italic leading-none`}>
                Douceur &amp; Élégance
              </p>
            </div>
            <p className="mt-5 max-w-xs text-[#C9B7B0]">
              Des robes, des jupes et des blouses douces, en petites séries.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className={`${DISPLAY} text-xl italic text-[#E8D5A6]`}>
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5 text-[#C9B7B0]">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-[#E8D5A6]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-14 max-w-6xl border-t border-[#5A2B38] pt-6 text-sm text-[#A8938F]">
          © {new Date().getFullYear()} Douceur &amp; Élégance
        </p>
      </footer>
    </main>
  );
}

/* ---------- Petits composants ---------- */

function Photo({
  src,
  alt,
  className,
  priority,
}: {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div
        aria-hidden="true"
        className="h-full w-full bg-gradient-to-br from-[#EFE4D2] via-[#F4EBDD] to-[#DFE5D8]"
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      priority={priority}
      className={`object-cover ${className ?? ""}`}
    />
  );
}

/* Arche avec fin cadre doré (et un second cadre légèrement penché) */
function ArchFrame({
  children,
  className = "",
  aspect = "aspect-[3/4]",
  double = false,
}: {
  children: ReactNode;
  className?: string;
  aspect?: string;
  double?: boolean;
}) {
  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden="true"
        className="absolute -inset-3 rounded-t-[999px] rounded-b-[2rem] border border-[#B8975A]/70"
      />
      {double && (
        <div
          aria-hidden="true"
          className="absolute -inset-[1.35rem] rotate-[-2.5deg] rounded-t-[999px] rounded-b-[2.25rem] border border-[#B8975A]/35"
        />
      )}
      <div
        className={`relative ${aspect} overflow-hidden rounded-t-[999px] rounded-b-[1.5rem] bg-[#EADFCB] ${SHADOW}`}
      >
        {children}
      </div>
    </div>
  );
}

/* Petit ruban de stock en bas de la photo */
function StockTag({ children }: { children: ReactNode }) {
  return (
    <span className="absolute bottom-0 left-0 bg-[#5A1E2E] px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-[#F7F1E8]">
      {children}
    </span>
  );
}

/* Voile de lumière très doux en arrière-plan */
function Glow({ className, color }: { className?: string; color: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute blur-3xl mix-blend-multiply ${
        className ?? ""
      }`}
      style={{
        borderRadius: "62% 38% 55% 45% / 48% 58% 42% 52%",
        background: `radial-gradient(circle at 35% 35%, ${color}, transparent 70%)`,
      }}
    />
  );
}

/* Bord en dentelle : petits festons qui montent sur la section précédente */
function Scallop({ id, color }: { id: string; color: string }) {
  return (
    <svg
      aria-hidden="true"
      className="absolute -top-[13px] left-0 h-[14px] w-full"
    >
      <defs>
        <pattern id={id} width="28" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 14 H28 A14 14 0 0 0 0 14 Z" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="14" fill={`url(#${id})`} />
    </svg>
  );
}

/* Fleuron : petite étoile à quatre branches, ornement doré */
function Fleuron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 1 L14.2 9.8 L23 12 L14.2 14.2 L12 23 L9.8 14.2 L1 12 L9.8 9.8 Z"
        fill="#B8975A"
      />
    </svg>
  );
}

function Divider({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`mx-auto flex w-56 items-center gap-3 ${className}`}
    >
      <span className="h-px flex-1 bg-[#B8975A]/60" />
      <Fleuron className="h-4 w-4" />
      <span className="h-px flex-1 bg-[#B8975A]/60" />
    </div>
  );
}

/* Sceau de cire monogramme */
function sealPath(r = 46, bumps = 22, amp = 2.2, steps = 240) {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const rr = r + amp * Math.sin(bumps * t);
    pts.push(
      `${(50 + rr * Math.cos(t)).toFixed(2)} ${(50 + rr * Math.sin(t)).toFixed(2)}`
    );
  }
  return `M${pts.join(" L")} Z`;
}
const SEAL_PATH = sealPath();

function Seal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path d={SEAL_PATH} fill="#5A1E2E" />
      <path
        d={SEAL_PATH}
        fill="none"
        stroke="#2A0E16"
        strokeOpacity="0.4"
        strokeWidth="1"
      />
      <circle cx="50" cy="50" r="36" fill="none" stroke="#D8BE82" strokeWidth="1.4" />
      <circle
        cx="50"
        cy="50"
        r="32.5"
        fill="none"
        stroke="#D8BE82"
        strokeOpacity="0.55"
        strokeWidth="0.6"
      />
      <path
        d="M22 34 A 34 34 0 0 1 58 16"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.14"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <text
        x="50"
        y="59"
        textAnchor="middle"
        fontSize="27"
        fill="#E8D5A6"
        style={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontStyle: "italic",
        }}
      >
        D&amp;É
      </text>
    </svg>
  );
}

/* Liane qui pousse sur le bord gauche pendant le défilement (grands écrans) */
function Vine() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-1 top-0 z-30 hidden h-screen w-12 xl:block"
    >
      <svg
        viewBox="0 0 60 1000"
        preserveAspectRatio="none"
        className="h-full w-full"
        fill="none"
      >
        <path
          className="rv-vine-stem"
          pathLength={1}
          d="M30 1000 C 8 925, 8 825, 30 750 C 52 675, 52 575, 30 500 C 8 425, 8 325, 30 250 C 52 175, 52 75, 30 0"
          stroke="#4F5E4A"
          strokeOpacity="0.5"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>

      {VINE_ORNAMENTS.map((ornament) => (
        <div
          key={ornament.top}
          className={`rv-vine-bloom ${ornament.cls} absolute left-1/2 -translate-x-1/2 -translate-y-1/2`}
          style={{ top: ornament.top }}
        >
          <Fleuron className="h-6 w-6" />
        </div>
      ))}
    </div>
  );
}

const SPRIG_LEAVES = [
  [34, 182, -35, 1],
  [34, 182, 212, 0.95],
  [41, 148, -40, 1.05],
  [41, 148, 215, 0.9],
  [51, 112, -45, 1],
  [51, 112, 222, 0.85],
  [63, 70, -50, 0.85],
  [63, 70, 226, 0.75],
  [78, 20, -82, 0.7],
] as const;

/* Branchage d'olivier : feuilles fines, baies dorées */
function Sprig({
  className,
  leaf = "#9DB097",
  draw = false,
}: {
  className?: string;
  leaf?: string;
  draw?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 120 220"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M30 215 C 34 160, 52 110, 78 20"
        pathLength={1}
        className={draw ? "rv-draw" : undefined}
        stroke="#4F5E4A"
        strokeOpacity="0.75"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {SPRIG_LEAVES.map(([x, y, angle, scale], i) => (
        <g
          key={i}
          transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}
        >
          <g
            className={draw ? "rv-leaf" : undefined}
            style={draw ? { animationDelay: `${0.9 + i * 0.2}s` } : undefined}
          >
            <path
              d="M0 0 C 8 -5, 24 -6, 34 0 C 24 6, 8 5, 0 0 Z"
              fill={leaf}
              fillOpacity="0.65"
              stroke="#4F5E4A"
              strokeOpacity="0.65"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
            <path
              d="M2 0 L 29 0"
              stroke="#4F5E4A"
              strokeOpacity="0.45"
              strokeWidth="0.7"
              strokeLinecap="round"
            />
          </g>
        </g>
      ))}

      <g
        className={draw ? "rv-leaf" : undefined}
        style={draw ? { animationDelay: "2.6s" } : undefined}
      >
        <ellipse cx="88" cy="38" rx="3.2" ry="4.2" fill="#B8975A" fillOpacity="0.85" />
        <ellipse cx="94" cy="26" rx="2.6" ry="3.4" fill="#B8975A" fillOpacity="0.7" />
        <ellipse cx="83" cy="12" rx="2.2" ry="3" fill="#B8975A" fillOpacity="0.6" />
      </g>
    </svg>
  );
}

function PerkIcon({ type }: { type: (typeof PERKS)[number]["icon"] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {type === "truck" && (
        <>
          <path d="M3 7h11v9H3z" />
          <path d="M14 10h4l3 3v3h-7z" />
          <circle cx="7" cy="18" r="1.8" />
          <circle cx="17" cy="18" r="1.8" />
        </>
      )}
      {type === "return" && (
        <>
          <path d="M20 12a8 8 0 1 1-2.4-5.7" />
          <path d="M20 4v5h-5" />
        </>
      )}
      {type === "lock" && (
        <>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </>
      )}
      {type === "gift" && (
        <>
          <path d="M4 12h16v8H4z" />
          <path d="M3 8h18v4H3z" />
          <path d="M12 8v12" />
          <path d="M12 8c-2-4-6-3-5 0" />
          <path d="M12 8c2-4 6-3 5 0" />
        </>
      )}
    </svg>
  );
}