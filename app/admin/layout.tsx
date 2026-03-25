import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/app/components/admin/AdminSidebar";
import { AdminHeader } from "@/app/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto bg-muted/20">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
