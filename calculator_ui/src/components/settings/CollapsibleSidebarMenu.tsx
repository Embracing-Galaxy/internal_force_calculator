import { LucideIcon } from 'lucide-react';
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
} from '@/components/ui/sidebar.tsx';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible.tsx';
import { ChevronRight } from 'lucide-react';

interface CollapsibleSidebarMenuProps {
    icon: LucideIcon;
    title: string;
    children: React.ReactNode;
}

export function CollapsibleSidebarMenu({ icon: Icon, title, children }: CollapsibleSidebarMenuProps) {
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
                        <SidebarMenuSub>
                            {children}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
        </SidebarMenu>
    );
}