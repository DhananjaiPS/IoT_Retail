import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
    try {
        const { items, grandTotal, paymentMode } = await req.json();

        // 1. Get Clerk User
        const { userId: clerkId } = await auth();
        const clerkUser = await currentUser(); // Get email details for fallback

        if (!clerkId) {
            return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
        }

        // 2. Find or Create the User in Prisma
        // (This prevents the 404 crash if you haven't set up Webhooks yet)
        let user = await prisma.user.findUnique({
            where: { clerkId }
        });

        if (!user) {
            // Auto-create the user if they exist in Clerk but not your DB
            user = await prisma.user.create({
                data: {
                    clerkId: clerkId,
                    email: clerkUser?.primaryEmailAddress?.emailAddress || "unknown@example.com",
                    // name: clerkUser?.fullName || "Store User",
                    role: "USER" // ✅ CHANGED THIS TO UPPERCASE
                }
            });
        }

        // 3. Find Products in DB
        const itemNames = items.map((i: any) => i.name);
        const dbProducts = await prisma.product.findMany({
            where: { name: { in: itemNames } }
        });

        // 4. Map items safely (Handling Mock Products)
        const orderItemsData = items.map((item: any) => {
            const dbProduct = dbProducts.find(p => p.name === item.name);

            // If it's a mock product, we can't link it to a DB productId. 
            // We either drop it or link it to a dummy/fallback ID if you have one.
            // For now, we only process items that actually exist in the DB to prevent crashes.
            if (!dbProduct) {
                console.warn(`Skipping missing DB product: ${item.name}`);
                return null; 
            }

            return {
                productId: dbProduct.id,
                quantity: item.quantity || 1,
                priceAtTime: item.price
            };
        }).filter(Boolean); // Removes null values (the mock products)

        if (orderItemsData.length === 0) {
             return NextResponse.json({ 
                 success: false, 
                 error: "None of the items in the cart exist in the live database. Please add real products." 
             }, { status: 400 });
        }

        // 5. The Transaction
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    userId: user.id,
                    totalAmount: grandTotal,
                    status: "PENDING",
                    orderItems: {
                        create: orderItemsData
                    },
                    payments: {
                        create: {
                            amount: grandTotal,
                            method: paymentMode || "ONLINE",
                            status: "SUCCESS"
                        }
                    }
                }
            });

            // Reduce Stock Quantity only for real items
            for (const item of orderItemsData) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stockQuantity: {
                            decrement: item.quantity
                        }
                    }
                });
            }

            return newOrder;
        });

        return NextResponse.json({ success: true, orderId: order.id });

    } catch (error: any) {
        console.error("Critical Order Save Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}