import { Outlet } from "react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import AppSidebar from "./AppSidebar";

export default function AppLayout() {
    return (
        <SidebarProvider>
            <TooltipProvider>
                <div className="flex h-screen w-screen">
                    <AppSidebar />
                    <main>
                        <Outlet />
                    </main>
                </div>
                <Toaster position="top-center" />
            </TooltipProvider>
        </SidebarProvider>
    );
}