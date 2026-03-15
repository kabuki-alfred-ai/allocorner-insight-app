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
 <h3 className="text-xs font-medium text-muted-foreground font-medium mb-1">
 Thématiques
 </h3>
 <p className="text-sm font-semibold text-foreground tracking-tight">Focus analytique</p>
 </div>

 <div className="space-y-1 flex-1 overflow-y-auto no-scrollbar px-1 pb-12">
 {sortedThemes.map((theme) => {
 const isSelected = selectedTheme?.id === theme.id;

 return (
 <div
 key={theme.id}
 className={cn(
 "group cursor-pointer px-3 py-2.5 transition-all duration-200 rounded-lg",
 isSelected ? "bg-primary/10" : "hover:bg-muted/50"
 )}
 onClick={() => onThemeSelect(theme)}
 >
 <div className="flex items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <div 
 className={cn(
 "w-1.5 h-1.5 rounded-full transition-all duration-300",
 isSelected ? "scale-125 shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "opacity-30 group-hover:opacity-100"
 )} 
 style={{ backgroundColor: theme.color }} 
 />
 <span className={cn(
 "text-[12px] font-medium transition-colors",
 isSelected ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
 )}>
 {theme.name}
 </span>
 </div>
 <div className={cn(
 "text-[10px] font-medium tabular-nums px-1.5 py-0.5 rounded",
 isSelected ? "text-primary bg-primary/5" : "text-muted-foreground/40"
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
