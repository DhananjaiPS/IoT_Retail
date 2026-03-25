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

    const { orderId, amount, reason, selectedItems } = await req.json();

    // Verify order belongs to user
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id }
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Invalid Order" }, { status: 404 });
    }

    // Format reason to include selected product names
    const detailedReason = `Refund for: [${selectedItems.join(", ")}]. Customer Reason: ${reason}`;

    // Create Refund Request
    const refund = await prisma.refund.create({
      data: {
        orderId: order.id,
        amount: amount,
        reason: detailedReason,
        status: "PENDING" // Default status
      }
    });

    return NextResponse.json({ success: true, refund });

  } catch (error: any) {
    console.error("Refund API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to process request" }, { status: 500 });
  }
}