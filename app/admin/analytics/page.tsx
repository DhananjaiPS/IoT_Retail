"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Target, Box, CreditCard, ArrowUpRight, Calendar, ChevronDown } from "lucide-react";

const COLORS = ["#00baf2", "#002970", "#7dd3fc", "#f39bb7", "#8E2DE2"];

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState("7d"); // Filter State

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/analytics?range=${range}`);
                const json = await res.json();
                if (json.success) setData(json);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [range]); // Refetch whenever range changes

    if (loading && !data) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#00baf2] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#00baf2] font-black animate-pulse uppercase tracking-widest">Analysing Business Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto pb-20 bg-slate-50/50 min-h-screen">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Advanced Analytics</h1>
                    <p className="text-slate-500 font-medium">Real-time insights for your business growth.</p>
                </div>

                {/* Filter Dropdown */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Calendar className="w-4 h-4 text-slate-400" />
                    </div>
                    <select 
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        className="appearance-none bg-white border border-slate-200 pl-10 pr-10 py-3 rounded-2xl text-sm font-bold shadow-sm hover:border-[#00baf2] transition-all cursor-pointer outline-none focus:ring-2 ring-[#00baf2]/20"
                    >
                        <option value="today">Today's Performance</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="all">All Time Records</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Revenue" value={`₹${data?.metrics.totalVolume.toLocaleString()}`} icon={<CreditCard />} trend={data?.metrics.growth} color="text-blue-600" />
                <MetricCard title="Success Rate" value={data?.metrics.successRate} icon={<Target />} trend="Live" color="text-green-600" />
                <MetricCard title="Avg. Order" value={data?.metrics.aov} icon={<Activity />} trend="Optimized" color="text-purple-600" />
                <MetricCard title="Products" value={data?.metrics.inventoryCount} icon={<Box />} trend="Active" color="text-orange-600" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Sales Chart */}
                <Card className="lg:col-span-2 rounded-[32px] border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
                    <CardHeader className="border-b border-slate-50 pb-6">
                        <CardTitle className="text-xl font-black text-slate-800">Revenue Pulse</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px] pt-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.timelineData}>
                                <defs>
                                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00baf2" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00baf2" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="time" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '15px' }} 
                                />
                                <Area type="monotone" dataKey="amount" stroke="#00baf2" strokeWidth={4} fillOpacity={1} fill="url(#colorAmt)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card className="rounded-[32px] border-none shadow-xl shadow-slate-200/50 bg-white p-2">
                    <CardHeader>
                        <CardTitle className="text-xl font-black text-slate-800">Category Share</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.categoryData}
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={10}
                                    >
                                        {data?.categoryData.map((_: any, i: number) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3 mt-4 px-4">
                            {data?.categoryData.map((entry: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-sm font-bold">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                        <span className="text-slate-600">{entry.name}</span>
                                    </div>
                                    <span className="text-slate-900">₹{entry.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon, trend, color }: any) {
    return (
        <motion.div whileHover={{ y: -5 }}>
            <Card className="border-none shadow-lg rounded-[28px] p-6 bg-white overflow-hidden relative group">
                <div className="flex justify-between items-start relative z-10">
                    <div className={`p-4 rounded-2xl bg-slate-50 ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
                    <div className="text-[11px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                        {trend}
                    </div>
                </div>
                <div className="mt-6 relative z-10">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{value}</h3>
                </div>
                <div className="absolute -bottom-6 -right-6 opacity-[0.03] scale-[4] rotate-12 group-hover:rotate-0 transition-transform duration-700">
                    {icon}
                </div>
            </Card>
        </motion.div>
    );
}