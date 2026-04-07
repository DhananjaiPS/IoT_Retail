import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Cache structure: Map keeps insertion order.
const recommendationCache = new Map<string, { ids: string[], timestamp: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_SIZE = 200;

// Initialize Gemini SDK. Fail gracefully if missing key.
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cartNames } = body;

    if (!cartNames || !Array.isArray(cartNames) || cartNames.length === 0) {
      return NextResponse.json({ success: false, error: "Empty cart" }, { status: 400 });
    }

    // 1. Check L1 Memory Cache
    const normalizedCart = cartNames.map(n => String(n).toLowerCase().trim()).sort();
    const cacheKey = `rec:v1:${normalizedCart.join('|')}`;
    
    const cachedEntry = recommendationCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
        // Cache Hit! Re-hydrate directly from DB
        console.log(`[CACHE HIT] Returning L1 Cached Recommendations for: ${cacheKey}`);
        const cachedProducts = await prisma.product.findMany({
            where: { id: { in: cachedEntry.ids } },
        });
        return NextResponse.json({ success: true, products: cachedProducts });
    }

    if (!genAI) {
      return NextResponse.json({ success: false, error: "Missing Gemini API Key." }, { status: 500 });
    }

    // 2. Fetch bounded candidates from DB (exclude exact cart matches, max 40)
    const availableProducts = await prisma.product.findMany({
      where: {
        name: { notIn: cartNames },
      },
      take: 40,
      orderBy: { createdAt: 'desc' }, // Short-term relevance metric
      select: {
        id: true,
        name: true,
        category: true,
      },
    });

    if (availableProducts.length === 0) {
      return NextResponse.json({ success: false, error: "No products in DB" }, { status: 404 });
    }

    // 3. Query Gemini for Reranking / Pairing
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `
      You are an expert E-commerce AI recommendation engine.
      A user has the following items in their cart: ${JSON.stringify(cartNames)}.
      
      Below is the list of products available in the database:
      ${JSON.stringify(availableProducts)}

      Select up to 4 products from the database that are the BEST pairings or most frequently bought together with the items in the cart. Ensure you only select items that are NOT currently in the cart.
      
      Respond ONLY with a valid, raw JSON array containing exactly the string IDs of the recommended products. Do not include markdown formatting or backticks like \`\`\`json.
      Example: ["clk123abc...", "clk456def..."]
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    let recommendedIds: string[] = [];

    try {
      // Strip any potential markdown
      const cleanedJson = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
      recommendedIds = JSON.parse(cleanedJson);
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", responseText);
      return NextResponse.json({ success: false, error: "AI output could not be parsed" }, { status: 500 });
    }

    if (!Array.isArray(recommendedIds) || recommendedIds.length === 0) {
      return NextResponse.json({ success: false, error: "AI returned empty array" }, { status: 404 });
    }

    // 4. Update L1 Cache (Evict oldest if over capacity)
    if (recommendationCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = recommendationCache.keys().next().value;
      if (oldestKey) recommendationCache.delete(oldestKey);
    }
    recommendationCache.set(cacheKey, { ids: recommendedIds, timestamp: Date.now() });

    // 5. Fetch full products for those IDs from Prisma
    const recommendedProducts = await prisma.product.findMany({
      where: {
        id: { in: recommendedIds },
      },
    });

    return NextResponse.json({ success: true, products: recommendedProducts });
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return NextResponse.json({ success: false, error: "Internal error checking recommendations" }, { status: 500 });
  }
}
