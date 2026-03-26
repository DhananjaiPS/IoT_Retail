import Stripe from "stripe";
import { NextResponse } from "next/server";

// 1. Fixed Version String
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover", 
});

export async function POST(req: Request) {
  try {
    // 2. Ensure 'items' is only declared here
    const { items } = await req.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: items.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [], // Defensive check
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      success_url: `${req.headers.get("origin")}/success`,
      cancel_url: `${req.headers.get("origin")}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}