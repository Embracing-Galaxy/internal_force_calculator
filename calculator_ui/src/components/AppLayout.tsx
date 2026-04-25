import { Outlet } from "react-router";
import { Toaster } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppSidebar from "./AppSidebar";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <div className="flex h-screen w-screen">
          <AppSidebar />
          <Outlet />
        </div>
        <Toaster position="top-center" />
      </TooltipProvider>
    </SidebarProvider>
  );
}
