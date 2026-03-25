import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // 1. Fetch EVERYTHING needed for deep analysis
    const [products, recentSales] = await Promise.all([
      prisma.product.findMany({
        include: { orderItems: { select: { quantity: true, priceAtTime: true } } }
      }),
      prisma.orderItem.findMany({
        where: { order: { createdAt: { gte: thirtyDaysAgo }, status: 'DELIVERED' } },
        select: { productId: true, quantity: true }
      })
    ]);

    // 2. Map Sales Velocity
    const salesMap = recentSales.reduce((acc: Record<string, number>, item: { productId: string; quantity: number }) => {
      acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

    // 3. BRAIN LOGIC: Categorize Products (ABC Analysis)
    const analyzed = products.map((p: { id: string; name: string; price: any; stockQuantity: number }) => {
      const sold30d = salesMap[p.id] || 0;
      const stock = p.stockQuantity;
      const revenue30d = sold30d * Number(p.price);
      
      return {
        id: p.id,
        name: p.name,
        price: Number(p.price),
        stock,
        sold30d,
        revenue30d,
        velocity: sold30d / (stock || 1),
        isDead: stock > 5 && sold30d === 0,
        isBestseller: sold30d > 20
      };
    // ✅ FIX 1: Typed 'a' and 'b' for the sort function
    }).sort((a: { velocity: number }, b: { velocity: number }) => b.velocity - a.velocity);

    // ✅ FIX 2: Typed 'p' for the filters
    const deadStock = analyzed.filter((p: { isDead: boolean }) => p.isDead);
    const bestsellers = analyzed.filter((p: { isBestseller: boolean }) => p.isBestseller);

    // 4. GENERATE DYNAMIC PLAYS (No static messages)
    const plays = [];

    // Play A: The Ghost Bundle (Pairing Top with Bottom)
    if (deadStock.length > 0 && bestsellers.length > 0) {
      const top = bestsellers[0];
      const dead = deadStock[0];
      const suggestedPrice = (top.price + (dead.price * 0.6)).toFixed(2);
      
      plays.push({
        id: `PLAY_BUNDLE_${dead.id}`,
        type: "LIQUIDATION",
        title: "Aggressive Bundle Opportunity",
        description: `Product ID ${dead.id.slice(-6)} (${dead.name}) has zero velocity. High storage cost.`,
        action: `Bundle ${dead.name} with your #1 Bestseller ${top.name}`,
        formula: `Combo Price: ₹${suggestedPrice} (Saves Customer 40% on the dead item)`,
        impact: `Unlock ₹${(dead.stock * dead.price).toLocaleString()} in frozen capital.`,
        urgency: dead.stock > 50 ? "CRITICAL" : "HIGH"
      });
    }

    // Play B: Weekend Dynamic Markup
    // ✅ FIX 3: Typed 'p' inside this forEach loop
    bestsellers.slice(0, 2).forEach((p: { id: string; name: string; velocity: number; price: number; revenue30d: number }) => {
      const currentDay = now.getDay(); // 5=Fri, 6=Sat, 0=Sun
      const isWeekendWindow = currentDay === 5 || currentDay === 6 || currentDay === 0;

      plays.push({
        id: `PLAY_PRICE_${p.id}`,
        type: "PROFIT",
        title: "Dynamic Margin Expansion",
        description: `${p.name} has a high velocity (${(p.velocity * 100).toFixed(1)}%). Demand is inelastic.`,
        action: `Increase price by 4.5% immediately.`,
        formula: `New Price: ₹${(p.price * 1.045).toFixed(2)}`,
        impact: `Estimated Monthly Profit Gain: ₹${(p.revenue30d * 0.045).toFixed(0)}`,
        urgency: isWeekendWindow ? "CRITICAL" : "MEDIUM"
      });
    });

    return NextResponse.json({
      success: true,
      stats: {
        // ✅ FIX 4: Typed 'a' and 'b' for these reductions! 
        deadStockValue: deadStock.reduce((a: number, b: { stock: number; price: number }) => a + (b.stock * b.price), 0),
        atRiskCount: deadStock.length,
        potentialGain: analyzed.reduce((a: number, b: { revenue30d: number }) => a + (b.revenue30d * 0.05), 0)
      },
      plays
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "System Crash" }, { status: 500 });
  }
}