import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from 'resend';
import { RefundStatusEmail } from "@/components/emails/RefundStatusEmail";

const resend = new Resend('re_4CTkQYoB_Bjcyz59QygwmWHReT1dS9ZJ2');

export async function GET() {
  try {
    const refunds = await prisma.refund.findMany({
      include: { order: { include: { user: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, refunds });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Fetch failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, remark } = body;

    // Database Update
    // ✅ FIX: Added ': any' to 'tx' to satisfy strict TypeScript compilation!
    const updatedRefund = await prisma.$transaction(async (tx: any) => {
      const refund = await tx.refund.update({
        where: { id },
        data: { status },
        include: { order: { include: { user: true } } }
      });

      if (status === "APPROVED") {
        await tx.payment.updateMany({
          where: { orderId: refund.orderId },
          data: { status: "REFUNDED" },
        });
      }
      return refund;
    });

    // Email Sending with Logs
    try {
      console.log("Attempting to send email to:", updatedRefund.order.user.email);
      
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'mahakkr111@gmail.com', // Static for testing, change to updatedRefund.order.user.email for production
        subject: `Refund Request #${updatedRefund.id.slice(-6).toUpperCase()}: ${status}`,
        react: RefundStatusEmail({ 
          refundId: updatedRefund.id, 
          orderId: updatedRefund.orderId, 
          status: status as any,
          amount: Number(updatedRefund.amount), 
          remark: remark || "The administrator has processed your refund request."
        }),
      });

      if (error) {
        console.error("Resend Error Details:", error);
      } else {
        console.log("Email sent successfully:", data);
      }
    } catch (emailErr) {
      console.error("Email block crashed:", emailErr);
      // We don't throw here because DB update is already successful
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Main PATCH Error:", error);
    return NextResponse.json({ success: false, error: "Database or server error" }, { status: 500 });
  }
}