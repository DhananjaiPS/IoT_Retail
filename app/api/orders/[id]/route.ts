import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // ✅ FIX: Typed params as a Promise
) {
  try {
    // 1. Authenticate the user
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Await params properly for Next.js app router compatibility
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    // 2. Fetch the Order with its Items, Products (for images), and Refunds
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: user.id // Ensure security: user can only fetch their own order
      },
      include: {
        orderItems: {
          include: {
            product: true // Includes product name, image, price
          }
        },
        refunds: true // Includes past refund requests to show status
      }
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
    
  } catch (error) {
    console.error("Fetch Single Order Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}