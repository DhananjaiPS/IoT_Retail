import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      where: { status: "SUCCESS" },
      select: { amount: true, createdAt: true }
    });

    const totalRevenue = payments.reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    // Group by Month for Charting
    const monthlyData = payments.reduce((acc: any, curr) => {
      const month = curr.createdAt.toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + Number(curr.amount);
      return acc;
    }, {});

    const chartData = Object.keys(monthlyData).map(month => ({
      name: month,
      total: monthlyData[month]
    }));

    const totalOrders = payments.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalRefunds = await prisma.refund.count({ where: { status: "APPROVED" } });

    const [latestPayments, latestRefunds] = await Promise.all([
      prisma.payment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { order: { include: { user: true } } }
      }),
      prisma.refund.findMany({
        where: { status: "APPROVED" },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { order: { include: { user: true } } }
      })
    ]);

    const documents = [
      ...latestPayments.map(p => ({
        id: `INV-${p.id.slice(-6).toUpperCase()}`,
        client: p.order.user.email,
        type: "Tax Invoice",
        amount: Number(p.amount),
        date: p.createdAt,
      })),
      ...latestRefunds.map(r => ({
        id: `CRN-${r.id.slice(-6).toUpperCase()}`,
        client: r.order.user.email,
        type: "Credit Note",
        amount: -Number(r.amount),
        date: r.createdAt,
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      stats: { totalRevenue, avgOrderValue, refundRatio: ((totalRefunds / (totalOrders || 1)) * 100).toFixed(1), totalOrders },
      chartData,
      documents
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}