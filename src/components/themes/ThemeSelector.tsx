import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Theme } from "@/lib/data";

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
    <div className="space-y-3">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground mb-1">Thématiques</h2>
        <p className="text-sm text-muted-foreground">Cliquez pour explorer</p>
      </div>
      
      {sortedThemes.map((theme) => {
        const percentage = Math.round((theme.count / total) * 100);
        const isSelected = selectedTheme?.name === theme.name;
        
        return (
          <Card 
            key={theme.name} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              isSelected 
                ? `${getSelectedBackground(theme)} shadow-lg ring-1` 
                : 'hover:bg-accent/5 border-border'
            }`}
            onClick={() => onThemeSelect(theme)}
          >
            <CardContent className="p-5">
              <div className="space-y-3">
                <h3 className="font-semibold text-base leading-tight">
                  {theme.name}
                </h3>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-sm font-medium">
                    {percentage}%
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {theme.count} message{theme.count > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}