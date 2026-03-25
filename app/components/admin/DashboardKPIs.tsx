"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export function DashboardKPIs({ data }: { data: any }) {
  // Mapping directly to the keys seen in your log: data.payments, data.refunds, etc.
  const kpis = [
    {
      title: "Total Payments",
      // Using data.payments.volume from your log
      value: `₹ ${(data?.payments?.volume || 0).toLocaleString()}`,
      subtitle: `${data?.charts?.reportData?.length || 0} active days tracked`,
      bgColor: "bg-[#eef8fc]", 
      iconColor: "text-[#6aaed0]",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-[15px] h-[15px]">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
        </svg>
      )
    },
    {
      title: "Settlement (Ready)",
      // Using data.settlements.volume from your log
      value: `₹ ${(data?.settlements?.volume || 0).toLocaleString()}`,
      subtitle: data?.settlements?.lastSettled 
        ? `Last synced: ${new Date(data.settlements.lastSettled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : "Syncing...",
      bgColor: "bg-[#edf7ee]", 
      iconColor: "text-[#7eb481]",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-[15px] h-[15px]">
          <path d="M4 10v6c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2zm2 0h12v6H6v-6zm3-5h6v1H9V5zm7 0h2v1h-2V5zm-9 0h2v1H7V5zm-5 7h2v4H2v-4zm20 0h2v4h-2v-4z" />
        </svg>
      )
    },
    {
      title: "Refunds",
      // Using data.refunds.volume and count from your log
      value: `₹ ${(data?.refunds?.volume || 0).toLocaleString()}`,
      subtitle: `${data?.refunds?.count || 0} processed successfully`,
      bgColor: "bg-[#fdedee]", 
      iconColor: "text-[#e27f82]",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-[16px] h-[16px] transform rotate-180">
          <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
        </svg>
      )
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {kpis.map((kpi, index) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card className={`border-none ${kpi.bgColor} rounded-[24px] px-[26px] py-[22px] min-h-[170px] flex flex-col justify-between shadow-none`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[15px] font-bold text-slate-700">{kpi.title}</span>
                <div className={`w-[30px] h-[30px] rounded-full bg-white flex items-center justify-center border border-white/50 ${kpi.iconColor}`}>
                  {kpi.icon}
                </div>
              </div>
              <div className="text-[34px] font-bold text-slate-900 tracking-tight flex items-center gap-1">
                {kpi.value} <span className="font-light text-[28px] opacity-80 pt-1">→</span>
              </div>
            </div>
            <div className="text-[13.5px] font-semibold text-slate-500/90 mt-2">
              {kpi.subtitle}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}