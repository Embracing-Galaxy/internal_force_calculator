import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import type React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";

interface CollapsibleSidebarMenuProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}

export default function CollapsibleSidebarMenu({
  icon: Icon,
  title,
  children,
}: CollapsibleSidebarMenuProps) {
  return (
    <SidebarMenu>
      <Collapsible asChild defaultOpen={true} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={title}>
              <Icon />
              <span>{title}</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>{children}</SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  );
}
