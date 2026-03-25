import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { OrderStatusEmail } from "@/components/emails/OrderStatusEmail";

// Using your provided API Key
const resend = new Resend('re_4CTkQYoB_Bjcyz59QygwmWHReT1dS9ZJ2');

export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // ✅ FIX: Typed params as a Promise
) {
  try {
    const { status, remark } = await req.json();
    
    // ✅ Now TypeScript knows params is a Promise and can be awaited
    const { id: orderId } = await params; 

    // 1. Update the order in Database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { 
        user: true,
      }
    });

    // 2. Send Actual Email via Resend
    // NOTE: Using 'onboarding@resend.dev' as the sender for testing
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'mahakkr111@gmail.com', // Sending to your verified test email
      subject: `Order Update: #${orderId.slice(-8)} is ${status}`,
      react: OrderStatusEmail({ 
        orderId: orderId, 
        status: status, 
        remark: remark 
      }),
    });

    if (error) {
      console.error("Resend delivery error:", error);
      // We still return success for the DB update, but log the email failure
    }

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      emailSent: !error 
    });
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}