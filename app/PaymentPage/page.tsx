"use client";

import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
    CreditCard, QrCode, ArrowLeft, ShoppingBag, 
    ShieldCheck, Loader2, MapPin, ChevronRight,
    Tag, X, Building2, Smartphone
} from 'lucide-react';
import Link from 'next/link';

// ✅ Fix 1: Added proper typing for GST index access
interface Product {
    id: string; 
    name: string;
    price: number; 
    quantity?: number;
}

const GST_RATES: Record<string, number> = { 'default': 0.18 };

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount);
};

export default function PaymentPage() {
    const [cartItems, setCartItems] = useState<Product[]>([]);
    const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Coupon States
    const [couponInput, setCouponInput] = useState<string>('');
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null); 
    const [discountRate, setDiscountRate] = useState<number>(0);

    // Address States
    const [addressDetails, setAddressDetails] = useState({
        fullName: 'dhananjai', phone: '9932980664', addressLine: '123 xyz colony', pinCode: '244001', city: 'moradabad', state: 'Up'
    });

    useEffect(() => {
        const storedCart = sessionStorage.getItem('currentCartItems');
        if (storedCart) {
            try { 
                setCartItems(JSON.parse(storedCart)); 
            } catch (e) { 
                console.error("Error parsing cart items:", e); 
            }
        }
    }, []);

    const handleApplyCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        const code = couponInput.trim().toUpperCase();
        if (code === 'PAYTM10') {
            setAppliedCoupon(code); setDiscountRate(0.10); setCouponInput('');
        } else {
            toast.error('Invalid Code. Try PAYTM10'); // Better than alert
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null); setDiscountRate(0);
    };

    // ✅ Fix 2: Explicitly typed event for address change
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddressDetails({ ...addressDetails, [e.target.name]: e.target.value });
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 0)), 0);
    const totalDiscount = subtotal * discountRate;
    
    // ✅ Fix 3: Safer GST calculation to avoid index errors
    const totalTax = cartItems.reduce((taxSum, item) => {
        const rate = (GST_RATES as any)[item.name] || GST_RATES.default;
        return taxSum + ((item.price * (item.quantity || 0)) * rate);
    }, 0);
    
    const grandTotal = subtotal - totalDiscount + totalTax;

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        
        const finalInvoiceData = {
            items: cartItems, 
            subtotal, 
            totalDiscount, 
            totalTax, 
            grandTotal, 
            paymentMode: selectedMethod.toUpperCase(), 
            appliedCoupon, 
            shippingAddress: addressDetails
        };

        try {
            const response = await fetch('/api/orders/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalInvoiceData)
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Payment successful! Redirecting...");
                sessionStorage.setItem('finalInvoiceData', JSON.stringify(finalInvoiceData));
                sessionStorage.setItem('invoiceSaved_db', 'true'); 
                
                setTimeout(() => {
                    window.location.href = '/BillingInvoice'; 
                }, 1500);
            } else {
                toast.error(result.error || "Payment failed.");
                setIsProcessing(false);
            }
        } catch (error) {
            toast.error("Network error while processing payment.");
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f7fa] p-4">
                <ShoppingBag className="w-16 h-16 text-sky-200 mb-6" />
                <h2 className="text-2xl font-bold mb-8 text-blue-950">Your cart is empty</h2>
                <Link href="/" className="px-8 py-3 bg-sky-500 text-white font-bold rounded-lg hover:bg-sky-600 transition-all shadow-md">
                    Return to Shop
                </Link>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-[#f5f7fa] font-sans text-blue-950 pb-12">
            <Toaster position="top-center" />
            
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center text-blue-950 hover:text-sky-500 font-semibold transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                    </Link>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        <span className="font-bold text-sm tracking-wide text-gray-700 uppercase">100% Secure Payments</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    <div className="w-full lg:w-2/3 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-blue-500 px-6 py-4 flex items-center">
                                <span className="bg-white text-blue-500 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
                                <h2 className="text-lg font-bold text-white tracking-wide">Delivery Address</h2>
                            </div>
                            
                            <div className="p-6 space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                                        <input required type="text" name="fullName" value={addressDetails.fullName} onChange={handleAddressChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all font-medium text-blue-950" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Mobile Number</label>
                                        <input required type="tel" name="phone" value={addressDetails.phone} onChange={handleAddressChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all font-medium text-blue-950" />
                                    </div>
                                </div>
                                <input required type="text" name="addressLine" value={addressDetails.addressLine} onChange={handleAddressChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none transition-all font-medium text-blue-950" placeholder="Address" />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-blue-500 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="bg-white text-blue-500 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
                                    <h2 className="text-lg font-bold text-white tracking-wide">Payment Mode</h2>
                                </div>
                                <span className="text-white font-bold text-lg">{formatCurrency(grandTotal)}</span>
                            </div>
                            
                            <div className="flex flex-col md:flex-row min-h-[350px]">
                                <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col">
                                    {['upi', 'card', 'netbanking'].map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setSelectedMethod(m as any)}
                                            className={`flex items-center p-5 border-l-4 transition-all ${selectedMethod === m ? 'border-sky-500 bg-white font-bold' : 'border-transparent'}`}
                                        >
                                            <span className="text-sm uppercase tracking-wider">{m}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="w-full md:w-2/3 p-6 bg-white flex flex-col justify-center items-center">
                                    {selectedMethod === 'upi' && (
                                        <div className="text-center">
                                            <img src="/QR.png" alt="Scan to pay" className="w-48 h-48 mb-4 mx-auto border p-2 rounded-xl" />
                                            <p className="text-sm font-bold">Scan with any UPI App</p>
                                        </div>
                                    )}
                                    {selectedMethod !== 'upi' && <p className="text-slate-400 font-bold">Please use UPI for this demo.</p>}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handlePaymentSubmit}
                            disabled={isProcessing}
                            className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all shadow-lg flex items-center justify-center ${isProcessing ? 'bg-sky-300' : 'bg-sky-500 hover:bg-sky-600'}`}
                        >
                            {isProcessing ? <Loader2 className="animate-spin mr-2" /> : `Pay ${formatCurrency(grandTotal)}`}
                        </button>
                    </div>

                    <div className="w-full lg:w-1/3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-24 p-5">
                            <h2 className="font-bold mb-6 flex items-center gap-2 border-b pb-4">
                                <ShoppingBag className="text-sky-500" /> Order Summary
                            </h2>
                            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-600">{item.name} x {item.quantity}</span>
                                        <span className="font-bold">{formatCurrency(item.price * (item.quantity || 0))}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="space-y-3 pt-4 border-t border-dashed">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-emerald-600 font-bold">
                                    <span>Taxes & GST</span>
                                    <span>{formatCurrency(totalTax)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-black border-t pt-4">
                                    <span>Total</span>
                                    <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}