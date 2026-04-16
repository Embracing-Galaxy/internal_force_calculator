import { ArrowDownUp, ChartArea } from "lucide-react";
import { Link, useLocation } from "react-router";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function AppSidebar() {
  const location = useLocation();

  const navItems = [
    { to: "/", icon: ChartArea, tooltip: "梁内力" },
    { to: "/normal-stress", icon: ArrowDownUp, tooltip: "正应力" },
  ];

  return (
    <div className="flex h-full flex-col gap-1 border-r p-2">
      <div className="flex flex-col gap-2 pt-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "justify-center rounded-lg p-2 transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
            >
              <Tooltip>
                <TooltipTrigger>
                  <Icon className="size-6" />
                </TooltipTrigger>
                <TooltipContent side="right">{item.tooltip}</TooltipContent>
              </Tooltip>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
