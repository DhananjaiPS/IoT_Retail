import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { format, subDays, startOfDay } from "date-fns";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ADMIN") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });

    // 1. Fetch Aggregates & Latest Issue in parallel
    const [paymentsSummary, refundsSummary, latestIssue] = await Promise.all([
      prisma.payment.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { status: "SUCCESS" }
      }),
      prisma.refund.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { status: "APPROVED" }
      }),
      prisma.supportTicket.findFirst({
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" },
      })
    ]);

    // 2. Fetch Chart Data (Last 30 Days)
    const thirtyDaysAgo = startOfDay(subDays(new Date(), 30));
    const [recentPayments, methodGroups] = await Promise.all([
      prisma.payment.findMany({
        where: { status: "SUCCESS", createdAt: { gte: thirtyDaysAgo } },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.payment.groupBy({
        by: ['method'],
        _count: { id: true },
        where: { status: "SUCCESS" }
      })
    ]);

    // 3. Process reportData (Bar/Line Chart)
    const reportAcc: Record<string, { volume: number, count: number }> = {};
    
    // ✅ EXACT FIX FOR VERCEL
    recentPayments.forEach((p: { amount: any; createdAt: Date }) => {
      const dateKey = format(p.createdAt, "MMM dd");
      if (!reportAcc[dateKey]) reportAcc[dateKey] = { volume: 0, count: 0 };
      reportAcc[dateKey].volume += Number(p.amount);
      reportAcc[dateKey].count += 1;
    });

    const reportData = Object.entries(reportAcc).map(([date, stats]) => ({
      date,
      volume: stats.volume,
      count: stats.count
    }));

    // 4. Process pieData (Pie Chart)
    const pieData = methodGroups.map((g: { method: string; _count: { id: number } }) => ({
      name: g.method || "Other",
      value: g._count.id
    }));

    const rawVolume = Number(paymentsSummary._sum.amount || 0);

    return NextResponse.json({
      success: true,
      data: {
        payments: {
          volume: rawVolume,
          count: paymentsSummary._count.id
        },
        settlements: {
          volume: rawVolume - Number(refundsSummary._sum.amount || 0),
          lastSettled: new Date().toISOString()
        },
        refunds: {
          volume: Number(refundsSummary._sum.amount || 0),
          count: refundsSummary._count.id
        },
        charts: {
          reportData,
          pieData
        },
        latestIssue: latestIssue 
      }
    });

  } catch (error ) {
    console.error("[Dashboard API]", error);
    return NextResponse.json({ success: false, message: "Error" }, { status: 500 });
  }
}