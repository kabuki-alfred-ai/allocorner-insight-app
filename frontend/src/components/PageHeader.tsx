import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface PageHeaderProps {
 title: string;
 description?: string | ReactNode;
 badge?: string;
 actions?: ReactNode;
 icon?: ReactNode;
}

export function PageHeader({ title, description, badge, actions, icon }: PageHeaderProps) {
 return (
 <div className="flex flex-col gap-4 mb-6 md:mb-10 w-full pt-2">
 <div className="flex items-start justify-between w-full">
 <div className="flex items-center gap-4 flex-1 min-w-0">
 <SidebarTrigger className="md:hidden -ml-2 text-muted-foreground hover:text-foreground shrink-0" />
 {icon && <div className="text-muted-foreground/50 shrink-0 hidden sm:block">{icon}</div>}
 <div className="flex flex-col min-w-0">
 <div className="flex items-center gap-3">
 <h1 className="text-xl md:text-3xl font-semibold text-foreground tracking-tight truncate">
 {title}
 </h1>
 </div>
 {description && (
 <p className="text-sm font-medium text-muted-foreground/70 truncate mt-1">
 {description}
 </p>
 )}
 </div>
 </div>
 
 <div className="flex items-center gap-3 shrink-0 ml-4">
 {badge && (
 <Badge
 variant="outline"
 className="hidden lg:flex px-3 py-1 font-medium text-xs text-primary bg-primary/5 hover:bg-primary/10 border-transparent rounded-lg shrink-0"
 >
 {badge}
 </Badge>
 )}
 {actions}
 </div>
 </div>
 </div>
 );
}
