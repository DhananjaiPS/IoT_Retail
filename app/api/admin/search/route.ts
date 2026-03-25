import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = await auth();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!userId || !query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Parallel search in Products and Orders
    const [products, orders] = await Promise.all([
      prisma.product.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        take: 4,
        select: { id: true, name: true, category: true }
      }),
      prisma.order.findMany({
        where: { id: { contains: query, mode: 'insensitive' } },
        take: 4,
        include: { user: { select: { email: true } } }
      })
    ]);

    // Combine results
    // ✅ FIX: Added explicit types (any) to parameters p and o
    const results = [
      ...products.map((p: any) => ({ ...p, type: 'Product', label: p.name })),
      ...orders.map((o: any) => ({ ...o, type: 'Order', label: `Order #${o.id.slice(-6)}`, sub: o.user.email }))
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}