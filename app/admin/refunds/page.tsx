"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  History, ShieldCheck, XCircle, Clock, ChevronDown, 
  Search, Loader2, IndianRupee, AlertCircle, ChevronLeft, ChevronRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import toast, { Toaster } from "react-hot-toast";

type RefundStatus = "PENDING" | "APPROVED" | "REJECTED";

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeUpdate, setActiveUpdate] = useState<{ id: string; status: RefundStatus } | null>(null);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => { fetchRefunds(); }, []);

  const fetchRefunds = async () => {
    try {
      const res = await fetch("/api/admin/refunds");
      const data = await res.json();
      if (data.success) setRefunds(data.refunds);
      else throw new Error();
    } catch (err) {
      toast.error("Database connection failed");
    } finally { setLoading(false); }
  };

  const handleUpdateStatus = async () => {
    if (!activeUpdate) return;
    const updatePromise = fetch("/api/admin/refunds", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: activeUpdate.id, status: activeUpdate.status }),
    }).then(async (res) => {
      if (!res.ok) throw new Error();
      setRefunds(prev => prev.map(r => r.id === activeUpdate.id ? { ...r, status: activeUpdate.status } : r));
      setModalOpen(false);
    });

    toast.promise(updatePromise, {
      loading: 'Syncing...',
      success: 'Database Updated!',
      error: 'Sync Failed',
    });
  };

  // --- FILTER & PAGINATION LOGIC ---
  const filteredRefunds = useMemo(() => {
    return refunds.filter(r => r.order.user.email.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [refunds, searchQuery]);

  const totalPages = Math.ceil(filteredRefunds.length / recordsPerPage);
  
  const currentRecords = useMemo(() => {
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    return filteredRefunds.slice(indexOfFirstRecord, indexOfLastRecord);
  }, [filteredRefunds, currentPage]);

  const stats = useMemo(() => {
    return refunds.reduce((acc, curr) => {
      acc[curr.status]++;
      if (curr.status === "APPROVED") acc.total += Number(curr.amount);
      return acc;
    }, { PENDING: 0, APPROVED: 0, REJECTED: 0, total: 0 });
  }, [refunds]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-10 min-h-screen">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <header>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-blue-600 p-2 rounded-xl"><History className="text-white w-5 h-5 md:w-6 md:h-6" /></div>
            <h1 className="text-xl md:text-3xl font-black text-slate-900">Refund Control</h1>
          </div>
        </header>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Search Email..."
            className="w-full pl-11 pr-4 py-3 md:py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 ring-blue-500/10 transition-all text-sm"
            value={searchQuery} onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {[
          { label: "Awaiting", val: stats.PENDING, color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
          { label: "Processed", val: stats.APPROVED, color: "text-emerald-600", bg: "bg-emerald-50", icon: ShieldCheck },
          { label: "Declined", val: stats.REJECTED, color: "text-rose-600", bg: "bg-rose-50", icon: XCircle },
          { label: "Volume", val: `₹${Math.round(stats.total)}`, color: "text-blue-600", bg: "bg-blue-50", icon: IndianRupee },
        ].map((item) => (
          <div key={item.label} className="bg-white p-3 md:p-5 rounded-2xl md:rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-3">
            <div className={`${item.bg} ${item.color} p-2 rounded-lg md:rounded-xl`}> <item.icon size={18} /> </div>
            <div>
              <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
              <p className={`text-sm md:text-xl font-black ${item.color}`}>{item.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* List Section (Paginated) */}
      <div className="space-y-4">
        {currentRecords.map((refund) => (
          <Card key={refund.id} className="rounded-2xl md:rounded-[32px] overflow-hidden border-slate-100 shadow-sm">
            <div 
              className="p-4 md:p-8 flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedId(expandedId === refund.id ? null : refund.id)}
            >
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                <div className="hidden md:block">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Reference</p>
                  <p className="font-mono text-xs font-bold text-slate-700">#{refund.id.slice(-6).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Value</p>
                  <p className="font-black text-sm md:text-lg text-slate-900">₹{Number(refund.amount)}</p>
                </div>
                <div className="truncate pr-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase">Client</p>
                  <p className="text-xs font-bold text-slate-800 truncate">{refund.order.user.email}</p>
                </div>
                <div className="flex justify-end md:justify-start">
                  <StatusBadge status={refund.status} />
                </div>
              </div>
              <ChevronDown className={`ml-2 text-slate-400 transition-transform ${expandedId === refund.id ? 'rotate-180' : ''}`} size={16} />
            </div>

            {expandedId === refund.id && (
              <CardContent className="p-4 md:p-10 bg-slate-50/50 border-t space-y-6 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-xl border space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Dispute Reason</p>
                    <p className="text-sm font-medium italic text-slate-600">"{refund.reason}"</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Actions</p>
                    <div className="flex gap-2">
                      <button onClick={() => { setActiveUpdate({ id: refund.id, status: "APPROVED" }); setModalOpen(true); }} className="flex-1 bg-emerald-50 text-emerald-600 font-bold py-3 rounded-xl text-xs hover:bg-emerald-600 hover:text-white transition-all">APPROVE</button>
                      <button onClick={() => { setActiveUpdate({ id: refund.id, status: "REJECTED" }); setModalOpen(true); }} className="flex-1 bg-rose-50 text-rose-600 font-bold py-3 rounded-xl text-xs hover:bg-rose-600 hover:text-white transition-all">REJECT</button>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {/* Empty State */}
        {currentRecords.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[32px] border border-dashed">
            <p className="text-slate-400 font-bold">No refund records found.</p>
          </div>
        )}

        {/* --- PAGINATION CONTROLS --- */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl md:rounded-[24px] border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400">
              Page <span className="text-slate-900">{currentPage}</span> of {totalPages}
            </p>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white w-full md:max-w-sm rounded-t-3xl md:rounded-[40px] p-8 md:p-10 text-center animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0">
            <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Confirm {activeUpdate?.status}</h3>
            <p className="text-slate-500 text-sm mb-8">This action will sync the database and notify the customer immediately.</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleUpdateStatus} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-xs tracking-widest uppercase text-[10px]">Proceed Decision</button>
              <button onClick={() => setModalOpen(false)} className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg: any = {
    PENDING: "bg-amber-50 text-amber-600 border-amber-100",
    APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
  };
  return <span className={`px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black border uppercase tracking-wider ${cfg[status]}`}>{status}</span>;
}