import { PrismaClient } from "../app/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type Status =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

const CLIENTS = [
  { name: "Camille Martin", email: "camille@example.com", address: "12 rue des Lilas", zip: "69003", city: "Lyon" },
  { name: "Sarah Benali", email: "sarah@example.com", address: "8 avenue Parmentier", zip: "75011", city: "Paris" },
  { name: "Léa Dubois", email: "lea@example.com", address: "25 cours Victor Hugo", zip: "33000", city: "Bordeaux" },
];

// items : [index de la variante, quantité]
const ORDERS: {
  client: number;
  status: Status;
  items: [number, number][];
  daysAgo: number;
}[] = [
  { client: 0, status: "PENDING", items: [[0, 1], [1, 1]], daysAgo: 0 },
  { client: 1, status: "PAID", items: [[2, 1]], daysAgo: 1 },
  { client: 2, status: "PROCESSING", items: [[3, 2], [4, 1]], daysAgo: 2 },
  { client: 0, status: "SHIPPED", items: [[1, 1], [5, 1]], daysAgo: 4 },
  { client: 1, status: "DELIVERED", items: [[0, 2]], daysAgo: 8 },
  { client: 2, status: "CANCELLED", items: [[2, 1], [3, 1]], daysAgo: 10 },
];

async function main() {
  const variants = await prisma.productVariant.findMany({
    include: { product: true },
    orderBy: { createdAt: "asc" },
    take: 6,
  });

  if (variants.length === 0) {
    console.log("Aucune variante trouvée : lance d'abord le seed principal.");
    return;
  }

  const hash = await bcrypt.hash("client1234", 10);

  const users = [];
  for (const c of CLIENTS) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: { name: c.name, email: c.email, passwordHash: hash, role: "CLIENT" },
    });
    users.push(user);
  }

  // Évite les doublons si on relance le script
  await prisma.order.deleteMany({
    where: { userId: { in: users.map((u) => u.id) } },
  });

  for (const o of ORDERS) {
    const client = CLIENTS[o.client];
    const user = users[o.client];

    const lines = o.items.map(([idx, quantity]) => {
      const variant = variants[idx % variants.length];
      return {
        variantId: variant.id,
        quantity,
        unitPrice: Number(variant.product.price),
      };
    });

    const total =
      Math.round(
        lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0) * 100
      ) / 100;

    await prisma.order.create({
      data: {
        userId: user.id,
        status: o.status,
        total,
        shippingAddress: client.address,
        shippingZip: client.zip,
        shippingCity: client.city,
        createdAt: new Date(Date.now() - o.daysAgo * 86400000),
        items: { create: lines },
      },
    });
  }

  console.log(`${ORDERS.length} commandes de test créées.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });