"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  Package, CreditCard, Ticket, ChevronDown, ChevronUp, 
  CheckCircle2, X, RefreshCw, Loader2, Search, 
  Clock, Truck, CheckCircle, XCircle, LayoutDashboard
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// --- TYPES & TEMPLATES ---
type OrderStatus = "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STATUS_TEMPLATES: Record<OrderStatus, string> = {
  PENDING: "Your order has been received and is currently in our processing queue.",
  SHIPPED: "Great news! Your order has been dispatched. Expect delivery soon.",
  DELIVERED: "Your package has been successfully delivered. We hope you enjoy your purchase!",
  CANCELLED: "Order cancelled. Any pending payments have been voided or refunded.",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal & Toast State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeUpdate, setActiveUpdate] = useState<{ id: string; status: OrderStatus } | null>(null);
  const [remark, setRemark] = useState("");
  const [toast, setToast] = useState({ message: "", visible: false });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/admin/orders");
        const data = await res.json();
        if (data.success) setOrders(data.orders);
      } catch (err) {
        console.error("Network error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // --- LOGIC: CALCULATE SUMMARY STATS ---
  const stats = useMemo(() => {
    return orders.reduce((acc, curr) => {
      acc[curr.status as OrderStatus] = (acc[curr.status as OrderStatus] || 0) + 1;
      return acc;
    }, { PENDING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery]);

  const triggerStatusModal = (id: string, status: OrderStatus) => {
    setActiveUpdate({ id, status });
    setRemark(STATUS_TEMPLATES[status] || "");
    setModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    if (!activeUpdate || !remark.trim()) return;
    const res = await fetch(`/api/admin/orders/${activeUpdate.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: activeUpdate.status, remark }),
    });

    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === activeUpdate.id ? { ...o, status: activeUpdate.status } : o));
      setModalOpen(false);
      showToast(`Order status updated to ${activeUpdate.status}`);
    }
  };

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: "", visible: false }), 4000);
  };

  if (loading) return (
    <div className="flex flex-col h-screen items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="font-bold text-slate-400 animate-pulse uppercase tracking-widest text-xs">Loading Ledger...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10 relative bg-slate-50/30 min-h-screen">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <header className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl">
              <LayoutDashboard className="text-white" size={20} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fulfillment Hub</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Monitoring {orders.length} transactions in real-time.</p>
        </header>

        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search Order ID or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[20px] text-sm focus:ring-4 ring-blue-500/10 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* --- SUMMARY WIDGETS --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Pending", val: stats.PENDING, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Shipped", val: stats.SHIPPED, icon: Truck, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Delivered", val: stats.DELIVERED, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Cancelled", val: stats.CANCELLED, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
        ].map((item) => (
          <div key={item.label} className="bg-white p-5 md:p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`${item.bg} ${item.color} p-3 rounded-2xl`}>
              <item.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-2xl font-black text-slate-900 leading-none mt-1">{item.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* --- STATUS RATIO BAR --- */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Health</h3>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Live Sync Active</span>
        </div>
        <div className="h-3 w-full flex rounded-full overflow-hidden bg-slate-200 border border-white shadow-inner">
          <div style={{ width: `${(stats.DELIVERED / orders.length) * 100}%` }} className="bg-emerald-500 transition-all duration-1000" />
          <div style={{ width: `${(stats.SHIPPED / orders.length) * 100}%` }} className="bg-blue-500 transition-all duration-1000" />
          <div style={{ width: `${(stats.PENDING / orders.length) * 100}%` }} className="bg-orange-400 transition-all duration-1000" />
          <div style={{ width: `${(stats.CANCELLED / orders.length) * 100}%` }} className="bg-rose-500 transition-all duration-1000" />
        </div>
      </div>

      {/* --- LIST SECTION --- */}
      <div className="grid gap-4 md:gap-6">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="overflow-hidden border-slate-200 shadow-sm rounded-[24px] md:rounded-[32px] hover:shadow-xl hover:border-blue-200 transition-all group">
            <div 
              className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between cursor-pointer bg-white gap-6"
              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
            >
              <div className="flex flex-wrap gap-6 md:gap-12 items-center flex-1">
                <div>
                  <p className="font-bold text-slate-400 text-[9px] md:text-[10px] uppercase tracking-widest mb-1">ID</p>
                  <p className="font-mono text-xs font-black bg-slate-100 px-2 py-1 rounded-lg text-slate-600">#{order.id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-400 text-[9px] md:text-[10px] uppercase tracking-widest mb-1">Revenue</p>
                  <p className="font-black text-lg text-blue-600">₹{Number(order.totalAmount).toLocaleString()}</p>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <p className="font-bold text-slate-400 text-[9px] md:text-[10px] uppercase tracking-widest mb-1">Client</p>
                  <p className="font-black text-sm text-slate-800 truncate">{order.user.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0">
                <StatusBadge status={order.status} />
                <div className={`p-2 rounded-full transition-all ${expandedId === order.id ? 'bg-slate-900 text-white rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                    <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {expandedId === order.id && (
              <CardContent className="bg-slate-50/50 border-t border-slate-100 p-6 md:p-10 space-y-10 animate-in slide-in-from-top-4 duration-300">
                {/* Workflow Progression */}
                <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between bg-white p-6 md:p-8 rounded-[28px] border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <CheckCircle2 size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Update Lifecycle</span>
                  </div>
                  <div className="grid grid-cols-2 md:flex flex-wrap gap-3">
                    {(["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"] as OrderStatus[]).map(s => (
                      <button
                        key={s}
                        onClick={(e) => { e.stopPropagation(); triggerStatusModal(order.id, s); }}
                        className={`px-5 py-3 rounded-2xl text-[10px] font-black tracking-tight transition-all active:scale-95 ${
                          order.status === s 
                            ? 'bg-slate-900 text-white shadow-lg' 
                            : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-600 hover:text-blue-600'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Items Manifest */}
                  <div className="space-y-6">
                    <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <Package size={14} /> Shipping Manifest
                    </h3>
                    <div className="bg-white rounded-[28px] border border-slate-200 overflow-hidden shadow-sm">
                      {order.orderItems.map((item: any) => (
                        <div key={item.id} className="p-5 border-b border-slate-50 last:border-0 flex justify-between items-center group/item">
                          <div className="space-y-1">
                            <p className="font-black text-slate-800 text-sm group-hover/item:text-blue-600 transition-colors">{item.product.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-black text-slate-900">₹{Number(item.priceAtTime).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-10">
                    {/* Finance Record */}
                    <div className="space-y-6">
                      <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <CreditCard size={14} /> Financial Audit
                      </h3>
                      <div className="bg-white p-6 rounded-[28px] border border-slate-200 flex justify-between items-center shadow-sm">
                        <span className="font-bold text-slate-500 italic text-sm">{order.payments[0]?.method || "Bank Transfer"}</span>
                        <div className="flex flex-col items-end">
                            <span className="font-black text-emerald-600 text-[10px] uppercase tracking-widest">{order.payments[0]?.status}</span>
                            <span className="text-[9px] text-slate-400 font-bold">AUTH_REF: {order.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Support Inquiries */}
                    {order.supportTickets?.length > 0 && (
                      <div className="space-y-6">
                        <h3 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          <Ticket size={14} /> Linked Inquiries
                        </h3>
                        <div className="space-y-3">
                          {order.supportTickets.map((t: any) => (
                            <div key={t.id} className="bg-white p-4 rounded-2xl border border-red-100 flex justify-between text-xs items-center shadow-sm">
                              <span className="font-black text-slate-700">{t.subject}</span>
                              <span className="text-red-500 font-black bg-red-50 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest">{t.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* --- TOAST & MODAL (Standardized) --- */}
      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-300">
          <CheckCircle2 className="text-emerald-400 w-5 h-5" />
          <p className="text-sm font-bold tracking-tight">{toast.message}</p>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-[40px] md:rounded-[40px] p-8 md:p-10 shadow-2xl animate-in slide-in-from-bottom-20 md:zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Confirm Update</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Status: <span className="text-blue-600">{activeUpdate?.status}</span></p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <label>Customer Notification</label>
                    <button onClick={() => setRemark(STATUS_TEMPLATES[activeUpdate?.status || "PENDING"])} className="text-blue-600 flex items-center gap-1 hover:opacity-70"><RefreshCw size={10} /> Reset</button>
                </div>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full h-40 p-5 bg-slate-50 border border-slate-200 rounded-[28px] text-sm leading-relaxed focus:ring-4 ring-blue-500/10 outline-none transition-all resize-none font-medium"
                />
                <button onClick={handleConfirmUpdate} disabled={!remark.trim()} className="w-full bg-slate-900 text-white font-black py-5 rounded-[28px] hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl">Update & Send Email</button>
                <div className="h-4 md:hidden" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    PENDING: "bg-orange-50 text-orange-600 border-orange-100",
    SHIPPED: "bg-blue-50 text-blue-600 border-blue-100",
    DELIVERED: "bg-green-50 text-green-600 border-green-100",
    CANCELLED: "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <span className={`px-4 py-1.5 md:px-5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black border tracking-[0.1em] shadow-sm uppercase ${styles[status]}`}>
      {status}
    </span>
  );
}