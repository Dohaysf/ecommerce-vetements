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
  const tshirts = await prisma.category.create({
    data: {
      name: "T-shirts",
      slug: "t-shirts",
      description: "T-shirts pour homme et femme",
    },
  });

  const hoodies = await prisma.category.create({
    data: {
      name: "Hoodies",
      slug: "hoodies",
      description: "Sweats à capuche",
    },
  });

  console.log("Création des produits...");
  const product1 = await prisma.product.create({
    data: {
      name: "T-shirt Noir Essentiel",
      slug: "tshirt-noir-essentiel",
      description: "T-shirt basique en coton bio, coupe droite.",
      price: 24.99,
      categoryId: tshirts.id,
      images: {
        create: [
          { url: "https://placehold.co/600x800/000000/FFFFFF?text=T-shirt+Noir" },
        ],
      },
      variants: {
        create: [
          { size: "S", color: "Noir", stock: 10, sku: "TSN-S-NOIR" },
          { size: "M", color: "Noir", stock: 15, sku: "TSN-M-NOIR" },
          { size: "L", color: "Noir", stock: 8, sku: "TSN-L-NOIR" },
        ],
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "Hoodie Gris Oversize",
      slug: "hoodie-gris-oversize",
      description: "Hoodie oversize en molleton épais, coupe streetwear.",
      price: 49.99,
      categoryId: hoodies.id,
      images: {
        create: [
          { url: "https://placehold.co/600x800/808080/FFFFFF?text=Hoodie+Gris" },
        ],
      },
      variants: {
        create: [
          { size: "M", color: "Gris", stock: 5, sku: "HGO-M-GRIS" },
          { size: "L", color: "Gris", stock: 7, sku: "HGO-L-GRIS" },
          { size: "XL", color: "Gris", stock: 3, sku: "HGO-XL-GRIS" },
        ],
      },
    },
  });

  console.log("Seed terminé avec succès !");
  console.log(`- 1 admin créé (admin@boutique.com / admin1234)`);
  console.log(`- 2 catégories créées`);
  console.log(`- 2 produits créés avec variantes`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });