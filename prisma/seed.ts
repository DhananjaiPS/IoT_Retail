import { PrismaClient, Role, OrderStatus, PaymentStatus, RefundStatus, TicketStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { subDays, subMinutes, subHours } from "date-fns";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// ... rest of your seed code
async function main() {
  console.log("🚀 Starting data synchronization...");

  // 1. Fetch all existing Orders and Products
  const orders = await prisma.order.findMany();
  const products = await prisma.product.findMany();

  if (products.length === 0) {
    console.error("❌ No products found in database. Please seed products first.");
    return;
  }

  console.log(`Syncing ${orders.length} orders...`);

  for (const order of orders) {
    // 2. Clear any existing items for this order to avoid duplicates (Optional)
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });

    // 3. Pick a random number of items for this order (1 to 4)
    const itemCount = Math.floor(Math.random() * 4) + 1;
    let orderTotal = 0;

    const itemsToCreate = [];

    for (let i = 0; i < itemCount; i++) {
      // Pick a random product from the DB
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const priceAtTime = Number(randomProduct.price);

      itemsToCreate.push({
        productId: randomProduct.id,
        quantity: quantity,
        priceAtTime: priceAtTime,
      });

      orderTotal += priceAtTime * quantity;
    }

    // 4. Create OrderItems and Update Order/Payment in a Transaction
    await prisma.$transaction([
      // Insert new OrderItems
      prisma.orderItem.createMany({
        data: itemsToCreate.map(item => ({
          ...item,
          orderId: order.id,
        })),
      }),

      // Update Order Total
      prisma.order.update({
        where: { id: order.id },
        data: { totalAmount: orderTotal },
      }),

      // Sync Payment Amount (Assuming one payment per order)
      prisma.payment.updateMany({
        where: { orderId: order.id },
        data: { amount: orderTotal },
      })
    ]);
  }

  console.log("✅ Sync complete. OrderItems populated and totals updated.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });