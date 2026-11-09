import { z } from "zod";

export const variantSchema = z.object({
  id: z.string().optional(),
  size: z.enum(["XS", "S", "M", "L", "XL", "XXL"]),
  color: z.string().min(1, "Couleur requise"),
  stock: z.coerce.number().int().min(0, "Stock invalide"),
  sku: z.string().min(1, "SKU requis"),
});

export const productSchema = z.object({
  name: z.string().min(2, "Nom trop court"),
  slug: z
    .string()
    .min(2, "Slug trop court")
    .regex(/^[a-z0-9-]+$/, "Slug : minuscules, chiffres et tirets uniquement"),
  description: z.string().min(1, "Description requise"),
  price: z.coerce.number().positive("Prix invalide"),
  categoryId: z.string().min(1, "Catégorie requise"),
  imageUrl: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || v.startsWith("/") || /^https?:\/\/\S+$/i.test(v),
      "Le lien de la photo doit commencer par https:// ou par /"
    )
    .optional()
    .default(""),
  variants: z.array(variantSchema).min(1, "Ajoute au moins une variante"),
});