// app/component/RecommendationSection.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Zap, Star } from 'lucide-react';
import { GiAzulFlake } from "react-icons/gi";
// import SmartStore from './ProductFetcher';

// --- Interfaces (Product structure) ---
interface Product {
    id: string; 
    name: string;
    price: number; 
    category: string;
    image: string; 
    quantity?: number;
    isFeatured?: boolean;
    description?: string;
    rating?: string | null;
}

interface RecommendationSectionProps {
    cartItems: Product[];
    updateCartItem: (p: Product, qty: number) => void;
    onSelectProduct: (p: Product) => void;
}

// --- Helper Component: Recommendation Card (Styling remains the same) ---
const RecommendationProductCard: React.FC<{ product: Product, onSelectProduct: (p: Product) => void, updateCartItem: (p: Product) => void }> = ({ product, onSelectProduct, updateCartItem }) => {
    // Price formatting helper for consistency
    const priceDisplay = typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price || '0').toFixed(2);
    
    return (
        <div 
            className={`p-4 sm:p-5 rounded-xl shadow-lg transform hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative cursor-pointer bg-red-50 border-2 border-red-300`}
            onClick={() => onSelectProduct(product)}
        >
            <div className="absolute top-0 left-0 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg rounded-tl-xl flex items-center">
                <Zap className='w-3 h-3 mr-1 fill-white'/> AI Recommended
            </div>

            <div className="text-center mb-3 h-32 sm:h-40 flex items-center justify-center pt-4">
              {product.image.startsWith('http') ? (
                  <img src={product.image} alt={product.name} className="max-w-full max-h-32 sm:max-h-40 object-contain" />
              ) : (
                  <span className="text-5xl sm:text-6xl">{product.image}</span>
              )}
            </div>
            
            <h3 className="text-base sm:text-lg font-semibold mb-1 truncate" title={product.name}>{product.name}</h3>
            
            <div className='flex justify-between items-center mb-3 text-xs sm:text-sm'>
              {product.rating && <p className="text-yellow-500 font-bold">⭐ {product.rating}</p>}
              <p className="text-red-600 ">{product.category}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-lg sm:text-xl font-bold text-red-600">₹{priceDisplay}</span>
                
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); 
                        updateCartItem(product); 
                    }} 
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-md"
                    title="Add Recommended Item"
                >
                    <Star className="w-5 h-5 fill-white" />
                </button>
            </div>
        </div>
    );
};

const FallBack:Product={
    id: "FALLBACK-1",
    name: "Daily Essentials Pack",
    price: 149.00,
    category: "General",
    image: "🛒",
    rating: "4.5",
    description: "Best pick for your daily needs.",
}
// --- LOCAL PRODUCT MAPPING for specific recommendations ---
// This acts as a database for the recommendations themselves.
const LOCAL_RECOMMENDATIONS: Record<string, Product> = {
    // Specific pairings for your provided products
    'phone_case': { id: 'R-CASE', name: 'Shockproof Clear Case', price: 999.00, category: 'Accessory', image: '📱', rating: '4.8', description: 'Essential protection for your iPhone.' },
    'smartwatch_strap': { id: 'R-STRAP', name: 'Sport Watch Strap (Red)', price: 450.00, category: 'Accessory', image: '⌚', rating: '4.5', description: 'Upgrade your Fire-Boltt look.' },
    'butter': { id: 'R-BUTT', name: 'Fresh Salted Butter', price: 85.00, category: 'Dairy', image: '🧈', rating: '4.7', description: 'Perfect pairing for your bread.' },
    'cheese': { id: 'R-CHEZ', name: 'Amul Cheese Slices (10pk)', price: 150.00, category: 'Dairy', image: '🧀', rating: '4.6', description: 'Great for breakfast sandwiches.' },
    'vegetable_masala': { id: 'R-VEG', name: 'A-Grade Veggie Masala Pack', price: 50.00, category: 'Spice', image: '🌶️', rating: '4.4', description: 'Enhance your Maggi flavor.' },
    'hot_chocolate': { id: 'R-CHOC', name: 'Swiss Hot Chocolate Mix', price: 300.00, category: 'Beverage', image: '☕', rating: '4.9', description: 'Pairs perfectly with cookies and toffee.' },
    'apple_peeler': { id: 'R-PEEL', name: 'Stainless Steel Apple Peeler', price: 199.00, category: 'Tool', image: '🔪', rating: '4.3', description: 'A must-have for preparing fruit.' },
    'cereal_flakes': { id: 'R-CERL', name: 'Crunchy Corn Flakes 500g', price: 180.00, category: 'Breakfast', image: '🥣', rating: '4.4', description: 'Pair with your Organic Milk.' },
    'coffee_mug': { id: 'R-MUG', name: 'Insulated Travel Mug', price: 550.00, category: 'Kitchen', image: '🥤', rating: '4.6', description: 'Keep your Coffee Beans hot!' },
    'tea_biscuits': { id: 'R-BIS', name: 'Parle-G Tea Biscuits', price: 30.00, category: 'Snacks', image: '🍪', rating: '4.2', description: 'The classic accompaniment for tea/coffee.' },
};


// --- CORE AI MAPPING (FUZZY LOGIC READY) ---
// Key is a root keyword or product name.
// Value is an array of recommended *search terms* (for DummyJSON) OR a specific *LOCAL_RECOMMENDATIONS* key (prefixed with 'LOCAL:').
const RECOMMENDATION_MAP: Record<string, string[]> = {
    // 1. SPECIFIC PRODUCT PAIRINGS (High Priority)
    "iphone 12": ["LOCAL:phone_case", "airpods"],
    "fire-boltt": ["LOCAL:smartwatch_strap", "portable speaker"],
    "multi-grain bread": ["LOCAL:butter", "LOCAL:cheese"],
    "maggi": ["LOCAL:vegetable_masala", "spicy sauce"],
    "cookieman choco chunk cookies": ["LOCAL:hot_chocolate", "milk"],
    "alpenliebe": ["LOCAL:hot_chocolate", "snack box"],
    "amul school pack butter": ["LOCAL:cheese", "multi-grain bread"], // Recommend bread/cheese to go with butter
    "cadbury dairy milk silk": ["gift box", "coffee"],
    "organic milk": ["LOCAL:cereal_flakes", "oatmeal", "sugar"],
    "fresh apples": ["LOCAL:apple_peeler", "cinnamon", "pie"],
    "coffee beans": ["LOCAL:coffee_mug", "espresso machine", "tea"],
    "cookies pack": ["LOCAL:tea_biscuits", "ice cream"],
    "artisan bread": ["LOCAL:butter", "jam", "knife"],
    "cherry tomatoes": ["olive oil", "balsamic vinegar", "cheese"],
    "dark chocolate": ["coffee", "wine", "sea salt"],


    // 2. GENERAL FUZZY MATCHING (Lower Priority, uses DummyJSON API search)
    "iphone": ["charger", "case", "headphones"],
    "watch": ["strap", "battery"],
    "bread": ["butter", "jam"],
    "milk": ["fruit", "cereal"],
    "coffee": ["mug", "coffee maker"],
    "apple": ["fruit", "cinnamon"],
    "juice": ["kiwi", "soda"],
    // ... (rest of the general map remains the same for diversity)
    "serum": ["moisturizer", "cream", "face wash", "lotion"],
    "cream": ["lotion", "serum", "face wash", "sunscreen"],
    "oil": ["lotion", "shampoo", "conditioner"],
    "shirt": ["jeans", "trousers", "belt", "tie"],
    "shoe": ["socks", "shoe cleaner", "shoe lace", "insole"],
    "knife": ["cutting board", "sharper", "cooking"],
};


// --- CORE RECOMMENDATION LOGIC (USES FUZZY MATCHING) ---
export async function getRecommendations(cartNames: string[]): Promise<Product[]> {
    if (cartNames.length === 0) {
        return [];
    }

    // Use the most recent item for recommendation
    const normalizedName = cartNames[0].toLowerCase(); 
    
    let mapKey = '';
    
    // 1. FUZZY MATCHING LOGIC
    // Find the best match, preferring specific product names first.
    for (const key of Object.keys(RECOMMENDATION_MAP)) {
        if (normalizedName.includes(key)) {
            mapKey = key;
            break; 
        }
    }

    // 2. Handle Fallback
    if (!mapKey) {
         console.log(`🤖 No specific rule found for: ${normalizedName}. Falling back to general search.`);
         const fallbackTerms = ["daily needs", "tech accessory", "home decor", "gift"];
         const searchTerm = fallbackTerms[Math.floor(Math.random() * fallbackTerms.length)];
         return fetchProductsFromDummy(searchTerm, cartNames);
    }
    
    // 3. Get recommended items/search terms
    const recommendedItemNames = RECOMMENDATION_MAP[mapKey] || [];
    if (recommendedItemNames.length === 0) return [];
    
    // TEMPORARY FIX: Force selection of the first recommended key for testing local pairings.
    let recommendationKey = recommendedItemNames[0]; 
    // After testing, revert to: const recommendationKey = recommendedItemNames[Math.floor(R random() * recommendedItemNames.length)];

    console.log(`🧠 AI Match SUCCESS: Cart item "${cartNames[0]}" matched key "${mapKey}". FORCED Recommendation Key: ${recommendationKey}`);

    // 4. Check if it's a local recommendation or an API search
    if (recommendationKey.startsWith('LOCAL:')) {
        const localId = recommendationKey.replace('LOCAL:', '');
        const product = LOCAL_RECOMMENDATIONS[localId];
        if (product) {
            // Ensure the specific local product is not already in the cart
            if (!cartNames.includes(product.name)) {
                 // Clone and ensure price is number for type safety
                console.log(`✅ LOCAL MATCH FOUND: Returning ${product.name}`);
                return [{ ...product, price: parseFloat(product.price.toString()), category: `${product.category} (Paired)` }];
            }
            console.warn(`⚠️ LOCAL ITEM ALREADY IN CART: ${product.name}. Falling back to API search.`);
        }
        // If local item is already in cart or not found, fall back to a general search
        return fetchProductsFromDummy(localId.replace('_', ' '), cartNames, mapKey);
    }
    
    // 5. External API Search (Default)
    return fetchProductsFromDummy(recommendationKey, cartNames, mapKey);
}

// Helper function to handle the API call and mapping
async function fetchProductsFromDummy(searchTerm: string, cartNames: string[], mapKey: string = 'General'): Promise<Product[]> {
    const DUMMY_API_URL = `https://dummyjson.com/products/search?q=${searchTerm}`;
    
    try {
        const response = await fetch(DUMMY_API_URL);
        const data = await response.json();
        
        // Map and filter results
        const mappedProducts: Product[] = data.products
            .slice(0, 4) 
            .filter((p: any) => !cartNames.map(n => n.toLowerCase()).includes(p.title.toLowerCase()))
            .map((p: any) => ({
                id: `gem-${p.id}-${searchTerm}`, 
                name: p.title,
                price: p.price, 
                // Show the keyword that triggered the recommendation
                category: `Matched: ${mapKey.toUpperCase()}`, 
                image: p.thumbnail, 
                rating: p.rating ? p.rating.toFixed(1) : null,
                url: `https://dummyjson.com/products/${p.id}`, 
                description: p.description,
                isFeatured: true, 
            }));

        return mappedProducts;

    } catch (error) {
        console.error("Failed to fetch recommendations from DummyJSON:", error);
        return [];
    }
}


/**
 * Main Recommendation Section Component
 */
export const RecommendationSection: React.FC<RecommendationSectionProps> = ({ cartItems, updateCartItem, onSelectProduct }) => {
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const fetchRecommendations = async () => {
            // Sort cart items so the most recently added item (at the top of the cart array) is prioritized for recommendation.
            // Note: If cartItems isn't reliably sorted by time, you might need an explicit time property sort here.
            const cartNames = cartItems.map(item => item.name);
            
            if (cartNames.length === 0) {
                setRecommendations([]);
                return;
            }

            setLoading(true);
            const newRecommendations = await getRecommendations(cartNames); 
            setRecommendations(newRecommendations);
            setLoading(false);
        };

        const handler = setTimeout(() => {
            fetchRecommendations();
        }, 800); 

        return () => { clearTimeout(handler); };
    }, [cartItems]); 

    if (cartItems.length === 0) {
        return null;
    }
    
    return (
        <div className="mt-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center pt-4 border-t border-indigo-200">
                <GiAzulFlake className='w-6 h-6 sm:w-8 sm:h-8 mr-3 bg-red-500 fill-red-200'/>
                AI Smart Pairings 🧠 
            </h2>
            <p className='mb-6 text-gray-600 font-semibold'>
                Based on your cart item: {cartItems[0]?.name || '...'}, we found these smart pairings!
            </p>

            {loading ? (
                <div className="text-center py-8 text-lg font-medium text-indigo-500 flex items-center justify-center">
                    <Zap className='w-5 h-5 mr-2 animate-pulse'/>
                    Generating smart pairings...
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {recommendations.map(product => (
                        <RecommendationProductCard
                            key={product.id} 
                            product={product} 
                            onSelectProduct={onSelectProduct} 
                            updateCartItem={(p) => updateCartItem(p, 1)} 
                        />
                    ))}
                    {recommendations.length === 0 && (
                        <RecommendationProductCard
                            key={FallBack.id} 
                            product={FallBack} 
                            onSelectProduct={onSelectProduct} 
                            updateCartItem={(p) => updateCartItem(p, 1)} 
                        />
                    )}
                </div>
            )}
        </div>
    );
};