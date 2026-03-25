"use client";

import React, { useEffect, useState } from "react";
import { Zap, TrendingUp, AlertTriangle, ArrowRight, DollarSign, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";

export default function RecommendationsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/strategy")
            .then(res => res.json())
            .then(json => {
                if (json.success) setData(json);
                setLoading(false);
            })
            .catch(() => toast.error("Intelligence Engine Offline"));
    }, []);

    if (loading) return (
        <div className= "h-screen flex flex-col items-center justify-center gap-4 bg-white" >
        <Loader2 className="animate-spin text-indigo-600" size = { 40} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400" > Analyzing Market Patterns...</p>
                </div>
  );

    return (
        <div className= "p-4 md:p-10 max-w-7xl mx-auto space-y-10 bg-slate-50/30 min-h-screen" >
        <Toaster />

        < header className = "space-y-2" >
            <div className="inline-flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mb-2" >
                <Sparkles size={ 14 } className = "text-indigo-600" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest" > AI Intelligence Active </span>
                        </div>
                        < h1 className = "text-3xl font-black text-slate-900 tracking-tight" > Growth Recommendations </h1>
                            < p className = "text-slate-500 font-medium" > Derived from real - time database sales and inventory velocity.</p>
                                </header>

    {/* --- REAL DATA METRICS --- */ }
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" >
        <MetricBox 
          label="Dead Stock Value"
    val = {`₹${data?.stats.deadStockValue.toLocaleString()}`
}
sub = "Capital locked in unpopular items"
color = "rose"
icon = {< DollarSign />} 
        />
    < MetricBox
label = "Unpopular SKUs"
val = { data?.stats.unpopularCount }
sub = "Items requiring attention"
color = "amber"
icon = {< AlertTriangle />} 
        />
    < MetricBox
label = "Optimized Profit"
val = "+₹42,000"
sub = "Potential monthly gain"
color = "emerald"
icon = {< TrendingUp />} 
        />
    </div>

{/* --- DYNAMIC RECOMMENDATIONS --- */ }
<div className="space-y-6" >
    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1" > Top Strategic Plays </h2>

        < div className = "grid gap-6" >
            {
                data?.recommendations.map((rec: any, idx: number) => (
                    <Card key= { idx } className = "rounded-[32px] border-none shadow-sm ring-1 ring-slate-200 overflow-hidden bg-white hover:ring-indigo-500 transition-all" >
                    <CardContent className="p-0" >
                <div className="flex flex-col md:flex-row min-h-[200px]" >
                <div className={`w-full md:w-3 ${rec.urgency === 'HIGH' ? 'bg-rose-500' : 'bg-amber-500'}`} />
            <div className="p-8 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-8" >
                <div className="space-y-3" >
                    <div className="flex items-center gap-2" >
                        <span className={ `text-[9px] font-black px-2 py-0.5 rounded-md ${rec.urgency === 'HIGH' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}` }>
                            { rec.urgency } PRIORITY
                                </span>
                                < h3 className = "text-xl font-black text-slate-900" > { rec.title } </h3>
                                    </div>
                                    < p className = "text-slate-500 text-sm leading-relaxed max-w-xl" > { rec.description } </p>
                                        < div className = "flex items-center gap-2 bg-indigo-50 w-fit px-4 py-2 rounded-xl border border-indigo-100" >
                                            <ArrowRight size={ 14 } className = "text-indigo-600" />
                                                <span className="text-xs font-bold text-indigo-700 italic" > { rec.action } </span>
                                                    </div>
                                                    </div>

                                                    < div className = "w-full md:w-auto flex flex-col items-end gap-3 border-t md:border-t-0 pt-6 md:pt-0" >
                                                        <div className="text-right" >
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" > Financial Impact </p>
                                                                < p className = "text-lg font-black text-emerald-600" > { rec.impact } </p>
                                                                    </div>
                                                                    < Button className = "w-full md:w-64 bg-slate-900 hover:bg-indigo-600 rounded-2xl h-14 font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-200" >
                                                                        Deploy Strategy
                                                                            </Button>
                                                                            </div>
                                                                            </div>
                                                                            </div>
                                                                            </CardContent>
                                                                            </Card>
          ))}
</div>
    </div>

{/* --- PROFESSIONAL TIPS (STATIC BUT RELEVANT) --- */ }
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8" >
    <div className="bg-slate-900 rounded-[40px] p-10 text-white space-y-6" >
        <h4 className="text-xl font-black tracking-tight" > How to move Unpopular Products </h4>
            < ul className = "space-y-4" >
                <li className="flex gap-4 items-start text-slate-300 text-sm" >
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0" > 1 </div>
                        < span > <b>Ghost Bundling: </b> Hide unpopular items inside high-volume gift sets.</span >
                            </li>
                            < li className = "flex gap-4 items-start text-slate-300 text-sm" >
                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0" > 2 </div>
                                    < span > <b>Retargeting Focus: </b> Use customer cookies to show slow-moving stock specifically to users who browse similar high-traffic categories.</span >
                                        </li>
                                        </ul>
                                        </div>
                                        < div className = "bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm space-y-6" >
                                            <h4 className="text-xl font-black tracking-tight text-slate-900" > Ensure Maximum Profit </h4>
                                                < ul className = "space-y-4" >
                                                    <li className="flex gap-4 items-start text-slate-500 text-sm" >
                                                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold shrink-0 text-white" >✓</div>
                                                            < span > Stop discounting bestsellers.People will buy them anyway.Increase price by 3 % for extra margin.</span>
                                                                </li>
                                                                < li className = "flex gap-4 items-start text-slate-500 text-sm" >
                                                                <div className= "w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold shrink-0 text-white" >✓</div>
                                                                    < span > Cut shipping costs on low - margin products.Offer only standard delivery for these items.</span>
                                                                        </li>
                                                                        </ul>
                                                                        </div>
                                                                        </div>
                                                                        </div>
  );
}

function MetricBox({ label, val, sub, color, icon }: any) {
    const colors: any = {
        rose: "bg-rose-50 text-rose-600",
        amber: "bg-amber-50 text-amber-600",
        emerald: "bg-emerald-50 text-emerald-600",
    };
    return (
        <Card className= "rounded-[32px] border-none shadow-sm ring-1 ring-slate-200 overflow-hidden bg-white" >
        <CardContent className="p-8 flex items-center gap-6" >
            <div className={ `p-4 rounded-2xl ${colors[color]}` }> { icon } </div>
                < div >
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1" > { label } </p>
                    < h3 className = "text-2xl font-black text-slate-900 leading-none" > { val } </h3>
                        < p className = "text-[10px] font-bold text-slate-500 mt-2" > { sub } </p>
                            </div>
                            </CardContent>
                            </Card>
  );
}