import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { Theme } from "@/lib/data";

interface ThemeSynthesisProps {
  theme: Theme;
}

export function ThemeSynthesis({ theme }: ThemeSynthesisProps) {
  // Simulated IRC score
  const ircScore = 66;
  
  // Simulated keywords
  const keywords = [
    { word: "patrimoine", size: "text-2xl" },
    { word: "histoire", size: "text-lg" },
    { word: "culture", size: "text-xl" },
    { word: "tradition", size: "text-base" },
    { word: "identité", size: "text-lg" },
    { word: "mémoire", size: "text-base" },
    { word: "territoire", size: "text-xl" },
    { word: "appartenance", size: "text-base" }
  ];

  const getIrcLabel = (score: number) => {
    if (score >= 70) return "Score élevé";
    if (score >= 40) return "Score moyen";
    return "Score faible";
  };

  const getIrcColor = (score: number) => {
    if (score >= 70) return "#10B981"; // green
    if (score >= 40) return "#F59E0B"; // yellow
    return "#EF4444"; // red
  };

  return (
    <div className="space-y-6">
      {/* Theme header */}
      <div className="flex items-center gap-3">
        <span 
          className="w-4 h-4 rounded-full" 
          style={{ backgroundColor: theme.color }}
        />
        <h2 className="text-xl font-semibold text-foreground">{theme.name}</h2>
      </div>

      {/* IRC Gauge and Word Cloud side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IRC Gauge */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Indice IRC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              {/* Semi-circle gauge */}
              <div className="relative w-32 h-16 mb-4">
                <svg 
                  viewBox="0 0 100 50" 
                  className="w-full h-full"
                  style={{ transform: 'rotate(0deg)' }}
                >
                  {/* Background arc */}
                  <path
                    d="M 10 40 A 30 30 0 0 1 90 40"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Progress arc */}
                  <path
                    d="M 10 40 A 30 30 0 0 1 90 40"
                    stroke={getIrcColor(ircScore)}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(ircScore / 100) * 125.66} 125.66`}
                    style={{ 
                      transition: 'stroke-dasharray 0.3s ease-in-out'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-foreground">
                    {ircScore}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {getIrcLabel(ircScore)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Word cloud */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Mots-clés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 items-center justify-center p-2">
              {keywords.map((keyword) => (
                <span
                  key={keyword.word}
                  className={`${keyword.size} font-medium text-muted-foreground hover:text-foreground transition-colors cursor-default`}
                  style={{ color: `${theme.color}80` }}
                >
                  {keyword.word}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary card */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Synthèse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-2">Résumé</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ce thème révèle un fort attachement des participants à leur patrimoine local. 
              Les témoignages expriment une fierté territoriale marquée et un sentiment d'appartenance profond.
            </p>
          </div>
          
          <div className="border-l-4 border-primary pl-4 bg-muted/30 py-3 rounded-r">
            <h4 className="font-medium text-foreground mb-2">Extrait représentatif</h4>
            <p className="text-sm italic text-muted-foreground">
              {theme.extract || "« C'est notre histoire, notre identité, ce qui fait que nous sommes fiers d'être d'ici. »"}
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}