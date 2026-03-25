"use client";
import React, { useEffect, useState } from "react";

/**
 * SmartStore - Full Section Scroll UI
 * White + Blue futuristic theme
 *
 * Requirements:
 * - TailwindCSS enabled in the project
 * - Uses Mock data + Optional real fetch from RapidAPI for Electronics
 */

// ---------- Types ----------
type Product = {
  id: string;
  title: string;
  price: string;
  image: string;
  rating?: string | null;
  url?: string;
  category: string;
};

// ---------- Configuration ----------
const USE_REAL_API = true; 
const RAPIDAPI_KEY = '84006c21c2msh9045f6f5a4baac8p1682adjsnb130edeb53e6'; 
// FIX: Removed the trailing single quote that caused the hostname error.
const RAPIDAPI_HOST = "real-time-amazon-data.p.rapidapi.com"; 
const ELECTRONICS_QUERY = "Phone"; 

// ---------- Mock data for non-electronics categories ----------
const MOCK_PRODUCTS = {
  Grocery: [
    { id: "g1", title: "Organic Rice 5kg", price: "₹399", image: "https://images.unsplash.com/photo-1543353071-087092ec3930?w=800&q=60", rating: "4.5", category: "Grocery" },
    { id: "g2", title: "Olive Oil 1L", price: "₹599", image: "https://images.unsplash.com/photo-1516685018646-5496b4b29d90?w=800&q=60", rating: "4.2", category: "Grocery" },
  ],
  Vegetables: [
    { id: "v1", title: "Fresh Spinach (250g)", price: "₹29", image: "https://images.unsplash.com/photo-1604908177522-6f2f1e6c6b1f?w=800&q=60", rating: "4.8", category: "Vegetables" },
    { id: "v2", title: "Tomatoes (1kg)", price: "₹39", image: "https://images.unsplash.com/photo-1582515073490-3998131f8c36?w=800&q=60", rating: "4.6", category: "Vegetables" },
  ],
  Fruits: [
    { id: "f1", title: "Bananas (1 dozen)", price: "₹49", image: "https://images.unsplash.com/photo-1574226516831-e1dff420e8f8?w=800&q=60", rating: "4.7", category: "Fruits" },
    { id: "f2", title: "Apples (1kg)", price: "₹199", image: "https://images.unsplash.com/photo-1571047399553-3c6a2b35bb7a?w=800&q=60", rating: "4.5", category: "Fruits" },
  ],
  Chocolates: [
    { id: "c1", title: "Dark Chocolate 200g", price: "₹149", image: "https://images.unsplash.com/photo-1549044622-5c23b75fef49?w=800&q=60", rating: "4.9", category: "Chocolates" },
    { id: "c2", title: "Milk Chocolate Bar", price: "₹89", image: "https://images.unsplash.com/photo-1543932920-9fbe8ff78f3d?w=800&q=60", rating: "4.4", category: "Chocolates" },
  ],
  "Women Fashion": [
    { id: "w1", title: "Women's Summer Dress", price: "₹799", image: "https://images.unsplash.com/photo-1520975913949-39f8a2c0b01b?w=800&q=60", rating: "4.3", category: "Women Fashion" },
    { id: "w2", title: "Classic Tote Bag", price: "₹1299", image: "https://images.unsplash.com/photo-1503342452485-86f7b5b7e3f3?w=800&q=60", rating: "4.6", category: "Women Fashion" },
  ],
  Glasses: [
    { id: "gl1", title: "Blue Light Glasses", price: "₹499", image: "https://images.unsplash.com/photo-1542293787938-c9e299b8805f?w=800&q=60", rating: "4.7", category: "Glasses" },
    { id: "gl2", title: "Aviator Sunglasses", price: "₹1299", image: "https://images.unsplash.com/photo-1520975913949-39f8a2c0b01b?w=800&q=60", rating: "4.4", category: "Glasses" },
  ],
};

// ---------- Helper: fetch electronics from RapidAPI ----------
async function fetchElectronics(): Promise<Product[]> {
  if (!USE_REAL_API) {
    // return mocked phones if real fetch disabled
    return [
      { id: "p-mock1", title: "Mock Phone A", price: "₹12,999", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=60", rating: "4.6", category: "Electronics" },
      { id: "p-mock2", title: "Mock Phone B", price: "₹9,999", image: "https://images.unsplash.com/photo-1510557880182-3d4d3b25f6f1?w=800&q=60", rating: "4.2", category: "Electronics" },
    ];
  }

  const url = `https://${RAPIDAPI_HOST}/search?query=${encodeURIComponent(ELECTRONICS_QUERY)}&page=1&country=US&sort_by=RELEVANCE&product_condition=ALL&is_prime=false&deals_and_discounts=NONE`;
  const options: RequestInit = {
    method: "GET",
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
  };

  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Failed to fetch electronics, Status: ${res.status}`);
  
  const json = await res.json();
  
  const products: Product[] = (json?.data?.products || []).slice(0, 12).map((p: any) => ({
    id: p.asin ?? p.id ?? `${p.product_title}_${Math.random().toString(36).slice(2, 8)}`,
    title: p.product_title ?? p.title ?? "Unknown product",
    price: p.product_price ?? p.price ?? "—",
    image: p.product_photo ?? p.image ?? "https://via.placeholder.com/400x300?text=No+Image",
    rating: p.product_star_rating ?? null,
    url: p.product_url ?? p.url,
    category: "Electronics",
  }));
  return products;
}

// ---------- Small icon components (inline SVG) ----------
const PlusIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
  </svg>
);

const CartIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
    <circle cx="10" cy="20" r="1" />
    <circle cx="18" cy="20" r="1" />
  </svg>
);

// ---------- Main Component ----------
const SmartStore: React.FC = () => {
  const [electronics, setElectronics] = useState<Product[]>([]);
  const [loadingElectronics, setLoadingElectronics] = useState(false);
  const [cart, setCart] = useState<Record<string, { product: Product; qty: number }>>({});
  const [toast, setToast] = useState<string | null>(null);

  // categories in fixed order for stacked sections
  const categories = ["Grocery", "Vegetables", "Fruits", "Chocolates", "Women Fashion", "Glasses", "Electronics"];

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoadingElectronics(true);
        const res = await fetchElectronics();
        if (!mounted) return;
        setElectronics(res);
      } catch (err) {
        console.error("Electronics fetch failed:", err);
        // fallback to mock if fetch error
        setElectronics([
          { id: "p-fb1", title: "Fallback Phone X (Error/CORS)", price: "₹11,999", image: "https://via.placeholder.com/400x300?text=Phone", rating: "4.2", category: "Electronics" },
        ]);
      } finally {
        setLoadingElectronics(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Add to cart
  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev[p.id];
      const next = { ...prev };
      next[p.id] = { product: p, qty: existing ? existing.qty + 1 : 1 };
      return next;
    });
    setToast(`${p.title} added to cart`);
    setTimeout(() => setToast(null), 1800);
  };

  // Remove from cart
  const removeFromCart = (id: string) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // compute total
  const total = Object.values(cart).reduce((acc, cur) => {
    // price string like "₹1,299" — remove non-digits for approximate sum
    const num = parseFloat(String(cur.product.price).replace(/[^\d.]/g, "")) || 0;
    return acc + num * cur.qty;
  }, 0);

  // Render product card (reusable)
  const ProductCard: React.FC<{ p: Product }> = ({ p }) => (
    <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
      <div className="aspect-[4/3] bg-blue-50 rounded-lg flex items-center justify-center overflow-hidden">
        <img src={p.image} alt={p.title} className="object-contain w-full h-full" loading="lazy" />
      </div>
      <div className="mt-3">
        <h4 className="text-sm md:text-base font-semibold text-slate-800 line-clamp-2">{p.title}</h4>
        {p.rating && <div className="text-sm text-yellow-500 mt-1">⭐ {p.rating}</div>}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-blue-700 font-bold">{p.price}</div>
          <div className="flex items-center gap-2">
            <a
              href={p.url ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="text-white bg-blue-600 px-3 py-1 rounded-full text-xs md:text-sm hover:bg-blue-700 transition"
            >
              Buy
            </a>
            <button
              onClick={() => addToCart(p)}
              aria-label="Add to cart"
              className="bg-white border border-blue-200 text-blue-600 p-2 rounded-full hover:bg-blue-50 transition"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // helper to get products per category
  const getProductsFor = (cat: string): Product[] => {
    if (cat === "Electronics") return electronics.length ? electronics : [];
    // @ts-ignore
    return MOCK_PRODUCTS[cat].map((m: any) => ({ ...m, category: cat }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700">FutureStore</h1>
            <p className="text-sm text-slate-600 mt-1">Smart curated store — white & blue theme</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600 hidden md:block">Free delivery on orders ₹999+</div>
            <button
              className="relative bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700 flex items-center gap-2"
              onClick={() => {
                const el = document.getElementById("cart-drawer");
                // Toggles the 'translate-x-0' class to show/hide the drawer
                if (el) el.classList.toggle("translate-x-full"); 
              }}
            >
              <CartIcon className="w-5 h-5" /> <span className="font-medium">Cart</span>
              <span className="ml-2 inline-block bg-white text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                {Object.keys(cart).length}
              </span>
            </button>
          </div>
        </header>

        {/* Stacked Sections */}
        <main className="space-y-12">
          {categories.map(cat => {
            const products = getProductsFor(cat);
            return (
              <section key={cat} id={`section-${cat}`} className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-slate-800">{cat}</h2>
                  <div className="text-sm text-slate-500">{products.length} items</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {cat === "Electronics" && loadingElectronics ? (
                    // Skeleton loader while fetching
                    Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-[280px] bg-white animate-pulse rounded-2xl" />
                    ))
                  ) : products.length ? (
                    // Display products
                    products.map(p => <ProductCard key={p.id} p={p} />)
                  ) : (
                    // No products fallback
                    <div className="text-slate-500 col-span-full py-12 text-center">No products available</div>
                  )}
                </div>
              </section>
            );
          })}
        </main>
      </div>

      {/* Cart Drawer (right side) */}
      <aside
        id="cart-drawer"
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl border-l transform translate-x-full transition-transform duration-300 z-50"
        aria-hidden="true"
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-blue-700">Your Cart</h3>
            <button
              onClick={() => {
                const el = document.getElementById("cart-drawer");
                // Hides the drawer by translating it full right
                if (el) el.classList.add("translate-x-full"); 
              }}
              className="text-slate-500"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-auto space-y-4 pb-4">
            {Object.keys(cart).length === 0 ? (
              <div className="text-slate-500">Your cart is empty</div>
            ) : (
              Object.values(cart).map(item => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <img src={item.product.image} className="w-16 h-12 object-contain rounded" alt={item.product.title} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.product.title}</div>
                    <div className="text-sm text-slate-500">{item.product.price} • x{item.qty}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => setCart(prev => ({ ...prev, [item.product.id]: { product: item.product, qty: item.qty + 1 } }))} className="text-blue-600">+</button>
                    <button onClick={() => {
                      if (item.qty <= 1) removeFromCart(item.product.id);
                      else setCart(prev => ({ ...prev, [item.product.id]: { product: item.product, qty: item.qty - 1 } }));
                    }} className="text-blue-600">-</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-slate-600">Estimated total</div>
              <div className="text-lg font-semibold text-blue-700">₹{total.toFixed(2)}</div>
            </div>
            <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700">Checkout</button>
          </div>
        </div>
      </aside>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-8 bg-blue-600 text-white px-4 py-2 rounded-full shadow">
          {toast}
        </div>
      )}
    </div>
  );
};

export default SmartStore;