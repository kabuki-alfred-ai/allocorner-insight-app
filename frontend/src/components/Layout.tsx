import { SidebarProvider, SidebarTrigger, SidebarInset } from"@/components/ui/sidebar";
import { AppSidebar } from"@/components/AppSidebar";
import { Outlet, useParams, useLocation } from"react-router-dom";
import { useProject } from"@/hooks/use-projects";
import { useAuth } from"@/lib/auth-context";
import { Button } from"@/components/ui/button";
import { useNavigate } from"react-router-dom";
import { GlobalAudioPlayer } from"./GlobalAudioPlayer";

export function Layout() {
 const { projectId } = useParams<{ projectId: string }>();
 const { data: project } = useProject(projectId ||"");
 const { user } = useAuth();
 const navigate = useNavigate();

 const location = useLocation();
 
 return (
 <SidebarProvider>
 <AppSidebar />
 <SidebarInset className="bg-muted/30">
 
 <main className="flex-1 p-6 md:p-10 pb-20 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
 <div className="max-w-7xl mx-auto">
 <Outlet />
 </div>
 </main>
 <GlobalAudioPlayer />
 </SidebarInset>
 </SidebarProvider>
 );
}
