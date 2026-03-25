import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "7d";

    // 1. Calculate Date Range
    let dateFilter = {};
    const now = new Date();

    if (range === "today") {
      dateFilter = { gte: startOfDay(now), lte: endOfDay(now) };
    } else if (range === "7d") {
      dateFilter = { gte: subDays(now, 7) };
    } else if (range === "30d") {
      dateFilter = { gte: subDays(now, 30) };
    }

    // 2. Parallel Database Fetching
    const [payments, categorySales, statusGroups, totalProducts] = await Promise.all([
      prisma.payment.findMany({
        where: { status: "SUCCESS", createdAt: dateFilter },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.product.findMany({
        select: {
          category: true,
          orderItems: {
            where: { order: { payments: { some: { status: "SUCCESS", createdAt: dateFilter } } } },
            select: { priceAtTime: true, quantity: true }
          }
        }
      }),
      prisma.payment.groupBy({
        by: ['status'],
        where: { createdAt: dateFilter },
        _count: { id: true }
      }),
      prisma.product.count()
    ]);

    // 3. Process Category Data
    const categoryMap: Record<string, number> = {};
    
    // ✅ FIX: Explicitly typed 'p' to satisfy strict TypeScript rules
    categorySales.forEach((p: { category: string; orderItems: { priceAtTime: any; quantity: number }[] }) => {
      const total = p.orderItems.reduce((acc, item) => acc + (Number(item.priceAtTime) * item.quantity), 0);
      if (total > 0) {
        categoryMap[p.category] = (categoryMap[p.category] || 0) + total;
      }
    });

    // 4. Group Timeline Data (Day-wise for 7d/30d, Hour-wise for today)
    const timelineMap = new Map<string, number>();
    
    // ✅ FIX: Explicitly typed 'p' here as well, just to be completely safe
    payments.forEach((p: { amount: any; createdAt: Date }) => {
      const timeKey = range === "today" ? format(p.createdAt, "HH:00") : format(p.createdAt, "MMM dd");
      timelineMap.set(timeKey, (timelineMap.get(timeKey) || 0) + Number(p.amount));
    });

    const timelineData = Array.from(timelineMap.entries()).map(([time, amount]) => ({
      time,
      amount: Number(amount.toFixed(2))
    }));

    // 5. KPI Calculations
    const totalPayments = statusGroups.reduce((acc, g) => acc + g._count.id, 0);
    const successPayments = statusGroups.find(g => g.status === "SUCCESS")?._count.id || 0;
    const successRate = totalPayments > 0 ? ((successPayments / totalPayments) * 100).toFixed(1) : 0;
    const totalVolume = payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const aov = payments.length > 0 ? (totalVolume / payments.length).toFixed(0) : 0;

    return NextResponse.json({
      success: true,
      metrics: {
        totalVolume,
        successRate: `${successRate}%`,
        aov: `₹${aov}`,
        inventoryCount: totalProducts,
        growth: range === "today" ? "Live" : "+12.5%" 
      },
      categoryData: Object.entries(categoryMap).map(([name, value]) => ({ name, value })),
      timelineData
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}