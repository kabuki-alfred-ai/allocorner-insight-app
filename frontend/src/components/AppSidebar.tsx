import {
  Home,
  Info,
  BarChart3,
  AudioLines,
  Tags,
  TrendingUp,
  Heart,
  Target,
  Download,
  ChevronRight,
  Building2,
  ChevronDown,
  ShieldCheck
} from "lucide-react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useProjects, useProject } from "@/hooks/use-projects";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "./ui/skeleton";

const navigationItems = [
  { title: "Accueil", path: "", icon: Home },
  { title: "Contexte", path: "contexte", icon: Info },
  { title: "Verbatims", path: "verbatims", icon: AudioLines },
  { title: "Analyse thematique", path: "themes", icon: Tags },
  { title: "Synthese & tendances", path: "tendances", icon: TrendingUp },
  { title: "IRC & Plutchik", path: "emotions", icon: Heart },
  { title: "Recommandations", path: "recommandations", icon: Target },
  { title: "Ressources", path: "ressources", icon: Download },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: projects, isLoading } = useProjects();
  const { data: currentProjectDetails } = useProject(projectId || "");
  const collapsed = state === "collapsed";

  const basePath = projectId ? `/projects/${projectId}` : "/projects";
  const hasProject = !!projectId;

  // Find current project
  const currentProject = projects?.find(p => p.id === projectId);

  // Handle project switch
  const handleProjectChange = (newProjectId: string) => {
    if (newProjectId === "list") {
      navigate("/projects");
    } else {
      navigate(`/projects/${newProjectId}`);
    }
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-primary/10 text-primary font-black shadow-[0_0_20px_rgba(255,100,0,0.1)] translate-x-1"
      : "hover:bg-white/10 text-sidebar-foreground/80 hover:text-sidebar-foreground font-bold";

  return (
    <Sidebar className="z-[100] border-r border-white/5" collapsible="icon">
      <SidebarContent className="bg-sidebar-background border-none">
        <div className="flex flex-col h-full">
          {/* Sidebar Logo Header - Compacted */}
          <NavLink 
            to={user?.role === "SUPERADMIN" ? "/admin" : "/projects"} 
            className="px-4 py-4 mb-0 flex items-center justify-center border-b border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
          >
            <img 
              src="https://www.allocorner.fr/wp-content/uploads/2024/01/Logo-Allo-Corner-4.png" 
              alt="Allo Corner Logo" 
              className="h-6 w-auto object-contain transition-all duration-300 hover:scale-110 brightness-110"
            />
          </NavLink>

          {/* Project Logo */}
          {hasProject && currentProjectDetails?.logoKey && (
            <div className={cn(
              "border-b border-white/5 flex justify-center transition-all",
              collapsed ? "px-2 py-3" : "px-6 py-4"
            )}>
              <div className={cn(
                "rounded-xl bg-white p-2 shadow-sm transition-all",
                collapsed ? "w-10 h-10" : "w-16 h-16"
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

          {/* Project Selector */}
          {!collapsed && (
            <div className="px-3 py-3 border-b border-white/5">
              {isLoading ? (
                <Skeleton className="h-8 w-full rounded-lg" />
              ) : (
                <Select 
                  value={projectId || "list"} 
                  onValueChange={handleProjectChange}
                >
                  <SelectTrigger className="w-full bg-white/10 border-white/10 hover:bg-white/20 transition-colors h-8 text-xs font-bold relative z-10 rounded-lg pr-2 text-sidebar-foreground">
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <SelectValue placeholder="Sélectionner un projet">
                        {currentProject ? currentProject.title : "Mes projets"}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-card/95 backdrop-blur-xl z-[200]">
                    <SelectItem 
                      value="list" 
                      className="font-medium text-muted-foreground"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        Voir tous les projets
                      </div>
                    </SelectItem>
                    <div className="h-px bg-white/10 my-2" />
                    {projects?.map((project) => (
                      <SelectItem 
                        key={project.id} 
                        value={project.id}
                        className="font-medium"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold">{project.title}</span>
                          <span className="text-xs text-muted-foreground">{project.clientName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {/* Navigation - only show when in a project */}
          {hasProject && (
            <SidebarGroup className="flex-1 px-3">
              {!collapsed && (
                <div className="px-3 mt-4 mb-2">
                  <span className="text-[8px] uppercase tracking-[0.3em] font-black text-sidebar-foreground/80 block mb-1">
                    Navigation
                  </span>
                  <div className="h-[1px] w-4 bg-primary/50 rounded-full" />
                </div>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="w-full h-auto p-0 hover:bg-transparent">
                        <NavLink
                          to={item.path ? `${basePath}/${item.path}` : basePath}
                          end
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
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Admin Access - Prominent link in Sidebar */}
          {user?.role === "SUPERADMIN" && hasProject && (
            <div className="px-3 mb-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="w-full h-auto p-0 hover:bg-transparent">
                    <NavLink
                      to={`${basePath}/admin`}
                      className={({ isActive }) => `
                        flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-500
                        ${isActive 
                          ? "bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20" 
                          : "bg-primary/5 text-primary hover:bg-primary/10 font-bold"}
                      `}
                    >
                      <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="text-[10px] font-black uppercase tracking-widest">Administration</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          )}

          {/* Empty state when no project selected */}
          {!hasProject && !collapsed && (
            <div className="flex-1 flex items-center justify-center px-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs text-sidebar-foreground/80 font-medium">
                  Sélectionnez un projet pour commencer
                </p>
              </div>
            </div>
          )}

          {/* Sidebar Footer / User Section */}
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
