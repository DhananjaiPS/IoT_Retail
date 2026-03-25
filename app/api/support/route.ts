import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { orderId, amount, reason, selectedItems = [] } = body; // ✅ Added default empty array

    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id }
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Invalid Order" }, { status: 404 });
    }

    // Format reason - Safer join with fallback
    const itemsList = Array.isArray(selectedItems) ? selectedItems.join(", ") : "No items specified";
    const detailedReason = `Refund for: [${itemsList}]. Customer Reason: ${reason}`;

    // Create Refund Request
    const refund = await prisma.refund.create({
      data: {
        orderId: order.id,
        amount: amount,
        reason: detailedReason,
        status: "PENDING" 
      }
    });

    return NextResponse.json({ success: true, refund });

  } catch (error: any) {
    console.error("Refund API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 });
  }
}