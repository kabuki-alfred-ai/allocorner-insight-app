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
    <div className="space-y-6">
      <div className="px-2">
        <h3 className="label-uppercase mb-0.5">Thématiques</h3>
        <p className="text-sm font-black text-foreground">Exploration interactive</p>
      </div>

      <div className="space-y-2">
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
                      "w-2 h-2 rounded-full transition-all duration-500",
                      isSelected ? "scale-125 ring-4 ring-primary/5" : "opacity-30"
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
                  "px-2 py-0.5 rounded-lg text-[9px] font-black transition-all",
                  isSelected ? "bg-primary/10 text-primary" : "bg-black/[0.03] text-muted-foreground/40 group-hover:bg-black/[0.05]"
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
