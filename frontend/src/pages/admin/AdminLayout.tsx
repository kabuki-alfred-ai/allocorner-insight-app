import { Outlet, useParams } from "react-router-dom";
import { useProject } from "@/hooks/use-projects";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { MobileHeader } from "@/components/MobileHeader";

export function AdminLayout() {
    const { projectId } = useParams<{ projectId: string }>();
    const isNewProject = projectId === "new";
    const { data: project } = useProject(!projectId || isNewProject ? "" : projectId);

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full relative bg-white">
                <AdminSidebar />
                <SidebarInset className="flex-1 flex flex-col min-w-0 bg-white">
                    <MobileHeader projectTitle={project?.title} isAdmin={true} />
                    <main className="flex-1 p-6 md:p-10 pt-20 md:pt-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <div className="max-w-7xl mx-auto">
                            <Outlet />
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}

export default AdminLayout;
