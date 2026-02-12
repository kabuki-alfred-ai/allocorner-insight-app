import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useParams, useLocation } from "react-router-dom";
import { useProject } from "@/hooks/use-projects";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function Layout() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId || "");
  const { user } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();
  
  // Find the current page title from the path
  const getPageTitle = () => {
    const segments = location.pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    
    // Mapping of path segments to titles
    const titleMap: Record<string, string> = {
      "contexte": "Contexte",
      "verbatims": "Verbatims",
      "themes": "Analyse thématique",
      "tendances": "Synthèse & tendances",
      "emotions": "IRC & Plutchik",
      "recommandations": "Recommandations",
      "ressources": "Ressources",
      "admin": "Administration"
    };

    // If we are exactly on the project overview page
    if (lastSegment === projectId) return "Tableau de bord";
    
    return titleMap[lastSegment] || "Tableau de bord";
  };

  const pageTitle = getPageTitle();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-white">
        <header className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center px-6 sticky top-0 z-30 transition-all duration-300 shrink-0">
          <SidebarTrigger className="mr-4" />
          
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm font-black font-heading uppercase tracking-[0.2em] text-foreground truncate">
              {pageTitle}
            </h1>
            {projectId && project && (
              <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.1em] truncate">
                {project.title}
              </p>
            )}
          </div>
          
          {/* Slot for dynamic header content via portal */}
          <div id="header-portal" className="ml-auto flex items-center gap-3">
          </div>
        </header>
        <main className="flex-1 p-4 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
