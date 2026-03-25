"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  ShieldAlert, CheckCircle2, XCircle, Clock, 
  PackageMinus, Info, Loader2, ArrowLeft, Image as ImageIcon 
} from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

const formatCurrency = (amount: any) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 0
  }).format(Number(amount));
};

// 1. Rename your original component to be the "Content"
function SupportRefundContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    // Fetch order details & existing refunds
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.order);
        }
      } catch (err) {
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Handle Item Checkbox Toggle
  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  // Calculate dynamic refund amount based on selected items
  const calculatedRefund = order?.orderItems
    ?.filter((item: any) => selectedItems.includes(item.id))
    .reduce((total: number, item: any) => total + (Number(item.priceAtTime) * item.quantity), 0) || 0;

  // Submit Refund Request
  const handleSubmit = async () => {
    if (selectedItems.length === 0) return toast.error("Please select at least one item.");
    if (!reason.trim()) return toast.error("Please provide a reason for the return.");

    setIsSubmitting(true);
    const selectedNames = order.orderItems
        .filter((i: any) => selectedItems.includes(i.id))
        .map((i: any) => i.product.name);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          amount: calculatedRefund,
          reason: reason,
          selectedItems: selectedNames
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Refund request submitted successfully!");
        window.location.reload();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
  );

  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <ShieldAlert size={64} className="text-slate-300 mb-4" />
      <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
      <Link href="/orders" className="mt-4 text-indigo-600 font-bold hover:underline">Go back to My Orders</Link>
    </div>
  );

  const existingRefund = order.refunds && order.refunds.length > 0 ? order.refunds[order.refunds.length - 1] : null;

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 md:px-10 font-sans">
      <Toaster />
      <div className="max-w-3xl mx-auto space-y-8">
        
        <Link href="/orders" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Orders
        </Link>

        <header>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Return & Refund</h1>
          <p className="text-slate-500 font-medium mt-1">Order #{order.id.slice(-8).toUpperCase()}</p>
        </header>

        {existingRefund ? (
          <div className="space-y-6">
            {existingRefund.status === "PENDING" && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-[32px] p-8 md:p-12 text-center">
                 <Clock className="w-20 h-20 text-amber-500 mx-auto mb-6 animate-pulse" />
                 <h2 className="text-2xl font-black text-amber-700 mb-2">Request Under Review</h2>
                 <p className="text-amber-600 font-medium max-w-md mx-auto">
                   We have received your return request for <b>{formatCurrency(existingRefund.amount)}</b>. Our team is reviewing it and will update you shortly.
                 </p>
              </div>
            )}

            {existingRefund.status === "APPROVED" && (
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-[32px] p-8 md:p-12 text-center shadow-lg shadow-emerald-100">
                 <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
                 <h2 className="text-2xl font-black text-emerald-700 mb-2">Refund Successful!</h2>
                 <p className="text-emerald-700 font-medium max-w-md mx-auto">
                   Your refund of <b>{formatCurrency(existingRefund.amount)}</b> has been approved. 
                   <br/><br/>
                   <span className="bg-emerald-200/50 px-4 py-2 rounded-xl text-sm font-bold block">
                     Money will be added back to your source account in 2-3 working days.
                   </span>
                 </p>
              </div>
            )}

            {existingRefund.status === "REJECTED" && (
              <div className="bg-rose-50 border-2 border-rose-200 rounded-[32px] p-8 md:p-12 text-center">
                 <XCircle className="w-20 h-20 text-rose-500 mx-auto mb-6" />
                 <h2 className="text-2xl font-black text-rose-700 mb-2">Request Rejected</h2>
                 <p className="text-rose-600 font-medium max-w-md mx-auto">
                   Sorry, your refund request could not be approved by the administration. If you have questions, please contact support.
                 </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] border border-slate-200 p-6 md:p-10 shadow-sm space-y-8">
            
            <div>
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <PackageMinus size={20} className="text-indigo-600" /> Select items to return
              </h3>
              
              <div className="space-y-4">
                {order.orderItems.map((item: any) => (
                  <label 
                    key={item.id} 
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedItems.includes(item.id) ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItem(item.id)}
                    />
                    
                    <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                       {item.product.images?.length > 0 ? (
                         <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                       ) : (
                         <ImageIcon className="text-slate-300" />
                       )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">Qty: {item.quantity}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-black text-slate-900">{formatCurrency(item.priceAtTime * item.quantity)}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-black text-slate-900">Why are you returning this?</label>
              <textarea 
                rows={3}
                placeholder="E.g. Item was damaged, received wrong product..."
                className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-600 outline-none transition-all text-sm font-medium resize-none"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
               <div>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Refund Amount</p>
                 <p className="text-3xl font-black text-white">{formatCurrency(calculatedRefund)}</p>
               </div>
               
               <button 
                  onClick={handleSubmit} 
                  disabled={selectedItems.length === 0 || isSubmitting}
                  className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl px-10 h-14 uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-900/50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Submit Request"}
               </button>
            </div>
            
            <p className="text-xs font-bold text-slate-400 text-center flex items-center justify-center gap-1">
              <Info size={14} /> Refund subject to admin verification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 2. Create your actual Default Export that wraps the Content in <Suspense>
export default function SupportRefundPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    }>
      <SupportRefundContent />
    </Suspense>
  );
}