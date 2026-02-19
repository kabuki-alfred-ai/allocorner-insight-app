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
  const [titleNode, setTitleNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalNode(document.getElementById("header-portal"));
    setTitleNode(document.getElementById("header-title"));
  }, []);

  return (
    <>
      {/* Teleport title to the layout header */}
      {titleNode &&
        createPortal(
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm font-black uppercase tracking-[0.25em] text-foreground truncate">
              {title}
            </h1>
            {description && (
              <p className="text-[9px] font-black text-primary/30 uppercase tracking-[0.1em] truncate mt-0.5">
                {description}
              </p>
            )}
          </div>,
          titleNode
        )}

      {/* Teleport actions and badge to the layout header */}
      {portalNode &&
        createPortal(
          <div className="flex items-center gap-4">
            {badge && (
              <Badge
                variant="outline"
                className="hidden md:flex px-4 py-1.5 font-black text-[9px] uppercase tracking-[0.2em] border-primary/20 text-primary rounded-full bg-primary/[0.03] scale-90"
              >
                {badge}
              </Badge>
            )}
            {actions}
          </div>,
          portalNode
        )}

      {/* Main content vertical spacer for consistency */}
      <div className="mb-14" />
    </>
  );
}
