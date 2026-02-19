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
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-gradient-soft">
        <header className="glass-header h-16 flex items-center px-6 transition-all duration-300 shrink-0">
          <SidebarTrigger className="mr-4" />
          
          <div id="header-title" className="flex-1 min-w-0" />
          
          <div id="header-portal" className="ml-auto flex items-center gap-3">
          </div>
        </header>
        <main className="flex-1 p-8 md:p-12 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
