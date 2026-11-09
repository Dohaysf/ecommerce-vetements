import { PrismaClient } from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Nettoyage de la base...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("Création de l'admin...");
  const passwordHash = await bcrypt.hash("admin1234", 10);
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@boutique.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Création des catégories...");
  const robes = await prisma.category.create({
    data: { name: "Robes", slug: "robes", description: "Robes légères et élégantes" },
  });
  const jupes = await prisma.category.create({
    data: { name: "Jupes", slug: "jupes", description: "Jupes pour toutes les occasions" },
  });
  const hauts = await prisma.category.create({
    data: { name: "Hauts", slug: "hauts", description: "Blouses, tops et chemisiers" },
  });
  const accessoires = await prisma.category.create({
    data: { name: "Accessoires", slug: "accessoires", description: "Foulards, sacs et bijoux" },
  });

  console.log("Création des produits...");

  await prisma.product.create({
    data: {
      name: "Robe en Lin Beige",
      slug: "robe-en-lin-beige",
      description: "Robe légère en lin naturel, coupe fluide et respirante, idéale pour les journées ensoleillées.",
      price: 59.99,
      categoryId: robes.id,
      images: { create: [{ url: "/products/Robe-Lin -Beige.jpg" }] },
      variants: {
        create: [
          { size: "S", color: "Beige", stock: 8, sku: "RLB-S-BEIGE" },
          { size: "M", color: "Beige", stock: 12, sku: "RLB-M-BEIGE" },
          { size: "L", color: "Beige", stock: 5, sku: "RLB-L-BEIGE" },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Robe Satin Bordeaux",
      slug: "robe-satin-bordeaux",
      description: "Robe en satin fluide, tombé élégant, parfaite pour les soirées.",
      price: 69.99,
      categoryId: robes.id,
      images: { create: [{ url: "/products/robe-satin-bordeaux.jpg" }] },
      variants: {
        create: [
          { size: "S", color: "Bordeaux", stock: 6, sku: "RSB-S-BORDEAUX" },
          { size: "M", color: "Bordeaux", stock: 3, sku: "RSB-M-BORDEAUX" },
          { size: "L", color: "Bordeaux", stock: 7, sku: "RSB-L-BORDEAUX" },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Robe Fleurie Champêtre",
      slug: "robe-fleurie-champetre",
      description: "Robe à motifs floraux, manches courtes bouffantes, esprit romantique.",
      price: 54.99,
      categoryId: robes.id,
      images: { create: [{ url: "/products/robe-fleurie-champetre.jpg" }] },
      variants: {
        create: [
          { size: "XS", color: "Rose", stock: 4, sku: "RFC-XS-ROSE" },
          { size: "S", color: "Rose", stock: 10, sku: "RFC-S-ROSE" },
          { size: "M", color: "Rose", stock: 9, sku: "RFC-M-ROSE" },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Robe Midi Sauge",
      slug: "robe-midi-sauge",
      description: "Robe midi en jersey doux, coupe ceinturée, coloris sauge apaisant.",
      price: 62.99,
      categoryId: robes.id,
      images: { create: [{ url: "/products/robe-midi-sauge.jpg" }] },
      variants: {
        create: [
          { size: "S", color: "Sauge", stock: 5, sku: "RMS-S-SAUGE" },
          { size: "M", color: "Sauge", stock: 8, sku: "RMS-M-SAUGE" },
          { size: "L", color: "Sauge", stock: 2, sku: "RMS-L-SAUGE" },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Jupe Plissée Rose Poudré",
      slug: "jupe-plissee-rose-poudre",
      description: "Jupe plissée midi, taille haute, tombé aérien.",
      price: 39.99,
      categoryId: jupes.id,
      images: { create: [{ url: "/products/jupe-plissee-rose.jpg" }] },
      variants: {
        create: [
          { size: "S", color: "Rose Poudré", stock: 9, sku: "JPR-S-ROSE" },
          { size: "M", color: "Rose Poudré", stock: 11, sku: "JPR-M-ROSE" },
          { size: "L", color: "Rose Poudré", stock: 4, sku: "JPR-L-ROSE" },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Jupe Midi Lin Naturel",
      slug: "jupe-midi-lin-naturel",
      description: "Jupe midi en lin, coupe évasée, coloris naturel intemporel.",
      price: 42.99,
      categoryId: jupes.id,
      images: { create: [{ url: "/products/jupe-midi-lin.jpg" }] },
      variants: {
        create: [
          { size: "S", color: "Naturel", stock: 7, sku: "JML-S-NATUREL" },
          { size: "M", color: "Naturel", stock: 6, sku: "JML-M-NATUREL" },
          { size: "L", color: "Naturel", stock: 0, sku: "JML-L-NATUREL" },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Top Cache-Cœur Crème",
      slug: "top-cache-coeur-creme",
      description: "Top cache-cœur en maille fine, manches longues, coupe ajustée.",
      price: 32.99,
      categoryId: hauts.id,
      images: { create: [{ url: "/products/top-cache-coeur.jpg" }] },
      variants: {
        create: [
          { size: "XS", color: "Crème", stock: 6, sku: "TCC-XS-CREME" },
          { size: "S", color: "Crème", stock: 10, sku: "TCC-S-CREME" },
          { size: "M", color: "Crème", stock: 8, sku: "TCC-M-CREME" },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Blouse Romantique Blanche",
      slug: "blouse-romantique-blanche",
      description: "Blouse en voile de coton, col Claudine, manches à volants.",
      price: 36.99,
      categoryId: hauts.id,
      images: { create: [{ url: "/products/blouse-romantique.jpg" }] },
      variants: {
        create: [
          { size: "S", color: "Blanc", stock: 5, sku: "BRB-S-BLANC" },
          { size: "M", color: "Blanc", stock: 9, sku: "BRB-M-BLANC" },
          { size: "L", color: "Blanc", stock: 3, sku: "BRB-L-BLANC" },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Foulard Soie Fleuri",
      slug: "foulard-soie-fleuri",
      description: "Foulard en soie douce, imprimé floral, à porter au cou ou en cheveux.",
      price: 24.99,
      categoryId: accessoires.id,
      images: { create: [{ url: "/products/foulard-soie.jpg" }] },
      variants: {
        create: [{ size: "M", color: "Multicolore", stock: 15, sku: "FSF-M-MULTI" }],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Sac Paille Tressée",
      slug: "sac-paille-tressee",
      description: "Sac cabas en paille tressée à la main, doublure en coton.",
      price: 44.99,
      categoryId: accessoires.id,
      images: { create: [{ url: "/products/sac-paille.jpg" }] },
      variants: {
        create: [{ size: "M", color: "Naturel", stock: 8, sku: "SPT-M-NATUREL" }],
      },
    },
  });

  console.log("Seed terminé avec succès !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });