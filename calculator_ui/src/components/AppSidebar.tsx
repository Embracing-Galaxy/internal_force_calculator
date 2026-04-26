import { ArrowDownUp, BadgeInfo, ChartArea, GitBranch } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import pkg from "@/../package.json";
import tauriConf from "@/../src-tauri/tauri.conf.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { to: "/", icon: ChartArea, tooltip: "梁内力" },
  { to: "/normal-stress", icon: ArrowDownUp, tooltip: "正应力" },
];

export default function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="none" className="w-fit border-r">
      <SidebarContent>
        <SidebarMenu className="items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={{
                    children: item.tooltip,
                    hidden: false,
                  }}
                  className="size-12 px-1"
                >
                  <Link to={item.to}>
                    <item.icon className="w-full! h-full!" />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <AppInfo />
      </SidebarFooter>
    </Sidebar>
  );
}

function AppInfo() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <HoverCard open={isOpen}>
      <HoverCardTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-foreground "
          onPointerDown={() => {
            setIsOpen((prev) => !prev);
          }}
        >
          <BadgeInfo className="w-full! h-full!" />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent side="right" align="end">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center">
            <h4 className="font-bold text-base leading-none tracking-tight">
              {tauriConf.productName}
            </h4>
            <div className="flex items-center gap-1.5">
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 h-4.5 font-normal rounded-md"
              >
                v{pkg.version}
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 h-4.5 font-normal rounded-md"
              >
                MIT
              </Badge>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-border/50 mt-1">
            <span className="text-[10px] text-muted-foreground">
              Copyright © 2026 Embracing-Galaxy
            </span>
            <div className="flex items-center gap-1">
              <a
                href={pkg.repository.url}
                target="_blank"
                rel="noreferrer"
                title="GitHub Repository"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-transparent px-0"
                >
                  <GitBranch className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
