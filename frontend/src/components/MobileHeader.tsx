import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface MobileHeaderProps {
  projectTitle?: string;
  isAdmin?: boolean;
}

export function MobileHeader({ projectTitle, isAdmin }: MobileHeaderProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 w-full border-b border-black/[0.03] bg-white/80 backdrop-blur-xl transition-all">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src="https://www.allocorner.fr/wp-content/uploads/2024/01/Logo-Allo-Corner-4.png"
            alt="Allo Corner Logo"
            className="h-4 w-auto brightness-0"
          />
          <div className="h-3 w-[1px] bg-black/10 shrink-0" />
          <div className="flex items-center gap-1.5 min-w-0">
            {isAdmin && (
              <span className="text-[9px] font-bold text-primary/70 uppercase tracking-wider shrink-0">
                Admin
              </span>
            )}
            {projectTitle && (
              <span className="text-[10px] font-bold text-foreground/80 truncate uppercase tracking-wider">
                {projectTitle}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-9 w-9 bg-black/[0.03] hover:bg-black/[0.06] rounded-xl shrink-0"
        >
          <Menu className="h-4 w-4 text-foreground/70" />
        </Button>
      </div>
    </header>
  );
}
