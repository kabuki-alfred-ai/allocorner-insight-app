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
  // Simulated tonality distribution (-5 to +5)
  const tonalityData = [
    { value: -5, count: 1 },
    { value: -4, count: 0 },
    { value: -3, count: 2 },
    { value: -2, count: 1 },
    { value: -1, count: 3 },
    { value: 0, count: 5 },
    { value: 1, count: 8 },
    { value: 2, count: 12 },
    { value: 3, count: 6 },
    { value: 4, count: 3 },
    { value: 5, count: 2 }
  ];

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
    if (score >= 80) return "très positif";
    if (score >= 60) return "positif modéré";
    if (score >= 40) return "neutre";
    if (score >= 20) return "négatif modéré";
    return "très négatif";
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

      {/* Tonality histogram */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Distribution tonalité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tonalityData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="value" 
                  domain={[-5, 5]}
                  type="number"
                  ticks={[-5, -3, -1, 0, 1, 3, 5]}
                />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value: number) => [`${value} messages`, "Messages"]} />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))" 
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* IRC Gauge */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Indice IRC</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-1">
              {ircScore}
            </div>
            <p className="text-sm text-muted-foreground">
              {ircScore} = {getIrcLabel(ircScore)}
            </p>
          </div>
          <Progress value={ircScore} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </CardContent>
      </Card>

      {/* Word cloud */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Mots-clés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-center justify-center p-4">
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

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">#heritage</Badge>
            <Badge variant="outline">#fierté</Badge>
            <Badge variant="outline">#identité</Badge>
            <Badge variant="outline">#territoire</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}