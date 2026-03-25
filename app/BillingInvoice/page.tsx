"use client";

import React, { useState, useEffect } from 'react';
import { 
    CheckCircle2, Printer, ArrowLeft, Download, ShieldCheck, Sparkles, Receipt, MapPin 
} from 'lucide-react';
import Link from 'next/link';

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

    useEffect(() => {
        setIsClient(true);
        const storedInvoice = sessionStorage.getItem('finalInvoiceData');
        if (storedInvoice) {
            try { setInvoiceData(JSON.parse(storedInvoice)); } 
            catch (e) { console.error("Error parsing final invoice data:", e); }
        }
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (!isClient) return null;

    // Fallback if no data is found
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
    
    // --- Detailed Calculations ---
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

    const { subtotal, totalDiscount, totalTax, grandTotal, paymentMode, shippingAddress, appliedCoupon } = invoiceData;
    const finalPayableRounded = Math.round(grandTotal);
    const roundOff = parseFloat((finalPayableRounded - grandTotal).toFixed(2));

    const invoiceMeta = {
        number: "INV-" + Math.floor(100000 + Math.random() * 900000), 
        date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' }),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    // Crazy Barcode Generator (Dark bars for light theme)
    const barcodeBars = Array.from({ length: 42 }).map((_, i) => {
        const widths = ['w-0.5', 'w-1', 'w-1.5', 'w-2'];
        return widths[Math.floor(Math.random() * widths.length)];
    });

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8 font-sans overflow-hidden relative pb-24 print:bg-white print:p-0 print:m-0">
            
            {/* Top Navigation - HIDDEN IN PRINT */}
            <div className="max-w-xl mx-auto mb-8 flex justify-between items-center relative z-20 print:hidden">
                <Link href="/" className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
                </Link>
                <button onClick={handlePrint} className="flex items-center text-sm font-bold text-slate-700 hover:text-indigo-600 bg-white px-5 py-2.5 rounded-xl border border-slate-200 transition-all shadow-sm hover:shadow-md">
                    <Printer className="w-4 h-4 mr-2" /> Print Receipt
                </button>
            </div>

            {/* --- THE TICKET / RECEIPT --- */}
            {/* print:max-w-none removes width restrictions on paper, print:shadow-none removes shadows */}
            <div className="max-w-xl mx-auto relative z-10 print:max-w-none print:w-full">
                
                <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] overflow-hidden border border-slate-100 print:shadow-none print:border-none print:rounded-none">
                    
                    {/* Glowing Success Header */}
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-8 text-center relative overflow-hidden print:bg-none print:bg-white print:text-black print:border-b-2 print:border-slate-200 print:p-4">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 print:hidden"></div>
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

                    {/* Receipt Body */}
                    <div className="px-8 pt-8 pb-4 bg-white print:px-0">
                        
                        {/* Meta Data */}
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

                        {/* Customer Info */}
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

                        {/* Items List */}
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

                    {/* --- THE "TICKET TORN" EFFECT (HIDDEN IN PRINT) --- */}
                    <div className="relative h-8 bg-white flex items-center justify-between z-20 print:hidden">
                        {/* Left Cutout - matches body background (slate-50) */}
                        <div className="absolute -left-4 w-8 h-8 bg-slate-50 rounded-full shadow-inner border-r border-slate-100"></div>
                        {/* Dashed Line */}
                        <div className="w-full border-t-2 border-dashed border-slate-200 mx-6"></div>
                        {/* Right Cutout - matches body background (slate-50) */}
                        <div className="absolute -right-4 w-8 h-8 bg-slate-50 rounded-full shadow-inner border-l border-slate-100"></div>
                    </div>

                    {/* Line for print only (replaces cutout) */}
                    <div className="hidden print:block w-full border-t-2 border-dashed border-slate-300 my-4"></div>

                    {/* Totals Section */}
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
                        
                        {/* Crazy Barcode Footer */}
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

            {/* Print Styles injected globally */}
            <style jsx global>{`
                @media print {
                    /* Reset body to pure white */
                    body { 
                        background-color: white !important; 
                        color: black !important;
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important;
                    }
                    /* Force hiding web elements */
                    .print\\:hidden { display: none !important; }
                    
                    /* Reset shadows, rounded corners, and widths */
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:rounded-none { border-radius: 0 !important; }
                    .print\\:max-w-none { max-width: none !important; }
                    .print\\:w-full { width: 100% !important; }
                    
                    /* Adjust padding/margins for A4 paper */
                    .print\\:bg-white { background-color: white !important; }
                    .print\\:bg-transparent { background-color: transparent !important; }
                    .print\\:p-0 { padding: 0 !important; }
                    .print\\:px-0 { padding-left: 0 !important; padding-right: 0 !important; }
                    .print\\:py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
                    .print\\:p-4 { padding: 1rem !important; }
                    .print\\:m-0 { margin: 0 !important; }
                    
                    /* Typography specific to print */
                    .print\\:text-black { color: black !important; }
                    .print\\:text-slate-900 { color: #0f172a !important; }
                    .print\\:text-slate-800 { color: #1e293b !important; }
                    .print\\:text-slate-700 { color: #334155 !important; }
                    .print\\:text-slate-600 { color: #475569 !important; }
                    .print\\:text-slate-500 { color: #64748b !important; }
                    .print\\:text-emerald-600 { color: #059669 !important; }
                    
                    /* Borders specific to print */
                    .print\\:border-none { border: none !important; }
                    .print\\:border-transparent { border-color: transparent !important; }
                    .print\\:border-slate-200 { border-color: #e2e8f0 !important; }
                    .print\\:border-slate-300 { border-color: #cbd5e1 !important; }
                    .print\\:border-slate-800 { border-color: #1e293b !important; }
                    .print\\:border-b-2 { border-bottom-width: 2px !important; }
                    
                    /* Sizing for print */
                    .print\\:w-16 { width: 4rem !important; }
                    .print\\:h-16 { height: 4rem !important; }
                    .print\\:w-10 { width: 2.5rem !important; }
                    .print\\:h-10 { height: 2.5rem !important; }
                    
                    /* Page breaks */
                    .print\\:break-inside-avoid { break-inside: avoid; }
                    
                    /* Block display */
                    .print\\:block { display: block !important; }
                }
            `}</style>
        </div>
    );
}