import Stripe from "stripe";

// Provide a dummy fallback so the Next.js build doesn't crash if STRIPE_SECRET_KEY is missing
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123');

export async function POST(req) {
  try {
    const body = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Premium Plan",
            },
            unit_amount: 49900, // ₹499
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
    });

    return Response.json({ id: session.id });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}