"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    CheckCircle2, Printer, ArrowLeft, ShieldCheck, Sparkles, Receipt, MapPin
} from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

// --- Interfaces ---
interface Product {
    id: string;
    name: string;
    price: number;
    quantity?: number;
}

interface ShippingAddress {
    fullName: string;
    phone: string;
    addressLine: string;
    pinCode: string;
    city: string;
    state: string;
}

interface FinalInvoiceData {
    items: Product[];
    subtotal: number;
    totalDiscount: number;
    totalTax: number;
    grandTotal: number;
    paymentMode: string;
    appliedCoupon?: string | null;
    shippingAddress?: ShippingAddress;
}

const GST_RATES: Record<string, number> = { 'default': 0.18 };
const DISCOUNT_RATE = 0.05;

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount);
};

export default function BillingInvoice() {
    const [invoiceData, setInvoiceData] = useState<FinalInvoiceData | null>(null);
    const [isClient, setIsClient] = useState(false);

    // --- FIX 1: Move Database Save Logic ABOVE useEffect (Hoisting) ---
    const saveOrderToDB = async (data: FinalInvoiceData) => {
        try {
            const toastId = toast.loading("Saving order details...");

            const response = await fetch('/api/orders/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: data.items,
                    grandTotal: data.grandTotal,
                    paymentMode: data.paymentMode
                })
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Payment successful! Order saved.", { id: toastId });
                sessionStorage.setItem('invoiceSaved_db', 'true');
            } else {
                toast.error(result.error || "Failed to save order.", { id: toastId });
            }
        } catch (err) {
            console.error(err);
            toast.error("Network error while saving order.");
        }
    };

    useEffect(() => {
        setIsClient(true);
        const storedInvoice = sessionStorage.getItem('finalInvoiceData');
        const hasSavedToDB = sessionStorage.getItem('invoiceSaved_db');

        if (storedInvoice) {
            try {
                const parsedData: FinalInvoiceData = JSON.parse(storedInvoice);
                setInvoiceData(parsedData);

                if (!hasSavedToDB) {
                    saveOrderToDB(parsedData);
                }
            }
            catch (e) { console.error("Error parsing final invoice data:", e); }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- FIX 2: Use useMemo for Impure Functions (Math.random/Date) ---
    const invoiceMeta = useMemo(() => ({
        number: "INV-" + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' }),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }), []);

    const barcodeBars = useMemo(() => Array.from({ length: 42 }).map(() => {
        const widths = ['w-0.5', 'w-1', 'w-1.5', 'w-2'];
        return widths[Math.floor(Math.random() * widths.length)];
    }), []);

    const handlePrint = () => {
        if (typeof window !== 'undefined') window.print();
    };

    if (!isClient) return null;

    if (!invoiceData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
                <Receipt className="w-20 h-20 text-slate-300 mb-6" />
                <h2 className="text-2xl font-bold mb-2 text-slate-800">Invoice Not Found</h2>
                <p className="text-slate-500 mb-8 max-w-sm">Looks like the transaction details are no longer available.</p>
                <Link href="/" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md">
                    Return to Store
                </Link>
            </div>
        );
    }

    const { subtotal, totalDiscount, totalTax, grandTotal, paymentMode, shippingAddress, appliedCoupon } = invoiceData;
    const finalPayableRounded = Math.round(grandTotal);
    const roundOff = parseFloat((finalPayableRounded - grandTotal).toFixed(2));

    const detailedItems = invoiceData.items.map(item => {
        const itemTotal = (item.quantity || 0) * item.price;
        const taxRate = GST_RATES[item.name] || GST_RATES.default;
        const itemDiscount = itemTotal * DISCOUNT_RATE;
        const itemTaxable = itemTotal - itemDiscount;
        const itemTax = itemTaxable * taxRate;
        return {
            ...item,
            qty: item.quantity || 1,
            unitPrice: item.price,
            itemTotal,
            itemFinalPrice: itemTaxable + itemTax,
            taxRate
        };
    });

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8 font-sans overflow-hidden relative pb-24 print:bg-white print:p-0 print:m-0">
            <Toaster position="top-center" />

            <div className="max-w-xl mx-auto mb-8 flex justify-between items-center relative z-20 print:hidden">
                <Link href="/" className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
                </Link>
                <button onClick={handlePrint} className="flex items-center text-sm font-bold text-slate-700 hover:text-indigo-600 bg-white px-5 py-2.5 rounded-xl border border-slate-200 transition-all shadow-sm hover:shadow-md">
                    <Printer className="w-4 h-4 mr-2" /> Print Receipt
                </button>
            </div>

            <div className="max-w-xl mx-auto relative z-10 print:max-w-none print:w-full">
                <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] overflow-hidden border border-slate-100 print:shadow-none print:border-none print:rounded-none">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-8 text-center relative overflow-hidden print:bg-none print:bg-white print:text-black print:border-b-2 print:border-slate-200 print:p-4">
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md shadow-lg print:shadow-none print:bg-emerald-100 print:w-16 print:h-16">
                                <CheckCircle2 className="w-12 h-12 text-white print:text-emerald-600 print:w-10 print:h-10" />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight uppercase mb-1 print:text-slate-900">Payment Successful!</h1>
                            <p className="text-teal-50 font-medium flex items-center print:text-slate-600">
                                <Sparkles className="w-4 h-4 mr-1 text-yellow-300 print:hidden" />
                                Transaction Complete
                            </p>
                        </div>
                    </div>

                    <div className="px-8 pt-8 pb-4 bg-white print:px-0">
                        <div className="flex justify-between items-end mb-8 text-sm border-b border-slate-100 pb-6 print:border-slate-300">
                            <div className="font-mono text-slate-500 space-y-1 print:text-slate-700">
                                <p>Receipt: <span className="font-bold text-slate-800">{invoiceMeta.number}</span></p>
                                <p>{invoiceMeta.date} • {invoiceMeta.time}</p>
                                <p>Paid via: <span className="font-bold text-indigo-600 uppercase">{paymentMode}</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 print:text-slate-600">Total Paid</p>
                                <p className="text-3xl font-black text-slate-900">
                                    {formatCurrency(finalPayableRounded)}
                                </p>
                            </div>
                        </div>

                        {shippingAddress && (
                            <div className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100 print:bg-transparent print:border-slate-300 print:p-4">
                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-3 flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" /> Delivery Address
                                </p>
                                <p className="font-bold text-slate-800 text-lg">{shippingAddress.fullName}</p>
                                <p className="text-sm text-slate-600 mt-1">{shippingAddress.addressLine}</p>
                                <p className="text-sm text-slate-600">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.pinCode}</p>
                                <p className="text-sm text-slate-500 mt-2 font-medium flex items-center">
                                    📞 {shippingAddress.phone}
                                </p>
                            </div>
                        )}

                        <div className="mb-6">
                            <div className="border-b-2 border-slate-200 pb-3 mb-4 flex text-xs font-bold text-slate-400 uppercase tracking-widest print:border-slate-800 print:text-slate-600">
                                <span className="flex-1">Item Description</span>
                                <span className="w-12 text-center">Qty</span>
                                <span className="w-24 text-right">Amount</span>
                            </div>

                            <div className="space-y-4">
                                {detailedItems.map((item, index) => (
                                    <div key={index} className="flex justify-between items-start print:break-inside-avoid">
                                        <div className="flex-1 pr-2">
                                            <p className="text-sm font-bold text-slate-800 leading-tight">{item.name}</p>
                                            <p className="text-[10px] font-mono text-slate-400 mt-0.5 print:text-slate-500">GST Applied: {(item.taxRate * 100)}%</p>
                                        </div>
                                        <div className="w-12 text-center text-sm font-bold text-slate-600">{item.qty}</div>
                                        <div className="w-24 text-right text-sm font-bold text-slate-900">{formatCurrency(item.itemTotal)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-6 bg-slate-50 print:bg-white print:px-0 print:py-2">
                        <div className="space-y-3 font-mono text-sm text-slate-600 print:text-slate-800">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
                            </div>
                            {totalDiscount > 0 && (
                                <div className="flex justify-between text-emerald-600 font-bold print:text-slate-800">
                                    <span>Discount {appliedCoupon && `[${appliedCoupon}]`}</span>
                                    <span>-{formatCurrency(totalDiscount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Total Tax (GST)</span>
                                <span className="font-medium text-slate-900">+{formatCurrency(totalTax)}</span>
                            </div>
                            {roundOff !== 0 && (
                                <div className="flex justify-between text-slate-400 print:text-slate-600">
                                    <span>Round Off</span>
                                    <span>{formatCurrency(roundOff)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-black text-slate-900 pt-4 border-t border-slate-200 mt-2 print:border-slate-800">
                                <span>Grand Total</span>
                                <span>{formatCurrency(finalPayableRounded)}</span>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-200 flex flex-col items-center print:border-transparent print:pt-4">
                            <div className="flex justify-center h-12 w-full px-4 mb-2 opacity-60 print:opacity-100">
                                {barcodeBars.map((widthClass, i) => (
                                    <div key={i} className={`bg-slate-800 h-full ${widthClass} mx-[1px] print:bg-black`}></div>
                                ))}
                            </div>
                            <p className="font-mono text-[10px] tracking-[0.3em] text-slate-500 print:text-black">
                                {invoiceMeta.number.replace('-', '')}8921
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 flex items-center print:text-slate-600">
                                <ShieldCheck className="w-3 h-3 mr-1 text-emerald-500 print:text-slate-600" /> SECURE SMARTRETAIL RECEIPT
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}