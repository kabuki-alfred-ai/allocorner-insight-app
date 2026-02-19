import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Theme } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  themes: Theme[];
  selectedTheme: Theme | null;
  onThemeSelect: (theme: Theme) => void;
  total: number;
}

export function ThemeSelector({ themes, selectedTheme, onThemeSelect, total }: ThemeSelectorProps) {
  const sortedThemes = [...themes].sort((a, b) => b.count - a.count);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="px-2 shrink-0 pb-6 pt-2">
        <h3 className="label-uppercase mb-0.5">Thématiques</h3>
        <p className="text-sm font-black text-foreground">Exploration interactive</p>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar px-1 pb-12">
        {sortedThemes.map((theme) => {
          const isSelected = selectedTheme?.id === theme.id;

          return (
            <div
              key={theme.id}
              className={cn(
                "group cursor-pointer p-5 transition-all duration-500 rounded-[1.5rem] border border-transparent",
                isSelected
                  ? "bg-primary/[0.03] border-primary/10"
                  : "hover:bg-black/[0.02]"
              )}
              onClick={() => onThemeSelect(theme)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div 
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-all duration-500 shadow-sm",
                      isSelected ? "scale-110 ring-4 ring-primary/10" : "opacity-40 group-hover:opacity-100"
                    )} 
                    style={{ backgroundColor: theme.color }} 
                  />
                  <span className={cn(
                    "text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                    isSelected ? "text-primary translate-x-1" : "text-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5"
                  )}>
                    {theme.name}
                  </span>
                </div>
                <div className={cn(
                  "px-2.5 py-1 rounded-full text-[9px] font-black transition-all",
                  isSelected ? "bg-primary/10 text-primary border border-primary/10" : "bg-black/[0.03] text-muted-foreground/40 group-hover:bg-black/[0.05] border border-transparent"
                )}>
                  {theme.count}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
