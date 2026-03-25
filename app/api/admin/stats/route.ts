import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { 
  startOfDay, 
  subDays, 
  startOfMonth, 
  endOfDay, 
  format 
} from "date-fns";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "All"; // Default All data

  let startDate: Date | null = null;
  const now = new Date();

  // Logic for filtering
  if (range === "Today") {
    startDate = startOfDay(now);
  } else if (range === "Week") {
    startDate = subDays(now, 7); // Last 7 days
  } else if (range === "Month") {
    startDate = startOfMonth(now); // Full current month
  }

  try {
    const whereClause = startDate ? { createdAt: { gte: startDate }, status: "SUCCESS" } : { status: "SUCCESS" };

    const [payments, refundAgg, userCount, pendingOrders] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause as any,
        select: { amount: true, method: true, createdAt: true },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.refund.aggregate({
        where: startDate ? { createdAt: { gte: startDate }, status: "APPROVED" } : { status: "APPROVED" },
        _sum: { amount: true },
      }),
      prisma.user.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
    ]);

    // Chart grouping
    const reportDataMap = new Map();
    payments.forEach((pay) => {
      const dateKey = format(pay.createdAt, "MMM dd");
      const current = reportDataMap.get(dateKey) || { date: dateKey, volume: 0, count: 0 };
      current.volume += Number(pay.amount);
      current.count += 1;
      reportDataMap.set(dateKey, current);
    });

    const reportData = Array.from(reportDataMap.values());
    const sourceMap = new Map();
    payments.forEach((pay) => {
      const method = pay.method || "Other";
      sourceMap.set(method, (sourceMap.get(method) || 0) + 1);
    });

    return NextResponse.json({
      kpis: {
        totalSuccess: payments.reduce((acc, curr) => acc + Number(curr.amount), 0),
        pendingOrders,
        refunds: Number(refundAgg?._sum?.amount || 0),
        newUsers: userCount,
      },
      reportData,
      pieData: Array.from(sourceMap.entries()).map(([name, value]) => ({ name, value })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Data fetch failed" }, { status: 500 });
  }
}