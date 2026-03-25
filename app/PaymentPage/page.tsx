"use client";

import React, { useState, useEffect } from 'react';
import { 
    CreditCard, QrCode, ArrowLeft, ShoppingBag, 
    ShieldCheck, Loader2, MapPin, ChevronRight,
    Tag, X, Building2, Smartphone
} from 'lucide-react';
import Link from 'next/link';

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
        fullName: '', phone: '', addressLine: '', pinCode: '', city: '', state: ''
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedCart = sessionStorage.getItem('currentCartItems');
            if (storedCart) {
                try { setCartItems(JSON.parse(storedCart)); } 
                catch (e) { console.error("Error parsing cart items:", e); }
            }
        }
    }, []);

    const handleApplyCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        const code = couponInput.trim().toUpperCase();
        if (code === 'PAYTM10') {
            setAppliedCoupon(code); setDiscountRate(0.10); setCouponInput('');
        } else {
            alert('Invalid Code. Try PAYTM10');
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null); setDiscountRate(0);
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddressDetails({ ...addressDetails, [e.target.name]: e.target.value });
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 0)), 0);
    const totalDiscount = subtotal * discountRate;
    const totalTax = cartItems.reduce((taxSum, item) => taxSum + ((item.price * (item.quantity || 0)) * (GST_RATES[item.name] || GST_RATES.default)), 0);
    const grandTotal = subtotal - totalDiscount + totalTax;

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setTimeout(() => {
            const finalInvoiceData = {
                items: cartItems, subtotal, totalDiscount, totalTax, grandTotal, 
                paymentMode: selectedMethod.toUpperCase(), appliedCoupon, shippingAddress: addressDetails
            };
            sessionStorage.setItem('finalInvoiceData', JSON.stringify(finalInvoiceData));
            window.location.href = '/BillingInvoice'; 
        }, 1500);
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
            
            {/* Paytm-Style Top Navbar */}
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
                <form onSubmit={handlePaymentSubmit} className="flex flex-col lg:flex-row gap-8">
                    
                    {/* LEFT COLUMN: Main Forms */}
                    <div className="w-full lg:w-2/3 space-y-6">
                        
                        {/* 1. Address Block */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-blue-500 px-6 py-4 flex items-center">
                                <span className="bg-white text-blue-500 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
                                <h2 className="text-lg font-bold text-white tracking-wide">Delivery Address</h2>
                            </div>
                            
                            <div className="p-6 space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                                        <input required type="text" name="fullName" value={addressDetails.fullName} onChange={handleAddressChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all font-medium text-blue-950" placeholder="Enter your full name" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Mobile Number</label>
                                        <input required type="tel" name="phone" value={addressDetails.phone} onChange={handleAddressChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all font-medium text-blue-950" placeholder="+91 xxxxx xxxxx" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Complete Address</label>
                                    <input required type="text" name="addressLine" value={addressDetails.addressLine} onChange={handleAddressChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all font-medium text-blue-950" placeholder="House/Flat No., Street Name, Landmark" />
                                </div>

                                <div className="grid grid-cols-3 gap-5">
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">PIN Code</label>
                                        <input required type="text" name="pinCode" value={addressDetails.pinCode} onChange={handleAddressChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all font-medium text-blue-950" placeholder="000000" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">City</label>
                                        <input required type="text" name="city" value={addressDetails.city} onChange={handleAddressChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all font-medium text-blue-950" placeholder="City" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">State</label>
                                        <input required type="text" name="state" value={addressDetails.state} onChange={handleAddressChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all font-medium text-blue-950" placeholder="State" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Payment Block (Classic Vertical Tabs) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-blue-500 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="bg-white text-blue-500 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
                                    <h2 className="text-lg font-bold text-white tracking-wide">Select Payment Mode</h2>
                                </div>
                                <span className="text-white font-bold text-lg">{formatCurrency(grandTotal)}</span>
                            </div>
                            
                            <div className="flex flex-col md:flex-row min-h-[350px]">
                                {/* Left Tabs */}
                                <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col">
                                    {[
                                        { id: 'upi', icon: QrCode, label: 'UPI & QR', active: true },
                                        { id: 'card', icon: CreditCard, label: 'Debit & Credit Cards' },
                                        { id: 'netbanking', icon: Building2, label: 'Netbanking' }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setSelectedMethod(tab.id as any)}
                                            className={`flex items-center p-5 border-l-4 transition-all ${
                                                selectedMethod === tab.id 
                                                ? 'border-sky-500 bg-white font-bold text-blue-950 shadow-[2px_0_5px_rgba(0,0,0,0.02)] z-10' 
                                                : 'border-transparent text-gray-600 hover:bg-gray-100 font-medium'
                                            }`}
                                        >
                                            <tab.icon className={`w-5 h-5 mr-3 ${selectedMethod === tab.id ? 'text-sky-500' : 'text-gray-400'}`} />
                                            <span className="text-sm">{tab.label}</span>
                                            {selectedMethod === tab.id && <ChevronRight className="w-4 h-4 ml-auto text-sky-500" />}
                                        </button>
                                    ))}
                                </div>

                                {/* Right Content Area */}
                                <div className="w-full md:w-2/3 p-6 bg-white flex flex-col justify-center">
                                    
                                    {selectedMethod === 'upi' && (
                                        <div className="flex flex-col items-center text-center max-w-sm mx-auto w-full">
                                            <div className="bg-sky-50 text-sky-700 text-xs font-bold px-3 py-1 rounded-full mb-6 flex items-center">
                                                <Smartphone className="w-3 h-3 mr-1" /> Fastest way to pay
                                            </div>
                                            <div className="w-48 h-48 bg-white border-2 border-sky-100 rounded-xl p-3 shadow-md mb-6 relative">
                                                {/* Corner markers for QR feel */}
                                                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-sky-500"></div>
                                                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-sky-500"></div>
                                                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-sky-500"></div>
                                                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-sky-500"></div>
                                                <img src="/QR.png" alt="Scan to pay" className="w-full h-full object-contain" />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-700">Scan QR using any UPI app</p>
                                            <div className="flex gap-2 mt-4 justify-center items-center">
                                                <img src="/paytm_logo.png" className="h-6 object-contain opacity-90" alt="Paytm" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                <img src="/gpay_logo.png" className="h-7 object-contain opacity-90" alt="GPay" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                <img src="/phonepay_logo.png" className="h-10 object-contain opacity-90" alt="PhonePe" onError={(e) => e.currentTarget.style.display = 'none'} />
                                            </div>
                                        </div>
                                    )}

                                    {selectedMethod === 'card' && (
                                        <div className="max-w-sm mx-auto w-full space-y-5">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Card Number</label>
                                                <div className="relative">
                                                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                    <input required type="text" placeholder="xxxx xxxx xxxx xxxx" className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none text-sm transition-all font-medium text-blue-950" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Name on Card</label>
                                                <input required type="text" placeholder="Enter name" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none text-sm transition-all font-medium text-blue-950" />
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="w-1/2">
                                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Expiry</label>
                                                    <input required type="text" placeholder="MM/YY" className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none text-sm transition-all font-medium text-blue-950 text-center" />
                                                </div>
                                                <div className="w-1/2">
                                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">CVV</label>
                                                    <input required type="password" placeholder="***" maxLength={4} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none text-sm transition-all font-medium text-blue-950 text-center" />
                                                </div>
                                            </div>
                                            <div className="flex items-center text-[10px] text-gray-500 mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                                                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" /> Card details are protected by 256-bit encryption and PCI DSS compliance.
                                            </div>
                                        </div>
                                    )}

                                    {selectedMethod === 'netbanking' && (
                                        <div className="max-w-sm mx-auto w-full">
                                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Select your Bank</label>
                                            <select required className="w-full px-4 py-4 bg-white border border-gray-300 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none text-sm transition-all font-medium text-blue-950 cursor-pointer appearance-none">
                                                <option value="">Select from popular banks...</option>
                                                <option value="sbi">State Bank of India</option>
                                                <option value="hdfc">HDFC Bank</option>
                                                <option value="icici">ICICI Bank</option>
                                                <option value="axis">Axis Bank</option>
                                                <option value="pnb">Punjab National Bank</option>
                                            </select>
                                            <p className="text-xs text-gray-500 mt-4 text-center">You will be securely redirected to the bank's login page.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="sticky bottom-4 z-40 bg-[#f5f7fa] pt-2 pb-4">
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all shadow-lg flex items-center justify-center
                                    ${isProcessing 
                                        ? 'bg-sky-300 cursor-not-allowed' 
                                        : 'bg-sky-500 hover:bg-sky-600 hover:-translate-y-0.5 shadow-sky-500/30'
                                    }`}
                            >
                                {isProcessing ? (
                                    <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Processing Payment...</>
                                ) : (
                                    `Pay ${formatCurrency(grandTotal)}`
                                )}
                            </button>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Order Summary (Paytm Invoice Style) */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-24 overflow-hidden">
                            
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                <h2 className="font-bold text-blue-950 flex items-center">
                                    <ShoppingBag className="w-5 h-5 mr-2 text-sky-500" />
                                    Order Summary
                                </h2>
                                <span className="text-xs font-bold bg-white px-2 py-1 rounded text-gray-600 border border-gray-200">{cartItems.length} Items</span>
                            </div>
                            
                            <div className="p-5">
                                <div className="max-h-60 overflow-y-auto space-y-4 mb-6 custom-scrollbar pr-2">
                                    {cartItems.map((item, index) => (
                                        <div key={item.id || index} className="flex justify-between items-start">
                                            <div className="flex-1 pr-3">
                                                <p className="text-sm font-semibold text-blue-950 line-clamp-2 leading-snug">{item.name}</p>
                                                <p className="text-xs text-gray-500 mt-1 font-medium">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-blue-950 text-sm">
                                                {formatCurrency(item.price * (item.quantity || 0))}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Clean Promo Box */}
                                <div className="mb-6 pt-6 border-t border-dashed border-gray-200">
                                    {appliedCoupon ? (
                                        <div className="flex items-center justify-between bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-100">
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-emerald-600" />
                                                <span className="text-sm font-bold text-emerald-700">{appliedCoupon} Applied!</span>
                                            </div>
                                            <button onClick={handleRemoveCoupon} className="text-emerald-600 hover:text-emerald-800 transition-colors">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={couponInput}
                                                onChange={(e) => setCouponInput(e.target.value)}
                                                placeholder="Promo Code" 
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none text-sm transition-all font-bold uppercase text-blue-950"
                                            />
                                            <button type="button" onClick={handleApplyCoupon} className="px-4 py-2 bg-blue-500 text-white font-bold text-sm rounded-lg hover:bg-blue-900 transition-colors">
                                                Apply
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-gray-600 font-medium">
                                        <p>Subtotal</p>
                                        <p className="text-blue-950">{formatCurrency(subtotal)}</p>
                                    </div>
                                    
                                    {discountRate > 0 && (
                                        <div className="flex justify-between text-emerald-600 font-bold">
                                            <p>Discount ({(discountRate * 100)}%)</p>
                                            <p>- {formatCurrency(totalDiscount)}</p>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-gray-600 font-medium">
                                        <p>Taxes & GST</p>
                                        <p className="text-blue-950">+ {formatCurrency(totalTax)}</p>
                                    </div>
                                    <div className="flex justify-between text-gray-600 font-medium">
                                        <p>Shipping</p>
                                        <p className="text-emerald-600 font-bold">FREE</p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-5 mt-5 flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">To Pay</p>
                                        <p className="text-2xl font-black text-blue-950">
                                            {formatCurrency(grandTotal)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Paytm Trust Badges */}
                       

                    </div>
                    
                </form>
            </div>
             <div className="mt-6 flex flex-col items-center justify-center space-y-3 opacity-60">
                            <div className="flex items-center gap-3">
                                <img src="/paytm_logo.png" className="h-4 object-contain grayscale" alt="Paytm" onError={(e) => e.currentTarget.style.display = 'none'} />
                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                <span className="text-xs font-bold text-gray-500">PCI DSS Compliant</span>
                            </div>
                        </div>
        </div>
    );
}