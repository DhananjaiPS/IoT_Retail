"use client";

import React, { useEffect, useState } from "react";
import { 
  Zap, TrendingUp, AlertTriangle, ArrowRight, 
  DollarSign, Loader2, Target, Cpu, CheckCircle2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";

export default function RecommendationsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/recommendations")
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to connect to Strategy Engine");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 text-white">
      <Cpu className="animate-spin text-indigo-500" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Running Neural Market Analysis...</p>
    </div>
  );

  // Fallback if data is totally broken or API failed
  if (!data) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <AlertTriangle className="text-rose-500" size={48} />
      <p className="text-sm font-bold text-slate-500">Failed to load analytics data.</p>
      <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
    </div>
  );

  // Checking if 'plays' or 'recommendations' exists (backward compatibility with your API)
  const strategyPlays = data.plays || data.recommendations || [];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 min-h-screen bg-slate-50/30">
      <Toaster />

      {/* --- HUD HEADER --- */}
      <header className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full shadow-lg">
            <Zap size={14} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Autonomous Strategy Engine</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">COMMAND_CENTER</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Real-time DB-to-Logic Processing v2.0</p>
        </div>
        
        <div className="bg-white border border-slate-200 p-6 rounded-[32px] flex items-center gap-6 shadow-sm">
            <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Trust Score</p>
                <div className="flex gap-1 mt-1">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-1.5 w-6 bg-indigo-500 rounded-full"/>)}
                </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-200" />
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl h-12 px-8 uppercase text-[10px] tracking-widest">Sync Database</Button>
        </div>
      </header>

      {/* --- LIVE FINANCIAL METRICS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricBox 
          label="Frozen Capital (Dead Stock)"
          val={`₹${Math.round(data?.stats?.deadStockValue || 0).toLocaleString('en-IN')}`}
          sub="Calculated from zero-velocity SKUs"
          color="rose"
        />
        <MetricBox 
          label="Optimization Gain"
          val={`+₹${Math.round(data?.stats?.potentialGain || data?.stats?.potentialProfit || 0).toLocaleString('en-IN')}`}
          sub="Projected via dynamic markups"
          color="emerald"
        />
        <MetricBox 
          label="Risk Efficiency"
          val={`${Math.max(0, 100 - ((data?.stats?.atRiskCount || data?.stats?.unpopularCount || 0) * 2))}%`}
          sub="Health based on stock-to-sales"
          color="indigo"
        />
      </div>

      {/* --- THE EXECUTION STACK --- */}
      <div className="space-y-8">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
            <Target size={14}/> Targeted Strategic Plays
        </h2>

        {/* SAFE MAPPING: Checking length before mapping */}
        {strategyPlays?.length > 0 ? (
            strategyPlays.map((play: any, index: number) => (
            <Card key={play.id || index} className="rounded-[40px] border-none shadow-xl ring-1 ring-slate-200 overflow-hidden bg-white">
                <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                    <div className={`w-full lg:w-4 ${play.urgency === 'CRITICAL' || play.urgency === 'HIGH' ? 'bg-rose-600' : 'bg-indigo-600'}`} />
                    
                    <div className="p-8 md:p-12 flex-1 space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="bg-slate-100 text-slate-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                    {play.type || "STRATEGY"}
                                </span>
                                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${play.urgency === 'CRITICAL' || play.urgency === 'HIGH' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                    {play.urgency || "MEDIUM"} PRIORITY
                                </span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{play.title}</h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-2xl">{play.description}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Impact</p>
                            <p className="text-2xl font-black text-emerald-600 tracking-tighter">{play.impact}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Recommended Action</p>
                            <p className="text-sm font-black text-slate-800 leading-relaxed">{play.action}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculation / Logic</p>
                            <code className="text-xs bg-white px-4 py-3 rounded-xl border block font-mono font-bold text-slate-600">
                                {play.formula || play.reasoning || "Algorithm applied."}
                            </code>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button variant="ghost" className="font-bold text-slate-400 uppercase text-[10px] tracking-widest rounded-xl px-6 md:px-8 h-14">Dismiss</Button>
                        <Button className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl px-6 md:px-12 h-14 shadow-xl hover:bg-indigo-600 transition-all">
                            Execute via System
                        </Button>
                    </div>
                    </div>
                </div>
                </CardContent>
            </Card>
            ))
        ) : (
            <div className="p-16 text-center bg-white rounded-[40px] border border-slate-200 shadow-sm">
               <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={48} />
               <h3 className="text-xl font-black text-slate-900">System is Optimized</h3>
               <p className="text-slate-500 font-medium text-sm mt-2">No new strategic plays detected at the moment. Your inventory velocity is healthy.</p>
            </div>
        )}
      </div>
    </div>
  );
}

function MetricBox({ label, val, sub, color }: any) {
  const configs: any = {
    rose: "text-rose-600 bg-rose-50",
    emerald: "text-emerald-600 bg-emerald-50",
    indigo: "text-indigo-600 bg-indigo-50",
  };
  return (
    <Card className="rounded-[40px] border-none shadow-sm ring-1 ring-slate-100 bg-white">
      <CardContent className="p-8 md:p-10 space-y-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <h3 className={`text-3xl font-black tracking-tighter ${configs[color].split(' ')[0]}`}>{val}</h3>
        <p className="text-[10px] font-bold text-slate-500 italic uppercase tracking-wider">{sub}</p>
        <div className={`h-1.5 w-full rounded-full mt-4 ${configs[color].split(' ')[1]}`}>
            <div className={`h-full w-2/3 rounded-full ${configs[color].split(' ')[0].replace('text', 'bg')}`} />
        </div>
      </CardContent>
    </Card>
  );
}