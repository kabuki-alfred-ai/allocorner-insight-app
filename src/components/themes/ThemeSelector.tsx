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

  const getTonalityColor = (theme: Theme) => {
    // Simulated tonality based on theme color
    if (theme.color.includes('green') || theme.color.includes('emerald')) return 'bg-green-500';
    if (theme.color.includes('red') || theme.color.includes('rose')) return 'bg-red-500';
    return 'bg-gray-400';
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
                ? `ring-2 ring-primary shadow-lg ${theme.color} bg-opacity-20` 
                : 'hover:bg-accent/5'
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