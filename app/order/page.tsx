import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { 
  Package, Truck, CheckCircle, XCircle, 
  Clock, ShoppingBag, ArrowRight 
} from "lucide-react";
import Link from "next/link";

// Currency Formatter
const formatCurrency = (amount: any) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(Number(amount));
};

// Date Formatter
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(date));
};

export default async function MyOrdersPage() {
  // 1. Authenticate User
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  // 2. Fetch Internal User
  const user = await prisma.user.findUnique({
    where: { clerkId }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-bold">Please complete your profile first.</p>
      </div>
    );
  }

  // 3. Fetch Orders
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      orderItems: {
        include: {
          product: true 
        }
      }
    }
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 md:px-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <ShoppingBag className="text-indigo-600" size={32} />
            My Orders
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Track, manage, and view your recent purchases.
          </p>
        </header>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-slate-200 p-16 text-center shadow-sm flex flex-col items-center">
            <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-6">
              <Package size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">No orders found</h2>
            <p className="text-slate-500 mb-8 max-w-sm">Looks like you haven't made any purchases yet. Start exploring our store!</p>
            <Link href="/" className="bg-slate-900 text-white font-bold px-8 py-4 rounded-2xl hover:bg-indigo-600 transition-all">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ✅ FIX 1: Added ': any' to 'order' */}
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                
                <div className="bg-slate-50/50 p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex flex-wrap gap-x-8 gap-y-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order Placed</p>
                      <p className="text-sm font-bold text-slate-800">{formatDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-sm font-black text-slate-900">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
                      <p className="text-sm font-mono font-bold text-slate-600">#{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 w-full md:w-auto mt-4 md:mt-0">
                     <OrderStatusBadge status={order.status} />
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  {/* ✅ FIX 2: Added ': any' to 'item' */}
                  {order.orderItems.map((item: any) => (
                    <div key={item.id} className="flex gap-6 items-center">
                      
                      <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Package size={24} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                          <h4 className="text-base font-bold text-slate-900 line-clamp-1">{item.product.name}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.product.description}</p>
                          <div className="text-xs font-bold text-slate-400 mt-2 bg-slate-100 w-fit px-2 py-1 rounded-md">
                            Qty: {item.quantity}
                          </div>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-lg font-black text-slate-900">{formatCurrency(item.priceAtTime)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 p-4 md:px-8 border-t border-slate-100 flex justify-end gap-3">
                  <Link href={`/support?orderId=${order.id}`} className="text-xs font-bold text-slate-500 hover:text-slate-900 px-4 py-2 transition-colors">
                    Need Help?
                  </Link>
                  <Link href={`/order/${order.id}`} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">
                    View Details <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const configs: any = {
    PENDING: { color: "bg-amber-50 text-amber-600 border-amber-200", icon: Clock, label: "Processing" },
    SHIPPED: { color: "bg-blue-50 text-blue-600 border-blue-200", icon: Truck, label: "Shipped" },
    DELIVERED: { color: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: CheckCircle, label: "Delivered" },
    CANCELLED: { color: "bg-rose-50 text-rose-600 border-rose-200", icon: XCircle, label: "Cancelled" },
  };

  const config = configs[status] || configs.PENDING;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.color}`}>
      <Icon size={14} /> {config.label}
    </span>
  );
}