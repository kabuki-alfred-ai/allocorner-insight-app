import { useState } from "react";
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
  ChevronRight
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

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

const navigationItems = [
  { title: "Accueil", url: "/dashboard", icon: Home },
  { title: "Contexte", url: "/dashboard/contexte", icon: Info },
  { title: "Chiffres clés", url: "/dashboard/chiffres", icon: BarChart3 },
  { title: "Verbatims", url: "/dashboard/verbatims", icon: AudioLines },
  { title: "Analyse thématique", url: "/dashboard/themes", icon: Tags },
  { title: "Synthèse & tendances", url: "/dashboard/tendances", icon: TrendingUp },
  { title: "IRC & Plutchik", url: "/dashboard/emotions", icon: Heart },
  { title: "Recommandations", url: "/dashboard/recommandations", icon: Target },
  { title: "Ressources", url: "/dashboard/ressources", icon: Download },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3 py-2">
            Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                        ${getNavCls({ isActive })}
                      `}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="text-sm font-medium">{item.title}</span>
                          <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}