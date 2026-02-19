import { Outlet, useParams, Link, useLocation } from "react-router-dom";
import { useProject } from "@/hooks/use-projects";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  FolderCog,
  ChevronRight,
} from "lucide-react";

export function AdminLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const isNewProject = projectId === "new";
  const isWorkspace = !projectId;
  const { data: project } = useProject(!projectId || isNewProject ? "" : projectId);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Main Header */}
          <header className="h-16 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center px-6 transition-all duration-300 shrink-0">
            <SidebarTrigger className="mr-4 lg:hidden" />
            
            <div id="header-title" className="flex-1 min-w-0" />

            <div className="ml-auto flex items-center gap-4">
              {/* Dynamic portal node for admin actions */}
              <div id="header-portal" className="flex items-center gap-3"></div>
              
               {!isNewProject && project && !isWorkspace && (
                <Link 
                  to={`/projects/${projectId}`}
                  className={cn(
                    buttonVariants({ variant: "default", size: "premium" }),
                    "shadow-md bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all"
                  )}
                >
                  <FolderCog className="h-3.5 w-3.5" />
                  Voir Dashboard
                </Link>
              )}
            </div>
          </header>

          <main className="flex-1 p-8 md:p-12 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default AdminLayout;
