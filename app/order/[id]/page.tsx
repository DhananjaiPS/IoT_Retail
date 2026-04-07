import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Package, Truck, CheckCircle2, XCircle, 
  Receipt, CreditCard, ShieldAlert, ChevronRight, HelpCircle
} from "lucide-react";

// Helper for formatting currency
const formatCurrency = (amount: any) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(Number(amount));
};

// Helper for date formatting
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(date));
};

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  // 1. Resolve params (Next.js 15 requirement)
  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  // 2. Authenticate User
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    redirect("/sign-in");
  }

  // 3. Fetch specific order ensuring it belongs to the logged-in user
  const order = await prisma.order.findUnique({
    where: { 
      id: orderId,
      userId: user.id // Security check: User can only view their own order
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      },
      payments: true,
      refunds: true
    }
  });

  // 4. Handle Not Found
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <ShieldAlert size={64} className="text-slate-300 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">Order Not Found</h2>
        <p className="text-slate-500 font-medium mb-6 text-center max-w-sm">
          We couldn't find this order. It might belong to another account or the ID is incorrect.
        </p>
        <Link href="/order" className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-all">
          Go back to My Order
        </Link>
      </div>
    );
  }

  // Payment info (Taking the latest payment attempt)
  const payment = order.payments.length > 0 ? order.payments[0] : null;
  const refundRequested = order.refunds.length > 0;

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 md:px-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* TOP NAVIGATION */}
        <Link href="/orders" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to all orders
        </Link>

        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Order Details
            </h1>
            <p className="text-slate-500 font-medium mt-1 font-mono text-sm">
              #{order.id.toUpperCase()} • Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <Link 
            href={`/support?orderId=${order.id}`} 
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm w-fit"
          >
            <HelpCircle size={18} /> Get Help / Return
          </Link>
        </header>

        {/* ORDER TRACKING TIMELINE */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Tracking Status</h3>
           <OrderTimeline status={order.status} />
           
           {refundRequested && (
             <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
                <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-bold text-amber-900">A refund request is active for this order.</p>
                  <p className="text-xs font-medium text-amber-700 mt-1">Check the support page for the latest updates on your refund status.</p>
                </div>
             </div>
           )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: ITEMS */}
          {/* LEFT COLUMN: ITEMS */}
<div className="lg:col-span-2 space-y-6">
  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Items in this order</h2>
  <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
    
    {/* ✅ FIX: Added ': any' to 'item' to satisfy strict mode */}
    {order.orderItems.map((item: any) => (
      <div key={item.id} className="p-6 md:p-8 flex gap-6 items-start md:items-center">
        
        {/* Item Image */}
        <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
          {item.product.images && item.product.images.length > 0 ? (
            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
          ) : (
            <Package className="text-slate-300" size={32} />
          )}
        </div>

        {/* Item Details */}
        <div className="flex-1">
          <h4 className="text-base font-bold text-slate-900 leading-tight">{item.product.name}</h4>
          <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">{item.product.description}</p>
          <div className="mt-3 flex items-center gap-4">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">Qty: {item.quantity}</span>
            <span className="text-sm font-black text-slate-900">{formatCurrency(item.priceAtTime)}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

          {/* RIGHT COLUMN: PAYMENT & SUMMARY */}
          <div className="space-y-6">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Payment Summary</h2>
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
              
              {/* Receipt Lines */}
              <div className="space-y-3 text-sm font-medium text-slate-500 border-b border-slate-100 pb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({order.orderItems.length} items)</span>
                  <span className="text-slate-900">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-bold">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (Included)</span>
                  <span className="text-slate-900">₹0.00</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-base font-black text-slate-900">Grand Total</span>
                <span className="text-2xl font-black text-indigo-600">{formatCurrency(order.totalAmount)}</span>
              </div>

              {/* Payment Method Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4 mt-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200 shrink-0">
                  <CreditCard className="text-indigo-500" size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Mode</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {payment ? payment.method : "Online"}
                    <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-widest">
                      {payment ? payment.status : "PAID"}
                    </span>
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENT: ORDER TIMELINE ---
function OrderTimeline({ status }: { status: string }) {
  // Define steps and their completion logic
  const steps = [
    { id: 'PENDING', label: 'Order Placed', icon: Receipt },
    { id: 'SHIPPED', label: 'Shipped', icon: Truck },
    { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
  ];

  // Determine current active step index
  let activeIndex = 0;
  if (status === 'SHIPPED') activeIndex = 1;
  if (status === 'DELIVERED') activeIndex = 2;

  // If order is cancelled, show a different UI entirely
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-600">
        <XCircle size={24} />
        <div>
          <p className="font-black text-lg">Order Cancelled</p>
          <p className="text-sm font-medium opacity-80">This order was cancelled and will not be delivered.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex justify-between items-center w-full max-w-2xl mx-auto">
      {/* Background Connecting Line */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-slate-100 rounded-full z-0" />
      
      {/* Active Connecting Line */}
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-indigo-600 rounded-full z-0 transition-all duration-500" 
        style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
      />

      {/* Steps */}
      {steps.map((step, index) => {
        const isCompleted = index <= activeIndex;
        const Icon = step.icon;
        
        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-3 bg-white px-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
              isCompleted 
                ? 'bg-indigo-600 border-indigo-100 text-white shadow-lg shadow-indigo-200' 
                : 'bg-white border-slate-100 text-slate-300'
            }`}>
              <Icon size={20} strokeWidth={isCompleted ? 2.5 : 2} />
            </div>
            <p className={`text-xs font-bold uppercase tracking-widest text-center ${
              isCompleted ? 'text-indigo-900' : 'text-slate-400'
            }`}>
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}