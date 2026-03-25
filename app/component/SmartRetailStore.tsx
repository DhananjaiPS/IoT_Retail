// "use client";

// import React, { useState, useEffect, useRef } from 'react'; // <<< ADDED useRef IMPORT
// import { ShoppingCart, Scan, Zap, Users, Wifi, Globe, Star, Plus, Minus, Trash2 } from 'lucide-react';
// import { Product } from '../types/product'; // Assuming Product is defined here
// import { useCartState } from '../hooks/useCartState';
// import { useWebSocket } from '../hooks/useWebSocket';
// import ProductCard from '../component/ProductCard';
// import ProductDetailView from '../component/ProductDetailView';
// import HeroCarousel from '../component/HeroCarousel';
// // import SmartStore from './ProductFetcher'; 
// // import SmartStore from '../component/ProductFetcher'; 
// import { RecommendationSection } from '../component/RecommendationSection'; 

// // --- Local Data & Mock API Logic (Unchanged) ---
// const fetchApiProducts = async (setApiLoading: (b: boolean) => void, setApiProducts: (p: Product[]) => void) => {
//     setApiLoading(true);
    
//     const DUMMY_API_URL = 'https://dummyjson.com/products/search?q=iphone'; 
   

//     try {
//       const response = await fetch(DUMMY_API_URL);
//       if (!response.ok) {
//         throw new Error(`Failed to fetch from DummyJSON: ${response.statusText}`);
//       }
      
//       const data = await response.json();
//       const mappedProducts: Product[] = data.products.slice(0, 8).map((p: any) => ({
//         id: p.id.toString(), 
//         name: p.title,
//         price: p.price, 
//         category: p.category,
//         image: p.thumbnail, 
//         rating: p.rating ? p.rating.toFixed(1) : null,
//         url: `https://dummyjson.com/products/${p.id}`, 
//         description: p.description,
//         isFeatured: false,
//         quantity: 0, // Ensure Product has necessary cart properties
//       }));

//       if (mappedProducts.length > 0) {
//         setApiProducts(mappedProducts);
//       } else {
//         throw new Error("DummyJSON returned no products.");
//       }
      
//     } catch (error) {
//       console.error("Error fetching API products, using local fallback data:", error instanceof Error ? error.message : "An unknown error occurred");
//       const demoProducts: Product[] = [
//         { id: 'web-1', name: 'Organic Milk', price: 4.99, category: 'Dairy', image: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcS0_NQza3RqWjVBadUPVLpLHCh1sjIBdFuNC3QTaqfn-sTRymjcSJ1GwgEaogr4B6Ly_U6hc6E', quantity: 0 },
//         { id: 'web-2', name: 'Fresh Apples', price: 3.49, category: 'Fruits', image: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSKAAdXHio87E-1XjrnpRLNEKHA__ycY3hU6ABEr0re-FtczMl3-1rpjXz4xIXP0fI0LJfYLh3x', quantity: 0 },
//         { id: 'web-3', name: 'Coffee Beans', price: 12.99, category: 'Beverages', image: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSpOsjqHBWfkQIOOFDGGzv2c6vn7f_eJuQKmKexkUuYCNhALcb2hxXHMg2keaasD_4bZfbCUSY', quantity: 0 },
//         { id: 'web-4', name: 'Cookies Pack', price: 5.99, category: 'Snacks', image: 'https://m.media-amazon.com/images/I/710+fYK2loL.jpg', quantity: 0 },
//       ];
//       setApiProducts(demoProducts.slice(0, 4).map(p => ({...p, category: "API Fallback"})));
      
//     } finally {
//       setApiLoading(false);
//     }
// };

// const demoProducts: Product[] = [
//     { id: 'web-1', name: 'Organic Milk', price: 4.99, category: 'Dairy', image: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcS0_NQza3RqWjVBadUPVLpLHCh1sjIBdFuNC3QTaqfn-sTRymjcSJ1GwgEaogr4B6Ly_U6hc6E', quantity: 0 },
//     { id: 'web-2', name: 'Fresh Apples', price: 3.49, category: 'Fruits', image: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSKAAdXHio87E-1XjrnpRLNEKHA__ycY3hU6ABEr0re-FtczMl3-1rpjXz4xIXP0fI0LJfYLh3x', quantity: 0 },
//     { id: 'web-3', name: 'Coffee Beans', price: 12.99, category: 'Beverages', image: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSpOsjqHBWfkQIOOFDGGzv2c6vn7f_eJuQKmKexkUuYCNhALcb2hxXHMg2keaasD_4bZfbCUSY', quantity: 0 },
//     { id: 'web-4', name: 'Cookies Pack', price: 5.99, category: 'Snacks', image: 'https://m.media-amazon.com/images/I/710+fYK2loL.jpg', quantity: 0 },
// ];

// const featuredProducts: Product[] = [
//     { id: 'feat-1', name: 'Artisan Bread', price: 4.50, category: 'Bakery', image: '🥖', isFeatured: true, quantity: 0 },
//     { id: 'feat-2', name: 'Cherry Tomatoes', price: 2.99, category: 'Produce', image: '🍅', isFeatured: true, quantity: 0 },
//     { id: 'feat-3', name: 'Dark Chocolate', price: 3.99, category: 'Snacks', image: '🍫', isFeatured: true, quantity: 0 },
// ];


// const SmartRetailStore: React.FC = () => {
//     const [crowdLevel, setCrowdLevel] = useState(45);
//     const [availableCarts, setAvailableCarts] = useState(12);
//     const [apiProducts, setApiProducts] = useState<Product[]>([]);
//     const [apiLoading, setApiLoading] = useState(true);
//     const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    
//     // --- ADDITION 1: Ref for the Cart Items List ---
//     const cartListRef = useRef<HTMLDivElement>(null);

//     // Cart Management Hook - This holds the central state.
//     const { cartItems, updateCartItem, updateQuantity } = useCartState(); 
    
//     // TEMPORARY REFACTOR TO USE ORIGINAL STATE FOR WS HOOK COMPATIBILITY
//     const [localCartItems, setLocalCartItems] = useState<Product[]>([]);
//     const { connectionStatus } = useWebSocket(updateCartItem, setLocalCartItems);
    
//     // Sync cart state (placeholder)
//     React.useEffect(() => {
//     }, []);

//     // --- FETCH PRODUCTS EFFECT (Unchanged) ---
//     useEffect(() => {
//         fetchApiProducts(setApiLoading, setApiProducts);
//     }, []);

//     // --- UI Helpers (Unchanged) ---
//     const getCrowdColor = () => { if (crowdLevel < 40) return 'text-green-500'; if (crowdLevel < 70) return 'text-yellow-500'; return 'text-red-500'; };
//     const getCrowdText = () => { if (crowdLevel < 40) return 'Not Busy'; if (crowdLevel < 70) return 'Moderate'; return 'Crowded'; };
    
//     // Cart calculations (using useCartState results directly)
//     const cartItemsFinal = cartItems;
//     const totalPriceFinal = cartItemsFinal.reduce((sum, item) => sum + (item.price * (item.quantity || 0)), 0);
//     const totalItemsFinal = cartItemsFinal.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
//     // --- CHECKOUT LOGIC (Unchanged) ---
//     const handleCheckout = () => {
//         if (totalItemsFinal === 0) {
//             alert("Your cart is empty! Please scan items before proceeding to payment.");
//             return;
//         }

//         const transferableCart = cartItemsFinal.map(item => ({
//             id: item.id,
//             name: item.name,
//             price: item.price,
//             quantity: item.quantity,
//             seller: (item as any).seller || null, 
//             category: item.category,
//         }));

//         if (typeof window !== 'undefined') {
//             sessionStorage.setItem('currentCartItems', JSON.stringify(transferableCart));
//         }

//         console.log("Routing to /PaymentPage...");
//         window.location.href = '/PaymentPage'; 
//     };
    
//     // --- ADDITION 2: Scroll Handler Function ---
//     const handleHeaderCartClick = () => {
//         if (cartListRef.current) {
//             cartListRef.current.scrollIntoView({ 
//                 behavior: 'smooth', 
//                 block: 'start'
//             });

//             // Optional: Visually highlight the cart container briefly
//             const cartContainer = cartListRef.current.closest('.lg\\:top-24');
//             if (cartContainer) {
//                 cartContainer.classList.add('flash-highlight');
//                 setTimeout(() => {
//                     cartContainer.classList.remove('flash-highlight');
//                 }, 800);
//             }
//         }
//     };
//     // ------------------------------------------

//     // --- Conditional Rendering for Detail View (Unchanged) ---
//     if (selectedProduct) {
//         return (
//             <ProductDetailView 
//                 product={selectedProduct} 
//                 onClose={() => setSelectedProduct(null)} 
//                 updateCartItem={updateCartItem}
//             />
//         );
//     }
//     // ---------------------------------------------

//     return (
//         <div className='flex flex-col'>
//             <div className="min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden">
                
//                 {/* Header */}
//                 <header className="sticky top-0 z-20 border-b border-blue-200 backdrop-blur-md bg-white/90 shadow-lg">
//                     <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
//                         <div className="flex items-center space-x-3">
//                             <div className="relative">
//                                 <Wifi className={`w-6 h-6 sm:w-8 sm:h-8 ${connectionStatus === 'connected' ? 'text-green-600 animate-pulse' : 'text-gray-400'}`} />
//                                 {connectionStatus === 'connected' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>}
//                             </div>
//                             <div>
//                                 <h1 className=" text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
//                                     SmartCart IoT
//                                 </h1>
//                                 <p className="text-xs text-gray-500 hidden md:block">Status: <span className='font-semibold'>{connectionStatus.toUpperCase()}</span></p>
//                             </div>
//                         </div>

//                         {/* Button: ADDITION 3: Attach the new click handler */}
//                         <button 
//                             onClick={handleHeaderCartClick} // <<< ADDED CLICK HANDLER HERE
//                             className="relative bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-full transition-all transform hover:scale-105 shadow-xl shadow-blue-500/40"
//                         >
//                             <div className="flex items-center space-x-2">
//                                 <ShoppingCart className="w-5 h-5" />
//                                 <span className="hidden sm:inline font-semibold">Total Items</span>
//                                 {totalItemsFinal > 0 && (
//                                     <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold animate-bounce">
//                                         {totalItemsFinal}
//                                     </span>
//                                 )}
//                             </div>
//                         </button>
//                     </div>
//                 </header>
                
//                 <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
//                     <HeroCarousel/>

//                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

//                         <div className="lg:col-span-2 order-2 lg:order-1">
                            
//                             {/* Store Metrics (Unchanged) */}
//                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
//                                 <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-l-green-500">
//                                     <div className="flex items-center">
//                                         <Users className={`w-5 h-5 mr-2 ${getCrowdColor()}`} />
//                                         <h3 className="font-semibold text-sm text-gray-700">Crowd Level</h3>
//                                     </div>
//                                     <p className="text-xl sm:text-2xl font-bold mt-1">{crowdLevel.toFixed(0)}%</p>
//                                     <p className={`text-xs ${getCrowdColor()}`}>{getCrowdText()}</p>
//                                 </div>
//                                 <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-l-blue-500">
//                                     <div className="flex items-center">
//                                         <ShoppingCart className="w-5 h-5 mr-2 text-blue-500" />
//                                         <h3 className="font-semibold text-sm text-gray-700">Available Carts</h3>
//                                     </div>
//                                     <p className="text-xl sm:text-2xl font-bold mt-1">{availableCarts}</p>
//                                     <p className="text-xs text-blue-500">Self-checkout ready</p>
//                                 </div>
//                                 <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-l-indigo-500 col-span-2 md:col-span-1">
//                                     <div className="flex items-center">
//                                         <Globe className="w-5 h-5 mr-2 text-indigo-500" />
//                                         <h3 className="font-semibold text-sm text-gray-700">System Status</h3>
//                                     </div>
//                                     <p className="text-xl font-bold mt-1">IoT Connected</p>
//                                     <p className={`text-xs ${connectionStatus === 'connected' ? 'text-green-500' : 'text-gray-500'}`}>Reader {connectionStatus}</p>
//                                 </div>
//                             </div>

//                             {/* SmartStore Placeholder (Unchanged) */}
//                             <div className="pt-4 border-t border-gray-200 mt-12">
//                                 {/* <SmartStore updateParentCart={updateCartItem} />  */}
//                             </div>

//                             {/* API Products Section (Unchanged) */}
//                             <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center pt-4 border-t border-gray-200">
//                                 <Zap className='w-6 h-6 sm:w-8 sm:h-8 mr-3 text-indigo-500 fill-indigo-500' />
//                                 Today's Deals: Electronics
//                             </h2>
//                             <p className='mb-6 text-gray-600'>Click any product to see its details!</p>
//                             {apiLoading ? (
//                                 <div className="text-center py-8 text-lg font-medium text-gray-500">Loading live deals...</div>
//                             ) : (
//                                 <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-12">
//                                     {apiProducts.map(product => (
//                                         <ProductCard 
//                                             key={product.id} 
//                                             product={product} 
//                                             onSelectProduct={setSelectedProduct} 
//                                             updateCartItem={updateCartItem} // Unchanged event
//                                         />
//                                     ))}
//                                 </div>
//                             )}
                            
//                             {/* AI RECOMMENDATION SECTION (Unchanged) */}
//                             <RecommendationSection
//                                 cartItems={cartItemsFinal}
//                                 updateCartItem={updateCartItem} // Unchanged event
//                                 onSelectProduct={setSelectedProduct}
//                             />

//                             {/* Featured Products Section (Unchanged) */}
//                             <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center pt-4 border-t border-gray-200">
//                                 <Star className='w-6 h-6 sm:w-8 sm:h-8 mr-3 text-amber-500 fill-amber-500' />
//                                 Featured Products
//                             </h2>
//                             <p className='mb-6 text-gray-600'>Check out our top picks this week!</p>
//                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
//                                 {featuredProducts.map(product => (
//                                     <ProductCard 
//                                         key={product.id} 
//                                         product={product} 
//                                         onSelectProduct={setSelectedProduct} 
//                                         updateCartItem={updateCartItem} // Unchanged event
//                                     />
//                                 ))}
//                             </div>


//                             {/* Static Online Products (Unchanged) */}
//                             <h2 className="text-2xl sm:text-3xl font-bold mb-4 pt-4 border-t border-gray-200">Browse Online Products</h2>
//                             <p className='mb-6 text-gray-600'>Add items using our website interface, or scan physical items with your RFID reader to see them appear on the right!</p>

//                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
//                                 {demoProducts.map(product => ( 
//                                     <ProductCard 
//                                         key={product.id} 
//                                         product={product} 
//                                         onSelectProduct={setSelectedProduct} 
//                                         updateCartItem={updateCartItem} // Unchanged event
//                                     />
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Shopping Cart (Right Side) */}
//                         <div className="lg:col-span-1 order-1 lg:order-2">
//                             <div className="lg:sticky lg:top-24 bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-blue-300 h-fit">
//                                 <div className="flex items-center justify-between mb-4 sm:mb-6 border-b pb-2">
//                                     <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center">
//                                         <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
//                                         Your Cart 
//                                         <span className='ml-2 text-sm text-gray-500 font-normal'>({totalItemsFinal} items)</span>
//                                     </h2>
//                                 </div>

//                                 {/* Cart Items List: ADDITION 4: Attach the ref here */}
//                                 <div 
//                                     ref={cartListRef} // <<< ATTACHED REF
//                                     className="space-y-3 max-h-[70vh] lg:max-h-[50vh] overflow-y-auto mb-4 pr-1"
//                                 >
//                                     {cartItemsFinal.length === 0 ? (
//                                         <p className="text-gray-500 italic text-center py-4 text-sm flex flex-col items-center justify-center">
//                                             <Scan className="w-6 h-6 mb-2 text-gray-400" />
//                                             Scan a product with the RFID reader to add it!
//                                         </p>
//                                     ) : (
//                                         cartItemsFinal.map((item) => (
//                                             <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200 transition duration-150">
                                                
//                                                 {/* Left Side: Product Details (Unchanged) */}
//                                                 <div className="flex items-center space-x-3 flex-grow min-w-0">
//                                                     {item.image.startsWith('http') ? (
//                                                         <img src={item.image} alt={item.name} className="w-10 h-10 object-contain rounded-md flex-shrink-0" />
//                                                     ) : (
//                                                         <span className="text-2xl flex-shrink-0">{item.image}</span>
//                                                     )}
                                                    
//                                                     <div className='flex-grow min-w-0'>
//                                                         <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
//                                                         <p className="text-xs text-gray-500 line-clamp-1">{item.description || (item as any).qtyLabel || item.category}</p>
//                                                         <p className="text-sm text-blue-600 font-bold mt-1">₹ {item.price.toFixed(2)}</p>
//                                                         {(item as any).time && <p className='text-xs text-gray-400 mt-0.5'>Scanned: {(item as any).time}</p>}
//                                                     </div>
//                                                 </div>
                                                
//                                                 {/* Right Side: Quantity Controls (Unchanged events) */}
//                                                 <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
//                                                     <button 
//                                                         onClick={() => updateQuantity(item.id, -1)} // Unchanged event
//                                                         className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition"
//                                                         title={(item.quantity || 0) <= 1 ? 'Remove Item' : 'Decrease Quantity'}
//                                                     >
//                                                         {(item.quantity || 0) <= 1 ? <Trash2 className='w-4 h-4' /> : <Minus className='w-4 h-4' />} 
//                                                     </button>
                                                    
//                                                     <span className="w-6 text-center font-bold text-gray-800">{item.quantity || 0}</span>
                                                    
//                                                     <button 
//                                                         onClick={() => updateQuantity(item.id, 1)} // Unchanged event
//                                                         className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition"
//                                                         title="Increase Quantity"
//                                                     >
//                                                         <Plus className='w-4 h-4'/>
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         ))
//                                     )}
//                                 </div>
                                
//                                 {/* Total and Checkout (Unchanged event) */}
//                                 <div className="pt-4 border-t border-gray-200">
//                                     <div className="flex justify-between items-center text-lg font-semibold mb-4">
//                                         <span>Subtotal:</span>
//                                         <span className="text-blue-600">₹{totalPriceFinal.toFixed(2)}</span>
//                                     </div>

//                                     <button 
//                                         onClick={handleCheckout} // Unchanged event
//                                         disabled={totalItemsFinal === 0}
//                                         className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition duration-200 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
//                                     >
//                                         Proceed to Checkout
//                                     </button>
//                                 </div>


//                             </div>
//                         </div>
//                     </div>
//                 </main>

//             </div>
//         </div>
//     );
// };

// export default SmartRetailStore;



"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
    ShoppingCart, Scan, Zap, Users, Wifi, Globe, Star, 
    Plus, Minus, Trash2, Package, TrendingUp, Clock, Percent, PlusCircle, Settings, X 
} from 'lucide-react';
import { Show, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { Product } from '../types/product';
import { useCartState } from '../hooks/useCartState';
import { useWebSocket } from '../hooks/useWebSocket';
import ProductCard from '../component/ProductCard';
import ProductDetailView from '../component/ProductDetailView';
import HeroCarousel from '../component/HeroCarousel';
import Link from 'next/link';
import { RecommendationSection } from '../component/RecommendationSection';
import toast, { Toaster } from 'react-hot-toast';

// --- Helper to map DB Prisma product to Frontend Product format ---
const mapDbToProduct = (dbProd: any): Product => ({
    id: dbProd.id,
    name: dbProd.name,
    price: Number(dbProd.price),
    category: dbProd.category,
    image: dbProd.images?.[0] || '📦', 
    description: dbProd.description,
    quantity: 0,
});

// --- Local Data & Mock API Logic (FROM YOUR OLD CODE) ---
const fetchApiProducts = async (setApiLoading: (b: boolean) => void, setApiProducts: (p: Product[]) => void) => {
    setApiLoading(true);
    const DUMMY_API_URL = 'https://dummyjson.com/products/search?q=iphone';

    try {
        const response = await fetch(DUMMY_API_URL);
        if (!response.ok) throw new Error(`Failed to fetch from DummyJSON: ${response.statusText}`);

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
            quantity: 0, 
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
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // --- YOUR ADMIN EMAIL CONFIGURATION ---
    // Change this to the exact email you use to sign in via Clerk!
    const MY_ADMIN_EMAIL = "mahakkr111@gmail.com"; 
    
    const isAdmin = 
        user?.publicMetadata?.role === 'admin' || 
        user?.primaryEmailAddress?.emailAddress === 'admin@example.com' ||
        user?.primaryEmailAddress?.emailAddress === MY_ADMIN_EMAIL;

    const cartListRef = useRef<HTMLDivElement>(null);
    const { cartItems, updateCartItem, updateQuantity } = useCartState();
    const [localCartItems, setLocalCartItems] = useState<Product[]>([]);
    const { connectionStatus } = useWebSocket(updateCartItem, setLocalCartItems);

    // --- OLD STATES (API Logic) ---
    const [apiProducts, setApiProducts] = useState<Product[]>([]);
    const [apiLoading, setApiLoading] = useState(true);

    // --- NEW STATES (Real DB Logic) ---
    const [insightsLoading, setInsightsLoading] = useState(true);
    const [recentProducts, setRecentProducts] = useState<Product[]>([]);
    const [bestsellers, setBestsellers] = useState<Product[]>([]);
    const [deadStock, setDeadStock] = useState<Product[]>([]);
    const [standardProducts, setStandardProducts] = useState<Product[]>([]);
    const [deadStockDiscount, setDeadStockDiscount] = useState(30);

    // --- ADD PRODUCT MODAL STATES ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '', price: '', category: '', stockQuantity: '', image: '', description: ''
    });

    // --- FETCH DATA FROM COMMON DB API ---
    const fetchStoreInsights = async () => {
        setInsightsLoading(true);
        try {
            const res = await fetch('/api/store/insights');
            const data = await res.json();
            
            if (data.success) {
                setRecentProducts(data.recent.map(mapDbToProduct));
                setBestsellers(data.bestsellers.map(mapDbToProduct));
                setDeadStock(data.deadStock.map(mapDbToProduct));
                setStandardProducts(data.standard.map(mapDbToProduct));
            }
        } catch (error) {
            console.error("Failed to load insights", error);
            toast.error("Failed to connect to database.");
        } finally {
            setInsightsLoading(false);
        }
    };

    // --- COMBINED USE EFFECTS ---
    useEffect(() => {
        fetchApiProducts(setApiLoading, setApiProducts); // From Old Code
        fetchStoreInsights(); // From New Code
    }, []);

    // --- ADMIN MODAL FUNCTIONS ---
    const handleAddProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdding(true);
        const tid = toast.loading("Adding product to DB...");
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success("Product added successfully!", { id: tid });
                setIsAddModalOpen(false);
                setNewProduct({ name: '', price: '', category: '', stockQuantity: '', image: '', description: '' });
                fetchStoreInsights(); // Refresh list
            } else {
                toast.error(data.error || "Failed to add", { id: tid });
            }
        } catch (error) {
            toast.error("Network Error", { id: tid });
        } finally {
            setIsAdding(false);
        }
    };

    const handleUpdateDiscount = () => {
        const newDiscount = prompt("Enter new discount percentage for dead stock (e.g., 50 for 50%):", deadStockDiscount.toString());
        if (newDiscount && !isNaN(Number(newDiscount))) {
            setDeadStockDiscount(Number(newDiscount));
            toast.success(`Discount updated to ${newDiscount}%!`);
        }
    };

    // --- UI Helpers ---
    const getCrowdColor = () => { if (crowdLevel < 40) return 'text-green-500'; if (crowdLevel < 70) return 'text-yellow-500'; return 'text-red-500'; };
    const getCrowdText = () => { if (crowdLevel < 40) return 'Not Busy'; if (crowdLevel < 70) return 'Moderate'; return 'Crowded'; };

    const cartItemsFinal = cartItems;
    const totalPriceFinal = cartItemsFinal.reduce((sum, item) => sum + (item.price * (item.quantity || 0)), 0);
    const totalItemsFinal = cartItemsFinal.reduce((sum, item) => sum + (item.quantity || 0), 0);

    const handleCheckout = () => {
        if (totalItemsFinal === 0) {
            toast.error("Your cart is empty! Please scan items before proceeding.");
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
        window.location.href = '/PaymentPage';
    };

    const handleHeaderCartClick = () => {
        if (cartListRef.current) {
            cartListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            const cartContainer = cartListRef.current.closest('.lg\\:top-24');
            if (cartContainer) {
                cartContainer.classList.add('flash-highlight');
                setTimeout(() => cartContainer.classList.remove('flash-highlight'), 800);
            }
        }
    };

    if (selectedProduct) {
        return <ProductDetailView product={selectedProduct} onClose={() => setSelectedProduct(null)} updateCartItem={updateCartItem} />;
    }

    return (
        <div className='flex flex-col relative'>
            <Toaster position="top-center"/>
            <div className="min-h-screen bg-gray-50 text-gray-800 overflow-x-hidden">

                {/* --- ADD PRODUCT MODAL (Admin Only) --- */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                            <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <PlusCircle size={24}/> Add New Product
                                </h2>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-white hover:bg-white/20 p-2 rounded-full transition"><X size={20}/></button>
                            </div>
                            <form onSubmit={handleAddProductSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Product Name *</label>
                                        <input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" placeholder="e.g. Apple iPhone 15" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Price (₹) *</label>
                                        <input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none" placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Stock Qty *</label>
                                        <input required type="number" value={newProduct.stockQuantity} onChange={e => setNewProduct({...newProduct, stockQuantity: e.target.value})} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none" placeholder="100" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                        <input value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none" placeholder="Electronics" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Image URL</label>
                                        <input value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none" placeholder="https://..." />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                        <textarea rows={3} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 outline-none resize-none" placeholder="Brief details about the product..." />
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Cancel</button>
                                    <button type="submit" disabled={isAdding} className="flex-1 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition disabled:opacity-50">
                                        {isAdding ? "Saving..." : "Save Product"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* ------------------------------------------- */}

                <header className="sticky top-0 z-20 border-b border-blue-200 backdrop-blur-md bg-white/90 shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="relative">
                                <Wifi className={`w-6 h-6 sm:w-8 sm:h-8 ${connectionStatus === 'connected' ? 'text-green-600 animate-pulse' : 'text-gray-400'}`} />
                                {connectionStatus === 'connected' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>}
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent truncate">
                                    SmartCart IoT
                                </h1>
                                <p className="text-xs text-gray-500 hidden md:block">
                                    Status: <span className='font-semibold'>{connectionStatus.toUpperCase()}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <Show when="signed-out">
                                <SignInButton />
                                <SignUpButton>
                                    <button className="bg-[#6c47ff] hover:bg-[#5a39df] text-white rounded-full font-medium text-sm sm:text-base h-9 sm:h-10 px-4 sm:px-5 cursor-pointer shadow-md transition-colors">
                                        Sign Up
                                    </button>
                                </SignUpButton>
                            </Show>
                            <Show when="signed-in">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    {user && (
                                        <span className="font-medium text-gray-700 hidden lg:block">
                                            Hi, {user.fullName || user.username || user.primaryEmailAddress?.emailAddress}
                                        </span>
                                    )}
                                    <Link href="/order" className="flex items-center space-x-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all border border-blue-200 shadow-sm">
                                        <Package className="w-5 h-5 sm:w-5 sm:h-5" />
                                        <span className="hidden sm:inline font-semibold text-sm">My Orders</span>
                                    </Link>
                                    <UserButton />
                                </div>
                            </Show>
                            <button onClick={handleHeaderCartClick} className="relative bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all transform hover:scale-105 shadow-xl shadow-blue-500/40">
                                <div className="flex items-center space-x-1.5 sm:space-x-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    <span className="hidden sm:inline font-semibold text-sm">Total Items</span>
                                    {totalItemsFinal > 0 && (
                                        <span className="bg-white text-blue-600 px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold animate-bounce">
                                            {totalItemsFinal}
                                        </span>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    
                    {/* --- ADMIN DASHBOARD BAR --- */}
                    {isAdmin && (
                        <div className="mb-8 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center text-indigo-800">
                                <Settings className="w-6 h-6 mr-3 animate-spin-slow" />
                                <div>
                                    <h3 className="font-bold">Admin Privileges Active</h3>
                                    <p className="text-sm text-indigo-600">You are connected to live database operations.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-full transition-colors w-full sm:w-auto justify-center shadow-md"
                            >
                                <PlusCircle className="w-5 h-5 mr-2" />
                                Add New Product
                            </button>
                        </div>
                    )}

                    <HeroCarousel />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                        <div className="lg:col-span-2 order-2 lg:order-1">

                            {/* Store Metrics */}
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

                            {/* --- REAL DB: RECENTLY BOUGHT --- */}
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center pt-4 border-t border-gray-200">
                                {/* <Clock className='w-6 h-6 sm:w-8 sm:h-8 mr-3 text-blue-500 fill-blue-500' />🔥 */}
                                🔥
                                Recently Bought by Others
                            </h2>
                            <p className='mb-6 text-gray-600'>Live feed of what people are buying right now.</p>
                            {insightsLoading ? (
                                <div className="text-center py-8 text-gray-500 animate-pulse">Loading live store activity...</div>
                            ) : recentProducts.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-12">
                                    {recentProducts.map(product => (
                                        <ProductCard key={`rec-${product.id}`} product={product} onSelectProduct={setSelectedProduct} updateCartItem={updateCartItem} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic mb-12">Be the first to buy something today!</p>
                            )}

                            {/* --- REAL DB: BESTSELLERS --- */}
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center pt-4 border-t border-gray-200">
                                <TrendingUp className='w-6 h-6 sm:w-8 sm:h-8 mr-3 text-rose-500' />
                                Store Bestsellers
                            </h2>
                            <p className='mb-6 text-gray-600'>Loved by multiple shoppers. Grab them before they run out!</p>
                            {insightsLoading ? (
                                <div className="text-center py-8 text-gray-500 animate-pulse">Loading bestsellers...</div>
                            ) : bestsellers.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-12">
                                    {bestsellers.map(product => (
                                        <ProductCard key={`best-${product.id}`} product={product} onSelectProduct={setSelectedProduct} updateCartItem={updateCartItem} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic mb-12">No bestsellers yet. Keep shopping!</p>
                            )}

                            {/* --- REAL DB: CLEARANCE --- */}
                            {deadStock.length > 0 && (
                                <>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pt-4 border-t border-gray-200">
                                        <h2 className="text-2xl sm:text-3xl font-bold flex items-center">
                                            <Percent className='w-6 h-6 sm:w-8 sm:h-8 mr-3 text-green-500 bg-green-100 rounded-full p-1' />
                                            Clearance Deals
                                        </h2>
                                        {isAdmin && (
                                            <button onClick={handleUpdateDiscount} className="mt-3 sm:mt-0 text-sm font-bold bg-gray-200 hover:bg-gray-300 text-gray-800 py-1.5 px-4 rounded-full transition-colors flex items-center w-fit">
                                                <Settings className="w-4 h-4 mr-2" /> Modify Discount ({deadStockDiscount}%)
                                            </button>
                                        )}
                                    </div>
                                    <p className='mb-6 text-gray-600'>Heavy discounts on items you didn't know you needed!</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-12">
                                        {deadStock.map(product => {
                                            const discountedPrice = product.price - (product.price * (deadStockDiscount / 100));
                                            const discountedProduct = { 
                                                ...product, 
                                                price: discountedPrice, 
                                                description: `Was ₹${product.price.toFixed(2)}. Now ${deadStockDiscount}% OFF!` 
                                            };
                                            return (
                                                <div key={`dead-${product.id}`} className="relative">
                                                    <div className="absolute -top-3 -right-3 z-10 bg-red-500 text-white font-black text-xs px-2 py-1 rounded-full shadow-lg transform rotate-12">
                                                        -{deadStockDiscount}%
                                                    </div>
                                                    <ProductCard product={discountedProduct} onSelectProduct={setSelectedProduct} updateCartItem={updateCartItem} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            <RecommendationSection cartItems={cartItemsFinal} updateCartItem={updateCartItem} onSelectProduct={setSelectedProduct} />

                            {/* --- OLD CODE: TODAY'S DEALS (DummyJSON API) --- */}
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
                                        <ProductCard key={product.id} product={product} onSelectProduct={setSelectedProduct} updateCartItem={updateCartItem} />
                                    ))}
                                </div>
                            )}

                            {/* --- OLD CODE: FEATURED PRODUCTS --- */}
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center pt-4 border-t border-gray-200">
                                <Star className='w-6 h-6 sm:w-8 sm:h-8 mr-3 text-amber-500 fill-amber-500' />
                                Featured Products
                            </h2>
                            <p className='mb-6 text-gray-600'>Check out our top picks this week!</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
                                {featuredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} onSelectProduct={setSelectedProduct} updateCartItem={updateCartItem} />
                                ))}
                            </div>

                            {/* --- COMBINED: STANDARD DB & DEMO PRODUCTS --- */}
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4 pt-4 border-t border-gray-200">Browse Online Products</h2>
                            <p className='mb-6 text-gray-600'>Add items using our website interface, or scan physical items with your RFID reader to see them appear on the right!</p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                                {/* First output the new Real DB standard products */}
                                {insightsLoading ? null : standardProducts.map(product => (
                                    <ProductCard key={`std-${product.id}`} product={product} onSelectProduct={setSelectedProduct} updateCartItem={updateCartItem} />
                                ))}

                                {/* Then output the old local demo products so nothing is lost */}
                                {demoProducts.map(product => (
                                    <ProductCard key={product.id} product={product} onSelectProduct={setSelectedProduct} updateCartItem={updateCartItem} />
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

                                <div ref={cartListRef} className="space-y-3 max-h-[70vh] lg:max-h-[50vh] overflow-y-auto mb-4 pr-1">
                                    {cartItemsFinal.length === 0 ? (
                                        <p className="text-gray-500 italic text-center py-4 text-sm flex flex-col items-center justify-center">
                                            <Scan className="w-6 h-6 mb-2 text-gray-400" />
                                            Scan a product with the RFID reader to add it!
                                        </p>
                                    ) : (
                                        cartItemsFinal.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200 transition duration-150">
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
                                                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition" title={(item.quantity || 0) <= 1 ? 'Remove Item' : 'Decrease Quantity'}>
                                                        {(item.quantity || 0) <= 1 ? <Trash2 className='w-4 h-4' /> : <Minus className='w-4 h-4' />}
                                                    </button>
                                                    <span className="w-6 text-center font-bold text-gray-800">{item.quantity || 0}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition" title="Increase Quantity">
                                                        <Plus className='w-4 h-4' />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center text-lg font-semibold mb-4">
                                        <span>Subtotal:</span>
                                        <span className="text-blue-600">₹{totalPriceFinal.toFixed(2)}</span>
                                    </div>
                                    <button onClick={handleCheckout} disabled={totalItemsFinal === 0} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition duration-200 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg">
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