import {
 LayoutDashboard,
 FolderCog,
 MessageSquare,
 Palette,
 BarChart3,
 TrendingUp,
 Lightbulb,
 Quote,
 Layers,
 Mail,
 LogOut,
 ChevronRight,
 PlusCircle,
 Briefcase,
 UserCog,
} from"lucide-react";
import { NavLink, useParams, useLocation } from"react-router-dom";
import { useAuth } from"@/lib/auth-context";
import { useProject } from"@/hooks/use-projects";
import { Button } from"./ui/button";
import { apiClient } from"@/lib/api";
import { cn } from"@/lib/utils";

import {
 Sidebar,
 SidebarContent,
 SidebarGroup,
 SidebarGroupContent,
 SidebarMenu,
 SidebarMenuButton,
 SidebarMenuItem,
 useSidebar,
} from"@/components/ui/sidebar";

const adminMenuItems = [
 { group:"Gestion Globale", items: [
 { title:"Liste des projets", path:"/admin", icon: Briefcase },
 { title:"Nouveau projet", path:"/projects/new/admin", icon: PlusCircle },
 ]},
 { group:"Administration Projet", items: [
 { title:"Configuration", path:"", icon: FolderCog },
 { title:"Messages", path:"messages", icon: MessageSquare },
 { title:"Thèmes", path:"themes", icon: Palette },
 { title:"Métriques", path:"metriques", icon: BarChart3 },
 { title:"Tendances", path:"tendances", icon: TrendingUp },
 { title:"Recommandations", path:"recommandations", icon: Lightbulb },
 { title:"Transversal", path:"transversal", icon: Layers },
 { title:"Invitations", path:"invitations", icon: Mail },
 ]}
];

export function AdminSidebar() {
 const { state } = useSidebar();
 const { projectId } = useParams<{ projectId: string }>();
 const { user, logout } = useAuth();
 const { data: currentProjectDetails } = useProject(projectId ||"");
 const location = useLocation();
 const collapsed = state ==="collapsed";

 const isProjectSpecific = !!projectId && projectId !=="new";
 const basePath =`/projects/${projectId}/admin`;

 const getNavCls = ({ isActive }: { isActive: boolean }) =>
 isActive
 ? "bg-primary/10 text-primary font-medium"
 : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent font-medium";

 return (
 <Sidebar className="z-[100] border-none" collapsible="icon">
 <SidebarContent className="bg-sidebar border-r border-sidebar-border/50">
 <div className="flex flex-col h-full">
 {/* Sidebar Logo Header */}
 

 {/* Project Logo */}
 {isProjectSpecific && currentProjectDetails?.logoKey && (
 <div className={cn("flex justify-center transition-all",
 collapsed ?"px-2 py-3" :"px-6 py-4"
 )}>
 <div className={cn("rounded-xl bg-white p-2 transition-all shadow-sm",
 collapsed ?"w-10 h-10" :"w-16 h-16"
 )}>
 <img
 src={`${apiClient.defaults.baseURL}/storage/logo/${currentProjectDetails.logoKey}`}
 alt={currentProjectDetails.clientName}
 className="w-full h-full object-contain"
 onError={(e) => {
 (e.target as HTMLImageElement).style.display = 'none';
 }}
 />
 </div>
 </div>
 )}

 <SidebarGroup className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
 <SidebarGroupContent>
 <SidebarMenu className="space-y-6">
 {adminMenuItems.map((group, groupIdx) => {
 // Hide project-specific items if no project is selected
 if (group.group ==="Administration Projet" && !isProjectSpecific) return null;

 return (
 <div key={groupIdx} className="space-y-2">
 {!collapsed && (
 <div className="px-3 mb-2">
 <span className="text-[8px] tracking-[0.3em] font-semibold text-sidebar-foreground/80 block mb-1">
 {group.group}
 </span>
 <div className="h-[1px] w-4 bg-primary/50 rounded-full" />
 </div>
 )}
 <div className="space-y-1">
 {group.items.map((item) => {
 const isProjectItem = group.group ==="Administration Projet";
 const fullPath = isProjectItem 
 ? (item.path ==="" ? basePath :`${basePath}/${item.path}`)
 : item.path;

 return (
 <SidebarMenuItem key={item.title}>
 <SidebarMenuButton asChild className="w-full h-auto p-0 hover:bg-transparent">
 <NavLink
 to={fullPath}
 end={item.path ===""}
 className={({ isActive }) =>`
 group flex items-center gap-2.5 px-3 py-1 rounded-lg transition-all duration-300 relative
 ${getNavCls({ isActive })}`}
 >
 {({ isActive }) => (
 <>
 {isActive && (
 <div className="absolute left-0 w-1.5 h-6 bg-primary rounded-r-full" />
 )}
 <item.icon className={`h-4 w-4 flex-shrink-0 transition-all duration-300 ${isActive ? 'scale-110 text-primary' : 'group-hover:scale-110'}`} />
 {!collapsed && (
 <>
 <span className="text-xs tracking-tight font-medium">{item.title}</span>
 <ChevronRight className={`h-3 w-3 ml-auto transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
 </>
 )}
 </>
 )}
 </NavLink>
 </SidebarMenuButton>
 </SidebarMenuItem>
 );
 })}
 </div>
 </div>
 );
 })}
 </SidebarMenu>
 </SidebarGroupContent>
 </SidebarGroup>

 {/* Sidebar Footer / User Section Compacted */}
 <div className={`p-4 mt-auto border-t border-white/5 ${collapsed ? 'items-center' : ''} flex flex-col gap-3`}>
 {!collapsed && user && (
 <NavLink
 to="/profile"
 className={({ isActive }) =>`px-1 flex items-center gap-2.5 rounded-lg p-2 transition-all cursor-pointer hover:bg-white/10 ${isActive ? 'bg-primary/10' : ''}`
 }
 >
 <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium shadow-sm shadow-primary/20 flex-shrink-0">
 {user.name.charAt(0)}
 </div>
 <div className="flex flex-col min-w-0 flex-1">
 <span className="text-xs font-medium text-sidebar-foreground truncate">{user.name}</span>
 <span className="text-[9px] font-medium text-sidebar-foreground/80 truncate">
 {user.role}
 </span>
 </div>
 <UserCog className="h-3.5 w-3.5 text-sidebar-foreground/40 flex-shrink-0" />
 </NavLink>
 )}
 {collapsed && user && (
 <NavLink
 to="/profile"
 className={({ isActive }) =>`flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-sm shadow-primary/20 mx-auto transition-all ${isActive ? 'ring-2 ring-primary/40' : ''}`
 }
 >
 {user.name.charAt(0)}
 </NavLink>
 )}
 <Button
 variant="ghost"
 onClick={() => logout()}
 className={`w-full h-8 justify-start text-sidebar-foreground/90 hover:text-destructive hover:bg-destructive/10 font-medium rounded-lg transition-all duration-300 text-xs ${collapsed ? 'px-0 justify-center' : 'px-3'}`}
 >
 <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
 {!collapsed && <span>Déconnexion</span>}
 </Button>
 </div>
 </div>
 </SidebarContent>
 </Sidebar>
 );
}
