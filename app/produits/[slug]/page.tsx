import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Playfair_Display, Poppins } from "next/font/google";
import VariantSelector from "./variant-selector";
import CartIcon from "@/app/components/CartIcon";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-body" });

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: true, category: true, variants: true },
  });

  if (!product) notFound();

  return (
    <main
      className={`${playfair.variable} ${poppins.variable} min-h-screen bg-[#FBF5F0] font-[family-name:var(--font-body)] text-[#3D302C]`}
    >
      <CartIcon />

      <header className="px-6 py-6 sm:px-12">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.3em] text-[#B0A29B] hover:text-[#C4877E]"
        >
          ← Retour à la collection
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-10 px-6 pb-20 sm:px-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-white shadow-[0_4px_30px_rgba(196,135,126,0.1)]">
          {product.images[0] && (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              unoptimized
              className="object-cover"
            />
          )}
        </div>

        <div className="lg:pt-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C4877E]">
            {product.category.name}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl italic leading-tight text-[#3D302C] sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 font-[family-name:var(--font-display)] text-2xl text-[#C4877E]">
            {Number(product.price).toFixed(2)} €
          </p>

          <p className="mt-8 max-w-md text-sm leading-relaxed text-[#7A6B65]">
            {product.description}
          </p>

          <div className="mt-10">
            <VariantSelector
              variants={product.variants}
              productName={product.name}
              productSlug={product.slug}
              price={Number(product.price)}
              image={product.images[0]?.url ?? null}
            />
          </div>
        </div>
      </div>
    </main>
  );
}