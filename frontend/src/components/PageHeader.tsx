import { Badge } from "@/components/ui/badge";
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PageHeaderProps {
  title: string;
  description?: string | ReactNode;
  badge?: string;
  actions?: ReactNode;
  icon?: ReactNode;
}

export function PageHeader({ title, description, badge, actions, icon }: PageHeaderProps) {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalNode(document.getElementById("header-portal"));
  }, []);

  return (
    <>
      {/* Teleport actions and badge to the layout header */}
      {portalNode &&
        createPortal(
          <>
            {badge && (
              <Badge
                variant="outline"
                className="hidden md:flex px-3 py-1 font-black text-[9px] uppercase tracking-widest border-primary/20 text-primary rounded-full bg-primary/5"
              >
                {badge}
              </Badge>
            )}
            {actions}
          </>,
          portalNode
        )}

      {/* Main content header - kept for description and additional context, but title is now in top bar */}
      <div className="flex flex-col gap-4 mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
        {description && (
          <div className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em] flex items-center gap-3">
            <span className="w-8 h-px bg-primary/20" />
            {description}
          </div>
        )}
      </div>
    </>
  );
}
