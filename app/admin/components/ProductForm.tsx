"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export type VariantInput = {
  id?: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
};

export type ProductFormData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  variants: VariantInput[];
};

type Props = {
  categories: { id: string; name: string }[];
  initial?: ProductFormData;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const inputClass =
  "w-full rounded-full border border-[#E8D5CE] bg-[#FBF5F0] px-4 py-2.5 text-sm outline-none focus:border-[#E8B4B0]";
const labelClass = "mb-1.5 block text-xs uppercase tracking-widest text-[#B0A29B]";

export default function ProductForm({ categories, initial }: Props) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? categories[0]?.id ?? ""
  );
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [variants, setVariants] = useState<VariantInput[]>(
    initial?.variants ?? [{ size: "M", color: "", stock: 0, sku: "" }]
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const updateVariant = (index: number, patch: Partial<VariantInput>) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...patch } : v))
    );
  };

  const addVariant = () =>
    setVariants((prev) => [...prev, { size: "M", color: "", stock: 0, sku: "" }]);

  const removeVariant = (index: number) =>
    setVariants((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      name,
      slug,
      description,
      price: Number(price),
      categoryId,
      imageUrl,
      variants,
    };

    const res = await fetch(
      isEdit ? `/api/admin/products/${initial!.id}` : "/api/admin/products",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    setSaving(false);

    if (res.ok) {
      router.push("/admin/produits");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Une erreur est survenue");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer définitivement ce produit ?")) return;
    setSaving(true);
    const res = await fetch(`/api/admin/products/${initial!.id}`, {
      method: "DELETE",
    });
    setSaving(false);

    if (res.ok) {
      router.push("/admin/produits");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Suppression impossible");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <div className="space-y-5 rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(196,135,126,0.08)]">
        <div>
          <label className={labelClass}>Nom du produit</label>
          <input
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={inputClass}
            placeholder="Robe en Lin Beige"
          />
        </div>

        <div>
          <label className={labelClass}>Slug (URL)</label>
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className={inputClass}
            placeholder="robe-en-lin-beige"
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-2xl border border-[#E8D5CE] bg-[#FBF5F0] px-4 py-3 text-sm outline-none focus:border-[#E8B4B0]"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Prix (€)</label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Catégorie</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Image (chemin dans /public)</label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={inputClass}
            placeholder="/products/robe-lin-beige.jpg"
          />
        </div>
      </div>

      {/* VARIANTES */}
      <div className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(196,135,126,0.08)]">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-serif text-lg italic">Variantes</p>
          <button
            type="button"
            onClick={addVariant}
            className="rounded-full border border-[#E8B4B0] px-4 py-1.5 text-xs uppercase tracking-widest text-[#C4877E] hover:bg-[#E8B4B0] hover:text-white"
          >
            + Ajouter
          </button>
        </div>

        <div className="space-y-3">
          {variants.map((v, i) => (
            <div
              key={v.id ?? i}
              className="grid grid-cols-2 gap-2 sm:grid-cols-[80px_1fr_80px_1fr_auto]"
            >
              <select
                value={v.size}
                onChange={(e) => updateVariant(i, { size: e.target.value })}
                className={inputClass}
              >
                {SIZES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <input
                required
                placeholder="Couleur"
                value={v.color}
                onChange={(e) => updateVariant(i, { color: e.target.value })}
                className={inputClass}
              />
              <input
                required
                type="number"
                min="0"
                placeholder="Stock"
                value={v.stock}
                onChange={(e) =>
                  updateVariant(i, { stock: Number(e.target.value) })
                }
                className={inputClass}
              />
              <input
                required
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => updateVariant(i, { sku: e.target.value })}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeVariant(i)}
                disabled={variants.length === 1}
                className="rounded-full px-3 text-[#B0A29B] hover:text-[#C4877E] disabled:opacity-30"
                aria-label="Retirer la variante"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[#E8B4B0] px-8 py-3 text-sm uppercase tracking-widest text-white transition hover:bg-[#C4877E] disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer le produit"}
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="rounded-full border border-[#E8D5CE] px-6 py-3 text-sm uppercase tracking-widest text-[#7A6B65] hover:border-red-300 hover:text-red-500 disabled:opacity-50"
          >
            Supprimer
          </button>
        )}
      </div>
    </form>
  );
}