"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardKPIs } from "../components/admin/DashboardKPIs";
import { DashboardCharts } from "../components/admin/charts/DashboardCharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TicketIcon, PercentCircle, AlertCircle } from "lucide-react";

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((res) => res.json())
      .then((json) => {
        // Crucial Fix: Setting state to json.data
        if (json.success) {
          setData(json.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#00baf2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Final check if data exists
  if (!data) return <div className="p-10 text-center">Failed to load data.</div>;

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-10 px-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
        <h1 className="text-2xl font-bold text-slate-900">Business Overview</h1>
        <p className="text-slate-500">Real-time performance metrics</p>
      </motion.div>

      {/* Pass the data correctly */}
      <DashboardKPIs data={data} />

      <DashboardCharts
        
      />

      <div className="grid gap-6 md:grid-cols-3 mt-2">
        {/* Support Ticket Insights */}
        <Card className="md:col-span-2 p-6 rounded-[24px] border-none shadow-sm bg-white">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TicketIcon className="w-5 h-5 text-slate-400" /> Recent Issues
          </h3>

          {data.latestIssue ? (
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="font-semibold text-slate-800">{data.latestIssue.subject}</div>
                  <div className="text-xs text-slate-500">ID: {data.latestIssue.id.slice(-6)}</div>
                </div>
              </div>
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 shadow-none border-none">
                {data.latestIssue.status}
              </Badge>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 border border-dashed rounded-xl">
              No active issues.
            </div>
          )}
        </Card>

        {/* Loan Promo */}
        <div className="rounded-[24px] bg-gradient-to-br from-[#00baf2] to-[#002970] p-6 text-white shadow-lg flex flex-col justify-between">
            <div>
              <PercentCircle className="w-8 h-8 mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-2">Grow your business!</h3>
              <p className="text-sm opacity-90">Instant loans up to ₹25L available now.</p>
            </div>
            <button className="mt-6 bg-white text-[#002970] font-bold py-2 px-4 rounded-xl w-fit">
              Apply Now
            </button>
        </div>
      </div>
    </div>
  );
}