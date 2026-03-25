"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Home,
  BarChart2,
  CreditCard,
  Building2, // Settlement approx
  RotateCcw,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  AirVent,
  Brain,
} from "lucide-react";

const mainItems = [
  { title: "Home", url: "/admin", icon: Home },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart2 },
  { title: "Payments", url: "/admin/orders", icon: CreditCard },
  // { title: "Settlements", url: "/admin/settlements", icon: Building2 },
  { title: "Refunds", url: "/admin/refunds", icon: RotateCcw },
  { title: "Recommendations", url: "/admin/recommendations", icon: Brain },
  { title: "Reports & Invoices", url: "/admin/reports", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-[#eef2f6] bg-white w-64 shrink-0">
      <SidebarContent className="bg-white">

        {/* Dashboard Title precisely matching screenshot */}
        <div className="h-20 flex flex-col justify-end px-6 pb-2">
          <div className="flex items-center justify-between cursor-pointer group">
            <span className="font-semibold text-lg text-[#0f172a] hover:text-[#00baf2] transition-colors">Dashboard</span>
            <ChevronUp className="w-4 h-4 text-[#00baf2]" />
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 mt-2 flex flex-col pl-2">
              {mainItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`h-11 px-6 rounded-none font-medium transition-colors hover:bg-transparent ${isActive
                        ? "text-[#00baf2] border-l-[3px] border-[#00baf2]"
                        : "text-slate-500 hover:text-slate-800 border-l-[3px] border-transparent"
                        }`}
                    >
                      <Link href={item.url} className="flex items-center w-full">
                        <item.icon className={`mr-4 h-[18px] w-[18px] ${isActive ? "text-[#00baf2]" : "text-slate-500"}`} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[15px]">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              <div className="h-6" /> {/* Spacer */}

              {/* Sub-menus styling */}
              {[
                { title: "Accept Payments" },
                { title: "Developer Settings" },
                { title: "My Services" }
              ].map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="h-11 px-6 border-l-[3px] border-transparent rounded-none font-medium text-slate-500 hover:text-slate-800 hover:bg-transparent cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[15px]">{item.title}</span>
                      <ChevronDown className="w-4 h-4 text-[#00baf2]" />
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  );
}
