"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, TrendingUp, CreditCard, RefreshCcw, Wallet, Loader2 } from "lucide-react";
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PIE_COLORS = ['#00baf2', '#002970', '#7dd3fc', '#f39bb7', '#344b75', '#8fb0d0'];

// --- 1. Custom Tooltip Component ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-[22px] border border-slate-50 min-w-[180px]">
        <p className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-widest">
          {label}
        </p>
        
        <div className="space-y-3">
          {/* Sales Volume / Cost (Bar Data) */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Total Sales</span>
            <span className="text-[18px] font-black text-[#00baf2] tracking-tighter">
              ₹{Number(payload[0].value).toLocaleString('en-IN')}
            </span>
          </div>
          
          <div className="h-px bg-slate-100 w-full" />
          
          {/* Orders Count (Line Data) */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase">No. of Orders</span>
            <span className="text-[18px] font-black text-[#002970] tracking-tighter">
              {payload[1]?.value || 0} Orders
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function DashboardCharts() {
  const [data, setData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/stats?range=${timeRange}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [timeRange]);

  const tabs = ["Today", "Week", "Month", "All"];

  return (
    <div className={`space-y-8 mt-8 transition-all duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
      
      {/* --- FILTER TABS --- */}
      <div className="flex items-center justify-between">
        <div className="flex bg-slate-100/80 p-1 rounded-full border border-slate-200 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setTimeRange(tab)}
              className={`px-6 py-1.5 rounded-full text-sm font-semibold transition-all ${
                timeRange === tab ? "bg-white text-[#00baf2] shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {loading && <Loader2 className="w-5 h-5 animate-spin text-[#00baf2]" />}
      </div>

      {/* --- KPI SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard title="Total Success" value={`₹${(data?.kpis?.totalSuccess || 0).toLocaleString('en-IN')}`} icon={<Wallet />} color="bg-blue-50 text-blue-600" />
        <KPICard title="Pending" value={data?.kpis?.pendingOrders || 0} icon={<CreditCard />} color="bg-orange-50 text-orange-600" />
        <KPICard title="Refunds" value={`₹${(data?.kpis?.refunds || 0).toLocaleString('en-IN')}`} icon={<RefreshCcw />} color="bg-pink-50 text-pink-600" />
        <KPICard title="Total Users" value={data?.kpis?.newUsers || 0} icon={<TrendingUp />} color="bg-green-50 text-green-600" />
      </div>

      {/* --- CHARTS --- */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="col-span-2">
          <Card className="border-none shadow-sm rounded-[24px] bg-white h-[450px] overflow-hidden">
            <CardHeader className="px-8 pt-8 flex flex-row justify-between items-center">
              <CardTitle className="text-xl font-bold text-slate-800">Payment Volume ({timeRange})</CardTitle>
              <Download className="w-5 h-5 text-slate-300 hover:text-[#00baf2] cursor-pointer transition-colors" />
            </CardHeader>
            <CardContent className="h-full pb-16">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data?.reportData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  
                  {/* --- 2. Tooltip Connection --- */}
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  
                  <Bar dataKey="volume" fill="#00baf2" radius={[6, 6, 0, 0]} barSize={14} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#002970" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#002970', stroke: '#fff', strokeWidth: 2 }} 
                    activeDot={{ r: 6, fill: '#002970' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* --- PIE CHART SECTION --- */}
        <Card className="border-none shadow-sm rounded-[24px] bg-white h-[450px]">
          <CardHeader className="px-8 pt-8 font-bold text-xl text-slate-800">Sources</CardHeader>
          <CardContent className="flex flex-col h-full justify-between pb-10">
            <div className="h-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.pieData || []} innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value" cornerRadius={8}>
                    {(data?.pieData || []).map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-800">100%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live</span>
              </div>
            </div>
            <div className="space-y-3 px-2">
              {(data?.pieData || []).map((entry: any, index: number) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    <span className="text-sm font-semibold text-slate-600">{entry.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, color }: any) {
  return (
    <Card className="border-none shadow-sm rounded-[24px] p-6 bg-white group hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
          {React.cloneElement(icon, { className: "w-6 h-6" })}
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-slate-800 mt-1">{value}</h3>
        </div>
      </div>
    </Card>
  );
}