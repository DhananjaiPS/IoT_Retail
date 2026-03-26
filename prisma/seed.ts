import { PrismaClient, Role, OrderStatus, PaymentStatus, RefundStatus, TicketStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { subDays, subHours, subMinutes } from "date-fns";
import "dotenv/config"; // ✅ Very important to load DATABASE_URL from .env

// ✅ Re-added the Adapter (Strictly required by your Prisma v7 setup)
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
} as any);

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🔥 Starting Mega Seed with Time Randomization...");

    // 1. Fetch Products from DummyJSON
    console.log("📦 Fetching mock products from DummyJSON...");
    const productRes = await fetch("https://dummyjson.com/products?limit=100");
    const { products: rawProducts } = await productRes.json();

    // 2. Create Users
    console.log("👥 Creating Mock Users...");
    const userIds: string[] = [];
    for (let i = 1; i <= 15; i++) {
        const user = await prisma.user.upsert({
            where: { email: `user${i}@example.com` },
            update: {},
            create: {
                clerkId: `user_clerk_${Math.random().toString(36).substr(2, 9)}`,
                email: `user${i}@example.com`,
                role: i === 1 ? Role.ADMIN : Role.USER,
            },
        });
        userIds.push(user.id);
    }

    // 3. Create Products in Database
    console.log("📦 Inserting Products into Database...");
    const productIds: string[] = [];
    for (const p of rawProducts) {
        const product = await prisma.product.create({
            data: {
                name: p.title,
                description: p.description,
                price: p.price,
                stockQuantity: p.stock,
                category: p.category,
                images: p.images,
            },
        });
        productIds.push(product.id);
    }

    // 4. Create 110 Orders & Payments (Zig-Zag Data for Graph)
    console.log("🛒 Creating 110+ Orders with Random Timestamps...");
    const orderIds: string[] = [];
    const paymentMethods = ["UPI", "Debit Card", "Credit Card", "Paytm Wallet", "Net Banking"];

    for (let i = 0; i < 110; i++) {
        const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
        
        // Random time spread over last 30 days for Zig-Zag graph
        const randomDate = subDays(new Date(), Math.floor(Math.random() * 30));
        const finalTimeStamp = subMinutes(subHours(randomDate, Math.floor(Math.random() * 24)), Math.floor(Math.random() * 60));

        const randomStatus = [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PENDING][Math.floor(Math.random() * 3)];

        const itemCount = Math.floor(Math.random() * 3) + 1;
        let totalAmount = 0;
        const items = [];

        for (let j = 0; j < itemCount; j++) {
            const pIdx = Math.floor(Math.random() * productIds.length);
            const qty = Math.floor(Math.random() * 2) + 1;
            const price = Number(rawProducts[pIdx].price);
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

    console.log("💰 Creating Refunds & Support Tickets...");
    
    // 5. Create Refunds
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

    // 6. Create Support Tickets
    const subjects = ["Payment Failed", "Delivery Delay", "Wrong Item Received", "Account Access"];
    for (let i = 0; i < 20; i++) {
        const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
        await prisma.supportTicket.create({
            data: {
                userId: randomUser,
                orderId: orderIds[Math.floor(Math.random() * orderIds.length)],
                subject: subjects[Math.floor(Math.random() * subjects.length)],
                message: "This is a dummy support message generated by seed.",
                status: i % 2 === 0 ? TicketStatus.OPEN : TicketStatus.RESOLVED,
            }
        });
    }

    console.log("🏁 SEED COMPLETE! Saara mock data database mein insert ho gaya hai.");
}

main()
    .catch((e) => {
        console.error("Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });