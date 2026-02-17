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
  Briefcase
} from "lucide-react";
import { NavLink, useParams, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useProject } from "@/hooks/use-projects";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const adminMenuItems = [
  { group: "Gestion Globale", items: [
    { title: "Liste des projets", path: "/admin", icon: Briefcase },
    { title: "Nouveau projet", path: "/projects/new/admin", icon: PlusCircle },
  ]},
  { group: "Administration Projet", items: [
    { title: "Configuration", path: "", icon: FolderCog },
    { title: "Messages", path: "messages", icon: MessageSquare },
    { title: "Thèmes", path: "themes", icon: Palette },
    { title: "Métriques", path: "metriques", icon: BarChart3 },
    { title: "Tendances", path: "tendances", icon: TrendingUp },
    { title: "Recommandations", path: "recommandations", icon: Lightbulb },
    { title: "Transversal", path: "transversal", icon: Layers },
    { title: "Invitations", path: "invitations", icon: Mail },
  ]}
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const { projectId } = useParams<{ projectId: string }>();
  const { user, logout } = useAuth();
  const { data: currentProjectDetails } = useProject(projectId || "");
  const location = useLocation();
  const collapsed = state === "collapsed";

  const isProjectSpecific = !!projectId && projectId !== "new";
  const basePath = `/projects/${projectId}/admin`;

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-primary/10 text-primary font-black shadow-[0_0_20px_rgba(255,100,0,0.1)] translate-x-1"
      : "hover:bg-white/10 text-sidebar-foreground/80 hover:text-sidebar-foreground font-bold";

  return (
    <Sidebar className="z-[100] border-r border-white/5" collapsible="icon">
      <SidebarContent className="bg-sidebar-background border-none">
        <div className="flex flex-col h-full">
          {/* Sidebar Logo Header */}
          <NavLink
            to="/admin"
            className="px-4 py-4 mb-0 flex items-center justify-center border-b border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
          >
            <img
              src="https://www.allocorner.fr/wp-content/uploads/2024/01/Logo-Allo-Corner-4.png"
              alt="Allo Corner Logo"
              className="h-6 w-auto object-contain transition-all duration-300 hover:scale-110 brightness-110"
            />
          </NavLink>

          {/* Project Logo */}
          {isProjectSpecific && currentProjectDetails?.logoKey && (
            <div className={cn(
              "border-b border-white/5 flex justify-center transition-all",
              collapsed ? "px-2 py-4" : "px-6 py-6"
            )}>
              <div className={cn(
                "transition-all",
                collapsed ? "w-14 h-14" : "w-24 h-24"
              )}>
                <img
                  src={`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/storage/logo/${currentProjectDetails.logoKey}`}
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
                  if (group.group === "Administration Projet" && !isProjectSpecific) return null;

                  return (
                    <div key={groupIdx} className="space-y-2">
                       {!collapsed && (
                         <div className="px-3 mb-2">
                          <span className="text-[8px] uppercase tracking-[0.3em] font-black text-sidebar-foreground/80 block mb-1">
                            {group.group}
                          </span>
                          <div className="h-[1px] w-4 bg-primary/50 rounded-full" />
                        </div>
                      )}
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const isProjectItem = group.group === "Administration Projet";
                          const fullPath = isProjectItem 
                            ? (item.path === "" ? basePath : `${basePath}/${item.path}`)
                            : item.path;

                          return (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton asChild className="w-full h-auto p-0 hover:bg-transparent">
                                <NavLink
                                  to={fullPath}
                                  end={item.path === ""}
                                  className={({ isActive }) => `
                                    group flex items-center gap-2.5 px-3 py-1 rounded-lg transition-all duration-300 relative
                                    ${getNavCls({ isActive })}
                                  `}
                                >
                                  {({ isActive }) => (
                                    <>
                                      {isActive && (
                                        <div className="absolute left-0 w-1.5 h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(255,100,0,0.5)]" />
                                      )}
                                      <item.icon className={`h-4 w-4 flex-shrink-0 transition-all duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                      {!collapsed && (
                                        <>
                                          <span className="text-xs tracking-tight font-bold">{item.title}</span>
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
              <div className="px-1 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm shadow-primary/20">
                  {user.name.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-sidebar-foreground truncate">{user.name}</span>
                  <span className="text-[9px] font-bold text-sidebar-foreground/80 uppercase tracking-wider truncate">
                    {user.role}
                  </span>
                </div>
              </div>
            )}
            <Button 
              variant="ghost" 
              onClick={() => logout()}
              className={`w-full h-8 justify-start text-sidebar-foreground/90 hover:text-destructive hover:bg-destructive/10 font-bold rounded-lg transition-all duration-300 text-xs ${collapsed ? 'px-0 justify-center' : 'px-3'}`}
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
