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

        // 2. BESTSELLERS: Jo sabse zyada bike hain (Sort by orderItems count)
        const sortedBySales = [...allProducts].sort((a, b) => b._count.orderItems - a._count.orderItems);
        const bestsellers = sortedBySales.slice(0, 4);

        // 3. DEAD STOCK / CLEARANCE: Jo sabse kam bike hain (Count 0 ya sabse kam)
        const deadStock = [...allProducts].sort((a, b) => a._count.orderItems - b._count.orderItems).slice(0, 4);

        // 4. RECENTLY BOUGHT: Latest orders mein jo items gaye hain
        const recentOrderItems = await prisma.orderItem.findMany({
            orderBy: { order: { createdAt: 'desc' } },
            take: 20,
            include: { product: true }
        });
        
        // Remove duplicates so we get unique recent products
        const recentMap = new Map();
        recentOrderItems.forEach(item => {
            if (!recentMap.has(item.productId)) recentMap.set(item.productId, item.product);
        });
        let recent = Array.from(recentMap.values()).slice(0, 8);
        
        // Agar koi order hi nahi hua hai ab tak, toh normal products dikha do recent mein
        if (recent.length === 0) recent = allProducts.slice(0, 8);

        // 5. STANDARD PRODUCTS: Online browse section ke liye
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