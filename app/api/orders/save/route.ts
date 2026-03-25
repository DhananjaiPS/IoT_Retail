import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
    try {
        const { items, grandTotal, paymentMode } = await req.json();

        // 1. Get Clerk User
        const { userId: clerkId } = await auth();
        const clerkUser = await currentUser(); 

        if (!clerkId) {
            return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
        }

        // 2. Find or Create the User in Prisma
        let user = await prisma.user.findUnique({
            where: { clerkId }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    clerkId: clerkId,
                    email: clerkUser?.primaryEmailAddress?.emailAddress || "unknown@example.com",
                    role: "USER" 
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
            // ✅ FIX: Added ': any' to 'p' to satisfy strict mode
            const dbProduct = dbProducts.find((p: any) => p.name === item.name);

            if (!dbProduct) {
                console.warn(`Skipping missing DB product: ${item.name}`);
                return null; 
            }

            return {
                productId: dbProduct.id,
                quantity: item.quantity || 1,
                priceAtTime: item.price
            };
        }).filter(Boolean); 

        if (orderItemsData.length === 0) {
             return NextResponse.json({ 
                 success: false, 
                 error: "None of the items in the cart exist in the live database. Please add real products." 
             }, { status: 400 });
        }

        // 5. The Transaction
        // ✅ FIX: Explicitly typed 'tx' as 'any'
        const order = await prisma.$transaction(async (tx: any) => {
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

            for (const item of orderItemsData as any[]) {
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