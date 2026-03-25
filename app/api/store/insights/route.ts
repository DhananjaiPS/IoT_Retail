import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // 1. Saare products fetch karo aur dekho koun kitni baar bika hai
        const allProducts = await prisma.product.findMany({
            include: { _count: { select: { orderItems: true } } }
        });

        if (allProducts.length === 0) {
            return NextResponse.json({ success: true, recent: [], bestsellers: [], deadStock: [], standard: [] });
        }

        // 2. BESTSELLERS: Jo sabse zyada bike hain
        // ✅ FIX: Added ': any' to 'a' and 'b' for sorting
        const sortedBySales = [...allProducts].sort((a: any, b: any) => b._count.orderItems - a._count.orderItems);
        const bestsellers = sortedBySales.slice(0, 4);

        // 3. DEAD STOCK / CLEARANCE
        // ✅ FIX: Added ': any' to 'a' and 'b'
        const deadStock = [...allProducts].sort((a: any, b: any) => a._count.orderItems - b._count.orderItems).slice(0, 4);

        // 4. RECENTLY BOUGHT
        const recentOrderItems = await prisma.orderItem.findMany({
            orderBy: { order: { createdAt: 'desc' } },
            take: 20,
            include: { product: true }
        });
        
        const recentMap = new Map();
        // ✅ FIX: Added ': any' to 'item' to satisfy strict mode
        recentOrderItems.forEach((item: any) => {
            if (!recentMap.has(item.productId)) recentMap.set(item.productId, item.product);
        });
        let recent = Array.from(recentMap.values()).slice(0, 8);
        
        if (recent.length === 0) recent = allProducts.slice(0, 8);

        // 5. STANDARD PRODUCTS
        const standard = allProducts.slice(0, 8);

        return NextResponse.json({ 
            success: true, 
            recent, 
            bestsellers, 
            deadStock, 
            standard 
        });

    } catch (error) {
        console.error("Store Insights Error:", error);
        return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
    }
}