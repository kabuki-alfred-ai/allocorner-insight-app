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
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              isSelected ? 'ring-2 ring-primary shadow-md' : ''
            }`}
            onClick={() => onThemeSelect(theme)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm leading-tight truncate">
                      {theme.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getHashtag(theme.name)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {percentage}% • {theme.count} msgs
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tonalité</span>
                  </div>
                  <Progress 
                    value={60 + Math.random() * 30} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}