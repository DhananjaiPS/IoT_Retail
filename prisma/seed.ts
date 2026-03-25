import { PrismaClient, Role, OrderStatus, PaymentStatus, RefundStatus, TicketStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { subDays } from "date-fns";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// ... rest of your seed code
async function main() {
    console.log("🔥 Starting Mega Seed with Time Randomization...");

    // 1. Fetch Users
    const users = await prisma.user.findMany({ take: 20 });
    if (users.length === 0) {
        console.log("❌ No users found. Please sign up first.");
        return;
    }
    const userIds = users.map(u => u.id);
    
    // 2. Fetch Products
    const products = await prisma.product.findMany({ take: 100 });
    const productIds = products.map(p => p.id);

    if (productIds.length === 0) {
        console.log("❌ Products not found. Run product seed first.");
        return;
    }

    // 3. Create 110 Orders & Payments (Zig-Zag Data for Graph)
    console.log("🛒 Creating 110+ Orders with Random Timestamps...");
    const orderIds: string[] = [];
    const paymentMethods = ["UPI", "Debit Card", "Credit Card", "Paytm Wallet", "Net Banking"];

    for (let i = 0; i < 110; i++) {
        const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
        
        // Random time spread over last 30 days
        const randomDate = subDays(new Date(), Math.floor(Math.random() * 30));
        const finalTimeStamp = subMinutes(subHours(randomDate, Math.floor(Math.random() * 24)), Math.floor(Math.random() * 60));

        const randomStatus = [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PENDING][Math.floor(Math.random() * 3)];

        const itemCount = Math.floor(Math.random() * 3) + 1;
        let totalAmount = 0;
        const items = [];

        for (let j = 0; j < itemCount; j++) {
            const pIdx = Math.floor(Math.random() * productIds.length);
            const qty = Math.floor(Math.random() * 2) + 1;
            const price = Number(products[pIdx].price);
            totalAmount += price * qty;

            items.push({
                productId: productIds[pIdx],
                quantity: qty,
                priceAtTime: price
            });
        }

        const order = await prisma.order.create({
            data: {
                userId: randomUser,
                totalAmount: totalAmount,
                status: randomStatus,
                createdAt: finalTimeStamp,
                orderItems: { create: items },
                payments: {
                    create: {
                        amount: totalAmount,
                        method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                        status: PaymentStatus.SUCCESS,
                        createdAt: finalTimeStamp,
                    }
                }
            }
        });
        orderIds.push(order.id);
    }

    console.log("💰 Creating Refunds & Tickets...");
    // 4. Create Refunds
    for (let i = 0; i < 30; i++) {
        const randomOrder = orderIds[Math.floor(Math.random() * orderIds.length)];
        await prisma.refund.create({
            data: {
                orderId: randomOrder,
                amount: (Math.random() * 500 + 50).toFixed(2),
                reason: "Automated Seed Refund",
                status: RefundStatus.APPROVED,
                createdAt: subDays(new Date(), Math.floor(Math.random() * 15)),
            }
        });
    }

    console.log("🏁 SEED COMPLETE! Graph zigzag ho gaya hoga.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
// 2. Yeh kyun chalega?
// Aapka puraana code PrismaPg adapter use kar raha tha, jo runtime mein DATABASE_URL na milne par ya context mismatch hone par crash kar jata hai.

// Seed script ek CLI task hai, isme humein direct connection chahiye hota hai. const prisma = new PrismaClient(); apne aa

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });