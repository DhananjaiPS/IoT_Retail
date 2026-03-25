"use client";

import React, { useState, useEffect, useRef } from 'react'; // <<< ADDED useRef IMPORT
import { ShoppingCart, Scan, Zap, Users, Wifi, Globe, Star, Plus, Minus, Trash2 } from 'lucide-react';
import { Show, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { Product } from '../types/product'; // Assuming Product is defined here
import { useCartState } from '../hooks/useCartState';
import { useWebSocket } from '../hooks/useWebSocket';
import ProductCard from '../component/ProductCard';
import ProductDetailView from '../component/ProductDetailView';
import HeroCarousel from '../component/HeroCarousel';
// import SmartStore from './ProductFetcher'; 
// import SmartStore from '../component/ProductFetcher'; 
import { RecommendationSection } from '../component/RecommendationSection';

// --- Local Data & Mock API Logic (Unchanged) ---
const fetchApiProducts = async (setApiLoading: (b: boolean) => void, setApiProducts: (p: Product[]) => void) => {
    setApiLoading(true);

    const DUMMY_API_URL = 'https://dummyjson.com/products/search?q=iphone';


    try {
        const response = await fetch(DUMMY_API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch from DummyJSON: ${response.statusText}`);
        }

        const data = await response.json();
        const mappedProducts: Product[] = data.products.slice(0, 8).map((p: any) => ({
            id: p.id.toString(),
            name: p.title,
            price: p.price,
            category: p.category,
            image: p.thumbnail,
            rating: p.rating ? p.rating.toFixed(1) : null,
            url: `https://dummyjson.com/products/${p.id}`,
            description: p.description,
            isFeatured: false,
            quantity: 0, // Ensure Product has necessary cart properties
        }));

        if (mappedProducts.length > 0) {
            setApiProducts(mappedProducts);
        } else {
            throw new Error("DummyJSON returned no products.");
        }

    } catch (error) {
        console.error("Error fetching API products, using local fallback data:", error instanceof Error ? error.message : "An unknown error occurred");
        const demoProducts: Product[] = [
            { id: 'web-1', name: 'Organic Milk', price: 4.99, category: 'Dairy', image: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcS0_NQza3RqWjVBadUPVLpLHCh1sjIBdFuNC3QTaqfn-sTRymjcSJ1GwgEaogr4B6Ly_U6hc6E', quantity: 0 },
            { id: 'web-2', name: 'Fresh Apples', price: 3.49, category: 'Fruits', image: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSKAAdXHio87E-1XjrnpRLNEKHA__ycY3hU6ABEr0re-FtczMl3-1rpjXz4xIXP0fI0LJfYLh3x', quantity: 0 },
            { id: 'web-3', name: 'Coffee Beans', price: 12.99, category: 'Beverages', image: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSpOsjqHBWfkQIOOFDGGzv2c6vn7f_eJuQKmKexkUuYCNhALcb2hxXHMg2keaasD_4bZfbCUSY', quantity: 0 },
            { id: 'web-4', name: 'Cookies Pack', price: 5.99, category: 'Snacks', image: 'https://m.media-amazon.com/images/I/710+fYK2loL.jpg', quantity: 0 },
        ];
        setApiProducts(demoProducts.slice(0, 4).map(p => ({ ...p, category: "API Fallback" })));

    } finally {
        setApiLoading(false);
    }
};

const demoProducts: Product[] = [
    { id: 'web-1', name: 'Organic Milk', price: 4.99, category: 'Dairy', image: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcS0_NQza3RqWjVBadUPVLpLHCh1sjIBdFuNC3QTaqfn-sTRymjcSJ1GwgEaogr4B6Ly_U6hc6E', quantity: 0 },
    { id: 'web-2', name: 'Fresh Apples', price: 3.49, category: 'Fruits', image: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSKAAdXHio87E-1XjrnpRLNEKHA__ycY3hU6ABEr0re-FtczMl3-1rpjXz4xIXP0fI0LJfYLh3x', quantity: 0 },
    { id: 'web-3', name: 'Coffee Beans', price: 12.99, category: 'Beverages', image: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSpOsjqHBWfkQIOOFDGGzv2c6vn7f_eJuQKmKexkUuYCNhALcb2hxXHMg2keaasD_4bZfbCUSY', quantity: 0 },
    { id: 'web-4', name: 'Cookies Pack', price: 5.99, category: 'Snacks', image: 'https://m.media-amazon.com/images/I/710+fYK2loL.jpg', quantity: 0 },
];

const featuredProducts: Product[] = [
    { id: 'feat-1', name: 'Artisan Bread', price: 4.50, category: 'Bakery', image: '🥖', isFeatured: true, quantity: 0 },
    { id: 'feat-2', name: 'Cherry Tomatoes', price: 2.99, category: 'Produce', image: '🍅', isFeatured: true, quantity: 0 },
    { id: 'feat-3', name: 'Dark Chocolate', price: 3.99, category: 'Snacks', image: '🍫', isFeatured: true, quantity: 0 },
];


const SmartRetailStore: React.FC = () => {
    const { user } = useUser();
    const [crowdLevel, setCrowdLevel] = useState(45);
    const [availableCarts, setAvailableCarts] = useState(12);
    const [apiProducts, setApiProducts] = useState<Product[]>([]);
    const [apiLoading, setApiLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // --- ADDITION 1: Ref for the Cart Items List ---
    const cartListRef = useRef<HTMLDivElement>(null);

    // Cart Management Hook - This holds the central state.
    const { cartItems, updateCartItem, updateQuantity } = useCartState();

    // TEMPORARY REFACTOR TO USE ORIGINAL STATE FOR WS HOOK COMPATIBILITY
    const [localCartItems, setLocalCartItems] = useState<Product[]>([]);
    const { connectionStatus } = useWebSocket(updateCartItem, setLocalCartItems);

    // Sync cart state (placeholder)
    React.useEffect(() => {
    }, []);

    // --- FETCH PRODUCTS EFFECT (Unchanged) ---
    useEffect(() => {
        fetchApiProducts(setApiLoading, setApiProducts);
    }, []);

    // --- UI Helpers (Unchanged) ---
    const getCrowdColor = () => { if (crowdLevel < 40) return 'text-green-500'; if (crowdLevel < 70) return 'text-yellow-500'; return 'text-red-500'; };
    const getCrowdText = () => { if (crowdLevel < 40) return 'Not Busy'; if (crowdLevel < 70) return 'Moderate'; return 'Crowded'; };

    // Cart calculations (using useCartState results directly)
    const cartItemsFinal = cartItems;
    const totalPriceFinal = cartItemsFinal.reduce((sum, item) => sum + (item.price * (item.quantity || 0)), 0);
    const totalItemsFinal = cartItemsFinal.reduce((sum, item) => sum + (item.quantity || 0), 0);

    // --- CHECKOUT LOGIC (Unchanged) ---
    const handleCheckout = () => {
        if (totalItemsFinal === 0) {
            alert("Your cart is empty! Please scan items before proceeding to payment.");
            return;
        }

        const transferableCart = cartItemsFinal.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            seller: (item as any).seller || null,
            category: item.category,
        }));

        if (typeof window !== 'undefined') {
            sessionStorage.setItem('currentCartItems', JSON.stringify(transferableCart));
        }

        console.log("Routing to /PaymentPage...");
        window.location.href = '/PaymentPage';
    };

    // --- ADDITION 2: Scroll Handler Function ---
    const handleHeaderCartClick = () => {
        if (cartListRef.current) {
            cartListRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Optional: Visually highlight the cart container briefly
            const cartContainer = cartListRef.current.closest('.lg\\:top-24');
            if (cartContainer) {
                cartContainer.classList.add('flash-highlight');
                setTimeout(() => {
                    cartContainer.classList.remove('flash-highlight');
                }, 800);
            }
        }
    };
    // ------------------------------------------

    // --- Conditional Rendering for Detail View (Unchanged) ---
    if (selectedProduct) {
        return (
            <ProductDetailView
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                updateCartItem={updateCartItem}
            />
        );
    }
    // ---------------------------------------------

    return (
        <div className='flex flex-col'>
            <div className="min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden">

                {/* Header */}
                <header className="sticky top-0 z-20 border-b border-blue-200 backdrop-blur-md bg-white/90 shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <Wifi className={`w-6 h-6 sm:w-8 sm:h-8 ${connectionStatus === 'connected' ? 'text-green-600 animate-pulse' : 'text-gray-400'}`} />
                                {connectionStatus === 'connected' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>}
                            </div>
                            <div>
                                <h1 className=" text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    SmartCart IoT
                                </h1>
                                <p className="text-xs text-gray-500 hidden md:block">Status: <span className='font-semibold'>{connectionStatus.toUpperCase()}</span></p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Clerk Authentication Buttons */}
                            <Show when="signed-out">
                                <SignInButton />
                                <SignUpButton>
                                    <button className="bg-[#6c47ff] hover:bg-[#5a39df] text-white rounded-full font-medium text-sm sm:text-base h-10 px-4 sm:px-5 cursor-pointer shadow-md transition-colors">
                                        Sign Up
                                    </button>
                                </SignUpButton>
                            </Show>
                            <Show when="signed-in">
                                <div className="flex items-center space-x-3">
                                    {/* Show Name */}
                                    {/* Show Name */}
                                    {user && (
                                        <span className="font-medium text-gray-700 hidden sm:block">
                                            Hi, {user.fullName || user.username || user.primaryEmailAddress?.emailAddress}
                                        </span>
                                    )}

                                    {/* Clerk Avatar Button */}
                                    <UserButton />
                                </div>
                            </Show>

                            {/* Button: ADDITION 3: Attach the new click handler */}
                            <button
                                onClick={handleHeaderCartClick} // <<< ADDED CLICK HANDLER HERE
                                className="relative bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-full transition-all transform hover:scale-105 shadow-xl shadow-blue-500/40"
                            >
                                <div className="flex items-center space-x-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    <span className="hidden sm:inline font-semibold">Total Items</span>
                                    {totalItemsFinal > 0 && (
                                        <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold animate-bounce">
                                            {totalItemsFinal}
                                        </span>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <HeroCarousel />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                        <div className="lg:col-span-2 order-2 lg:order-1">

                            {/* Store Metrics (Unchanged) */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
                                <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-l-green-500">
                                    <div className="flex items-center">
                                        <Users className={`w-5 h-5 mr-2 ${getCrowdColor()}`} />
                                        <h3 className="font-semibold text-sm text-gray-700">Crowd Level</h3>
                                    </div>
                                    <p className="text-xl sm:text-2xl font-bold mt-1">{crowdLevel.toFixed(0)}%</p>
                                    <p className={`text-xs ${getCrowdColor()}`}>{getCrowdText()}</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-l-blue-500">
                                    <div className="flex items-center">
                                        <ShoppingCart className="w-5 h-5 mr-2 text-blue-500" />
                                        <h3 className="font-semibold text-sm text-gray-700">Available Carts</h3>
                                    </div>
                                    <p className="text-xl sm:text-2xl font-bold mt-1">{availableCarts}</p>
                                    <p className="text-xs text-blue-500">Self-checkout ready</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-l-indigo-500 col-span-2 md:col-span-1">
                                    <div className="flex items-center">
                                        <Globe className="w-5 h-5 mr-2 text-indigo-500" />
                                        <h3 className="font-semibold text-sm text-gray-700">System Status</h3>
                                    </div>
                                    <p className="text-xl font-bold mt-1">IoT Connected</p>
                                    <p className={`text-xs ${connectionStatus === 'connected' ? 'text-green-500' : 'text-gray-500'}`}>Reader {connectionStatus}</p>
                                </div>
                            </div>

                            {/* SmartStore Placeholder (Unchanged) */}
                            <div className="pt-4 border-t border-gray-200 mt-12">
                                {/* <SmartStore updateParentCart={updateCartItem} />  */}
                            </div>

                            {/* API Products Section (Unchanged) */}
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center pt-4 border-t border-gray-200">
                                <Zap className='w-6 h-6 sm:w-8 sm:h-8 mr-3 text-indigo-500 fill-indigo-500' />
                                Today's Deals: Electronics
                            </h2>
                            <p className='mb-6 text-gray-600'>Click any product to see its details!</p>
                            {apiLoading ? (
                                <div className="text-center py-8 text-lg font-medium text-gray-500">Loading live deals...</div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-12">
                                    {apiProducts.map(product => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            onSelectProduct={setSelectedProduct}
                                            updateCartItem={updateCartItem} // Unchanged event
                                        />
                                    ))}
                                </div>
                            )}

                            {/* AI RECOMMENDATION SECTION (Unchanged) */}
                            <RecommendationSection
                                cartItems={cartItemsFinal}
                                updateCartItem={updateCartItem} // Unchanged event
                                onSelectProduct={setSelectedProduct}
                            />

                            {/* Featured Products Section (Unchanged) */}
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center pt-4 border-t border-gray-200">
                                <Star className='w-6 h-6 sm:w-8 sm:h-8 mr-3 text-amber-500 fill-amber-500' />
                                Featured Products
                            </h2>
                            <p className='mb-6 text-gray-600'>Check out our top picks this week!</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
                                {featuredProducts.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onSelectProduct={setSelectedProduct}
                                        updateCartItem={updateCartItem} // Unchanged event
                                    />
                                ))}
                            </div>


                            {/* Static Online Products (Unchanged) */}
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4 pt-4 border-t border-gray-200">Browse Online Products</h2>
                            <p className='mb-6 text-gray-600'>Add items using our website interface, or scan physical items with your RFID reader to see them appear on the right!</p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                                {demoProducts.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onSelectProduct={setSelectedProduct}
                                        updateCartItem={updateCartItem} // Unchanged event
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Shopping Cart (Right Side) */}
                        <div className="lg:col-span-1 order-1 lg:order-2">
                            <div className="lg:sticky lg:top-24 bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-blue-300 h-fit">
                                <div className="flex items-center justify-between mb-4 sm:mb-6 border-b pb-2">
                                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
                                        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
                                        Your Cart
                                        <span className='ml-2 text-sm text-gray-500 font-normal'>({totalItemsFinal} items)</span>
                                    </h2>
                                </div>

                                {/* Cart Items List: ADDITION 4: Attach the ref here */}
                                <div
                                    ref={cartListRef} // <<< ATTACHED REF
                                    className="space-y-3 max-h-[70vh] lg:max-h-[50vh] overflow-y-auto mb-4 pr-1"
                                >
                                    {cartItemsFinal.length === 0 ? (
                                        <p className="text-gray-500 italic text-center py-4 text-sm flex flex-col items-center justify-center">
                                            <Scan className="w-6 h-6 mb-2 text-gray-400" />
                                            Scan a product with the RFID reader to add it!
                                        </p>
                                    ) : (
                                        cartItemsFinal.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200 transition duration-150">

                                                {/* Left Side: Product Details (Unchanged) */}
                                                <div className="flex items-center space-x-3 flex-grow min-w-0">
                                                    {item.image.startsWith('http') ? (
                                                        <img src={item.image} alt={item.name} className="w-10 h-10 object-contain rounded-md flex-shrink-0" />
                                                    ) : (
                                                        <span className="text-2xl flex-shrink-0">{item.image}</span>
                                                    )}

                                                    <div className='flex-grow min-w-0'>
                                                        <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                                                        <p className="text-xs text-gray-500 line-clamp-1">{item.description || (item as any).qtyLabel || item.category}</p>
                                                        <p className="text-sm text-blue-600 font-bold mt-1">₹ {item.price.toFixed(2)}</p>
                                                        {(item as any).time && <p className='text-xs text-gray-400 mt-0.5'>Scanned: {(item as any).time}</p>}
                                                    </div>
                                                </div>

                                                {/* Right Side: Quantity Controls (Unchanged events) */}
                                                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, -1)} // Unchanged event
                                                        className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                                                        title={(item.quantity || 0) <= 1 ? 'Remove Item' : 'Decrease Quantity'}
                                                    >
                                                        {(item.quantity || 0) <= 1 ? <Trash2 className='w-4 h-4' /> : <Minus className='w-4 h-4' />}
                                                    </button>

                                                    <span className="w-6 text-center font-bold text-gray-800">{item.quantity || 0}</span>

                                                    <button
                                                        onClick={() => updateQuantity(item.id, 1)} // Unchanged event
                                                        className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition"
                                                        title="Increase Quantity"
                                                    >
                                                        <Plus className='w-4 h-4' />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Total and Checkout (Unchanged event) */}
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center text-lg font-semibold mb-4">
                                        <span>Subtotal:</span>
                                        <span className="text-blue-600">₹{totalPriceFinal.toFixed(2)}</span>
                                    </div>

                                    <button
                                        onClick={handleCheckout} // Unchanged event
                                        disabled={totalItemsFinal === 0}
                                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition duration-200 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
                                    >
                                        Proceed to Checkout
                                    </button>
                                </div>


                            </div>
                        </div>
                    </div>
                </main>

            </div>
        </div>
    );
};

export default SmartRetailStore;