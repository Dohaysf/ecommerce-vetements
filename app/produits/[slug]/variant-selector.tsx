"use client";

import { useState } from "react";
import { useCartStore } from "@/app/store/cartStore";

type Variant = {
  id: string;
  size: string;
  color: string;
  stock: number;
};

type Props = {
  variants: Variant[];
  productName: string;
  productSlug: string;
  price: number;
  image: string | null;
};

export default function VariantSelector({
  variants,
  productName,
  productSlug,
  price,
  image,
}: Props) {
  const sizes = [...new Set(variants.map((v) => v.size))];
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const selectedVariant = variants.find((v) => v.size === selectedSize);
  const outOfStock = selectedVariant ? selectedVariant.stock === 0 : false;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem({
      variantId: selectedVariant.id,
      productName,
      productSlug,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price,
      image,
      stock: selectedVariant.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-widest text-[#B0A29B]">
        Taille
      </p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => setSelectedSize(size)}
            className={`h-11 w-14 rounded-full border text-sm uppercase transition ${
              selectedSize === size
                ? "border-[#E8B4B0] bg-[#E8B4B0] text-white"
                : "border-[#E8D5CE] text-[#7A6B65] hover:border-[#C4877E]"
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      <button
        onClick={handleAddToCart}
        disabled={!selectedSize || outOfStock}
        className="mt-8 w-full rounded-full bg-[#E8B4B0] py-3.5 text-sm uppercase tracking-widest text-white transition hover:bg-[#C4877E] disabled:cursor-not-allowed disabled:bg-[#E8D5CE] disabled:text-[#B0A29B]"
      >
        {!selectedSize
          ? "Choisis une taille"
          : outOfStock
          ? "Rupture de stock"
          : added
          ? "Ajouté ✓"
          : "Ajouter au panier"}
      </button>
    </div>
  );
}