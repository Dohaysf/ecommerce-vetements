import { z } from "zod";

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(20),
      })
    )
    .min(1, "Ton panier est vide")
    .max(50),
  shipping: z.object({
    address: z.string().trim().min(5, "Adresse trop courte").max(200),
    zip: z
      .string()
      .trim()
      .min(4, "Code postal invalide")
      .max(10, "Code postal invalide"),
    city: z.string().trim().min(2, "Ville requise").max(100),
  }),
});