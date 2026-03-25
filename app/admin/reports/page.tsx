"use client";

import React, { useEffect, useState } from "react";
import { 
  BarChart3, FileText, Download, TrendingUp, Search,
  Users, Calendar, FileCheck, ShieldAlert, Loader2, 
  ExternalLink, Filter, MoreVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";

export default function ReportsAndInvoices() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/reports")
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json);
        setLoading(false);
      });
  }, []);

  // --- NEW FEATURE: CSV EXPORT ---
  const exportToCSV = () => {
    if (!data?.documents) return;
    const headers = ["ID,Client,Type,Amount,Date\n"];
    const rows = data.documents.map((d: any) => 
      `${d.id},${d.client},${d.type},${d.amount},${new Date(d.date).toLocaleDateString()}`
    );
    const blob = new Blob([headers + rows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Financial_Report_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    toast.success("CSV Export Started");
  };

  const filteredDocs = data?.documents.filter((d: any) => 
    d.client.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Ledger...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-10 min-h-screen bg-slate-50/20">
      <Toaster />
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={28} /> Financial Hub
          </h1>
          <p className="text-slate-500 text-sm font-medium">Real-time revenue and compliance tracking.</p>
        </div>
        <Button onClick={exportToCSV} className="rounded-2xl bg-slate-900 px-6 py-6 font-bold flex items-center gap-2 w-full md:w-auto shadow-xl shadow-slate-200">
          <Download size={18} /> Export Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard label="Net Revenue" val={`₹${data?.stats.totalRevenue.toLocaleString()}`} color="blue" icon={<TrendingUp />} />
        <StatCard label="AOV" val={`₹${Math.round(data?.stats.avgOrderValue)}`} color="indigo" icon={<Users />} />
        <StatCard label="Refunds" val={`${data?.stats.refundRatio}%`} color="rose" icon={<ShieldAlert />} />
        <StatCard label="Documents" val={data?.documents.length} color="slate" icon={<FileText />} />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Trend Mini-Chart (Visual Representation) */}
        <Card className="lg:col-span-1 rounded-[32px] border-none shadow-sm ring-1 ring-slate-100 p-6 space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Flow</h3>
          <div className="h-48 flex items-end gap-2 px-2">
            {data?.chartData.map((m: any) => (
              <div key={m.name} className="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  style={{ height: `${(m.total / data.stats.totalRevenue) * 200}%` }} 
                  className="w-full bg-blue-100 group-hover:bg-blue-600 rounded-t-lg transition-all min-h-[10px]"
                />
                <span className="text-[9px] font-bold text-slate-400">{m.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Search & Document Archive */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-4 bg-white p-2 rounded-[20px] border border-slate-200 shadow-sm px-4">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter by Email or ID..." 
              className="w-full bg-transparent border-none outline-none text-sm font-medium h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
             {/* Desktop Table View */}
             <div className="hidden md:block">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <th className="p-6">Document</th>
                     <th className="p-6">Type</th>
                     <th className="p-6">Amount</th>
                     <th className="p-6 text-right">Link</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {filteredDocs?.map((doc: any) => (
                     <tr key={doc.id} className="group hover:bg-slate-50/50 transition-colors">
                       <td className="p-6">
                         <p className="font-mono text-xs font-black text-slate-900">{doc.id}</p>
                         <p className="text-[10px] text-slate-400 font-bold">{doc.client}</p>
                       </td>
                       <td className="p-6">
                         <span className={`text-[9px] font-black px-2 py-1 rounded-md border ${doc.amount < 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                           {doc.type}
                         </span>
                       </td>
                       <td className={`p-6 font-black text-sm ${doc.amount < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                         {doc.amount < 0 ? `-₹${Math.abs(doc.amount)}` : `₹${doc.amount}`}
                       </td>
                       <td className="p-6 text-right">
                         <Button variant="ghost" size="icon" className="rounded-xl"><ExternalLink size={16}/></Button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>

             {/* Mobile Card View */}
             <div className="md:hidden divide-y divide-slate-100">
               {filteredDocs?.map((doc: any) => (
                 <div key={doc.id} className="p-4 space-y-3">
                   <div className="flex justify-between items-start">
                     <div className="font-mono text-xs font-black">{doc.id}</div>
                     <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase ${doc.amount < 0 ? 'text-rose-600 border-rose-100' : 'text-emerald-600 border-emerald-100'}`}>{doc.type}</span>
                   </div>
                   <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[10px] text-slate-400 font-bold">{doc.client}</p>
                        <p className={`text-sm font-black mt-1 ${doc.amount < 0 ? 'text-rose-600' : 'text-slate-900'}`}>₹{Math.abs(doc.amount)}</p>
                     </div>
                     <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg"><Download size={12}/></Button>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, val, color, icon }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 shadow-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 shadow-indigo-100",
    rose: "bg-rose-50 text-rose-600 shadow-rose-100",
    slate: "bg-slate-50 text-slate-600 shadow-slate-100",
  };
  return (
    <Card className="rounded-[28px] md:rounded-[32px] border-none shadow-sm ring-1 ring-slate-100 overflow-hidden">
      <CardContent className="p-5 md:p-8 flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${colors[color]} shadow-lg`}>{icon}</div>
        <div>
          <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none">{label}</p>
          <h3 className="text-lg md:text-2xl font-black text-slate-900 mt-1.5 leading-none">{val}</h3>
        </div>
      </CardContent>
    </Card>
  );
}