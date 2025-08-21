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

  // Updated keywords with varying frequency
  const keywordsWithFreq = [
    { word: "patrimoine", frequency: 8 },
    { word: "territoire", frequency: 6 },
    { word: "culture", frequency: 5 },
    { word: "histoire", frequency: 4 },
    { word: "identité", frequency: 4 },
    { word: "appartenance", frequency: 3 },
    { word: "mémoire", frequency: 3 },
    { word: "tradition", frequency: 2 },
    { word: "communauté", frequency: 2 },
    { word: "fierté", frequency: 1 }
  ];

  const getWordSize = (frequency: number) => {
    if (frequency >= 6) return "text-2xl";
    if (frequency >= 4) return "text-xl";
    if (frequency >= 2) return "text-lg";
    return "text-base";
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Analyse du thème</h2>
      </div>

      {/* Selected theme */}
      <div className="flex items-center gap-3 mb-6">
        <span 
          className="w-5 h-5 rounded-full" 
          style={{ backgroundColor: theme.color }}
        />
        <h3 className="text-2xl font-bold text-foreground">{theme.name}</h3>
      </div>

      {/* IRC Gauge and Word Cloud in same card */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* IRC Gauge */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Indice IRC</h4>
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
                <p 
                  className="text-sm font-medium text-center"
                  style={{ color: getIrcColor(ircScore) }}
                >
                  {getIrcLabel(ircScore)}
                </p>
              </div>
            </div>

            {/* Word cloud */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Mots-clés</h4>
              <div className="flex flex-wrap gap-3 items-center justify-center">
                {keywordsWithFreq.map((keyword) => (
                  <span
                    key={keyword.word}
                    className={`${getWordSize(keyword.frequency)} font-medium hover:text-foreground transition-colors cursor-default`}
                    style={{ color: `${theme.color}cc` }}
                  >
                    {keyword.word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Summary card */}
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Synthèse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-lg">Résumé</h4>
            <p className="text-base text-muted-foreground leading-relaxed">
              Ce thème révèle un fort attachement des participants à leur patrimoine local. 
              Les témoignages expriment une fierté territoriale marquée et un sentiment d'appartenance profond 
              qui transcende les générations et unit la communauté autour de valeurs communes.
            </p>
          </div>
          
          <div className="border-l-4 border-primary pl-6 bg-muted/30 py-4 rounded-r-lg">
            <h4 className="font-semibold text-foreground mb-3 text-lg">Extrait représentatif</h4>
            <p className="text-base italic text-muted-foreground leading-relaxed">
              {theme.extract || "« C'est notre histoire, notre identité, ce qui fait que nous sommes fiers d'être d'ici. Cette terre nous a vus grandir et nous continuerons à la faire vivre. »"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}