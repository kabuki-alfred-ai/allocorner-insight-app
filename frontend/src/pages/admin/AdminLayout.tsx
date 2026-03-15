import { Outlet, useParams, Link, useLocation } from"react-router-dom";
import { useProject } from"@/hooks/use-projects";
import { AdminSidebar } from"@/components/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from"@/components/ui/sidebar";
import { buttonVariants } from"@/components/ui/button";
import { cn } from"@/lib/utils";
import { 
 FolderCog,
 ChevronRight,
} from"lucide-react";

export function AdminLayout() {
 const { projectId } = useParams<{ projectId: string }>();
 const isNewProject = projectId ==="new";
 const isWorkspace = !projectId;
 const { data: project } = useProject(!projectId || isNewProject ?"" : projectId);

 return (
 <SidebarProvider>
 <div className="flex min-h-screen w-full bg-white">
 <AdminSidebar />
 
 <div className="flex-1 flex flex-col min-w-0">
 {/* Main Header */}
 

 <main className="flex-1 p-6 md:p-10 pb-20 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
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
