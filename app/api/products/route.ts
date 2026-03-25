import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        const newProduct = await prisma.product.create({
            data: {
                name: body.name,
                description: body.description || "No description provided.",
                price: parseFloat(body.price),
                stockQuantity: parseInt(body.stockQuantity),
                category: body.category || "General",
                images: body.image ? [body.image] : [],
            }
        });

        return NextResponse.json({ success: true, product: newProduct });
    } catch (error) {
        console.error("Add Product Error:", error);
        return NextResponse.json({ success: false, error: "Failed to add product" }, { status: 500 });
    }
}