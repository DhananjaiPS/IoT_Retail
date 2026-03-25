import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,           // To get customer email
        orderItems: {         // To get products in the order
          include: {
            product: true
          }
        },
        payments: true,       // To get payment method/status
        supportTickets: true  // To get linked tickets
      },
      orderBy: {
        createdAt: 'desc'     // Latest orders first
      }
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}