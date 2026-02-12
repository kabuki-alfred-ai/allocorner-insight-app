import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Theme } from "@/lib/types";

interface ThemeSelectorProps {
  themes: Theme[];
  selectedTheme: Theme | null;
  onThemeSelect: (theme: Theme) => void;
  total: number;
}

export function ThemeSelector({ themes, selectedTheme, onThemeSelect, total }: ThemeSelectorProps) {
  const sortedThemes = [...themes].sort((a, b) => b.count - a.count);

  const getHashtag = (name: string) => {
    return "#" + name.toLowerCase()
      .replace(/[àâä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[îï]/g, 'i')
      .replace(/[ôö]/g, 'o')
      .replace(/[ùûü]/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  const getSelectedBackground = (theme: Theme) => {
    // Use semantic theme colors from the design system
    if (theme.color.includes('yellow') || theme.color.includes('amber')) {
      return 'bg-theme-transmission/10 border-theme-transmission/30';
    }
    if (theme.color.includes('blue') || theme.color.includes('cyan')) {
      return 'bg-theme-fierte/10 border-theme-fierte/30';
    }
    if (theme.color.includes('green') || theme.color.includes('emerald')) {
      return 'bg-theme-humour/10 border-theme-humour/30';
    }
    if (theme.color.includes('red') || theme.color.includes('rose')) {
      return 'bg-theme-centralisation/10 border-theme-centralisation/30';
    }
    if (theme.color.includes('purple') || theme.color.includes('violet')) {
      return 'bg-theme-identite/10 border-theme-identite/30';
    }
    return 'bg-muted border-border';
  };

  return (
    <div className="space-y-6">
      <div className="px-2">
        <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-0.5">Thématiques</h3>
        <p className="text-sm font-bold text-foreground">Explorer par thème</p>
      </div>

      <div className="space-y-2">
        {sortedThemes.map((theme) => {
          const isSelected = selectedTheme?.name === theme.name;

          return (
            <div
              key={theme.name}
              className={`group cursor-pointer p-4 rounded-2xl transition-all duration-300 ${
                isSelected
                  ? 'bg-primary/5 shadow-sm'
                  : 'hover:bg-black/[0.02]'
              }`}
              onClick={() => onThemeSelect(theme)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isSelected ? 'scale-125' : 'opacity-40'}`} 
                    style={{ backgroundColor: theme.color }} 
                  />
                  <span className={`text-xs font-bold transition-colors duration-300 ${isSelected ? 'text-primary' : 'text-foreground/80 group-hover:text-foreground'}`}>
                    {theme.name}
                  </span>
                </div>
                <span className="text-[10px] font-black text-muted-foreground/50">
                  {theme.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
