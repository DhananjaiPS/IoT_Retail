"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Bell, Package, Receipt, Loader2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AdminHeader() {
  const { isLoaded, user } = useUser();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/admin/search?q=${query}`);
          const data = await res.json();
          setResults(data.results);
          setShowDropdown(true);
        } catch (error) {
          console.error(error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300); // 300ms delay to save API hits

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm z-50">
      
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="-ml-2 text-slate-500 hover:bg-slate-100" />

        {/* Paytm Style Search Bar */}
        <div className="hidden md:block relative max-w-md w-full" ref={dropdownRef}>
          <div className="relative flex items-center">
            {isSearching ? (
              <Loader2 className="absolute left-3 w-4 h-4 text-[#00baf2] animate-spin" />
            ) : (
              <Search className="absolute left-3 w-4 h-4 text-slate-400" />
            )}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setShowDropdown(true)}
              placeholder="Search products, orders or user ID"
              className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:bg-white focus:border-[#00baf2] focus:ring-4 focus:ring-[#00baf2]/10 transition-all text-slate-700"
            />
          </div>

          {/* Search Results Recommendation Dropdown */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-12 left-0 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
              >
                <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Quick Recommendations
                </div>
                
                {results.length > 0 ? (
                  results.map((item: any) => (
                    <button
                      key={item.id}
                      className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-[#00baf2]/10 group-hover:text-[#00baf2]">
                        {item.type === 'Product' ? <Package className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-semibold text-slate-800">{item.label}</div>
                        <div className="text-[11px] text-slate-500">{item.category || item.sub}</div>
                      </div>
                      <div className="text-[10px] font-bold text-slate-300 group-hover:text-[#00baf2] uppercase">
                        {item.type}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-slate-400">
                    No records found for "{query}"
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button className="relative text-slate-500 hover:text-[#00baf2] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-800 tracking-tight">
              Hello, {isLoaded && user?.firstName ? user.firstName : "Admin"}
            </span>
            <span className="text-[11px] text-slate-500 font-medium font-mono">
              ID: {user?.id ? user.id.slice(0, 12) : "..."}
            </span>
          </div>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "h-9 w-9" } }} />
        </div>
      </div>
    </header>
  );
}