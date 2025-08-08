import { MetricCard } from "@/components/MetricCard";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { eventData, messages, themes } from "@/lib/data";
import { 
  Users, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  Heart,
  Download,
  Play
} from "lucide-react";

export default function Dashboard() {
  const { metrics } = eventData;
  const totalThemeCount = themes.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de la collecte {eventData.title} - {eventData.dates}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Messages vocaux"
          value={metrics.messages_count}
          subtitle="collectés"
          icon={<MessageSquare className="h-4 w-4" />}
          trend="up"
        />
        <MetricCard
          title="Durée moyenne"
          value={`${metrics.avg_duration_sec}s`}
          subtitle="par message"
          icon={<Clock className="h-4 w-4" />}
          trend="neutral"
        />
        <MetricCard
          title="Taux de participation"
          value={`${Math.round(metrics.participation_rate_estimated * 100)}%`}
          subtitle={`sur ~${eventData.participants_estimated} participants`}
          icon={<Users className="h-4 w-4" />}
          trend="up"
          badge="Estimation"
        />
        <MetricCard
          title="IRC Score"
          value={`${metrics.irc_score}/100`}
          subtitle={`Tonalité moyenne: +${metrics.tonality_avg}`}
          icon={<Heart className="h-4 w-4" />}
          trend="up"
        />
      </div>

      {/* Recent Messages Preview */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Derniers verbatims</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Aperçu des messages les plus récents
            </p>
          </div>
          <Button variant="outline" size="sm">
            Voir tous les verbatims
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.slice(0, 3).map((message) => (
            <AudioPlayer key={message.filename} message={message} />
          ))}
        </CardContent>
      </Card>

      {/* Theme Distribution */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Répartition thématique</CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribution des messages par thème principal
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {themes.map((theme) => (
              <div key={theme.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className="text-sm font-medium">{theme.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{theme.count} messages</Badge>
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        backgroundColor: theme.color,
                        width: `${(theme.count / totalThemeCount) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Download className="h-5 w-5" />
              <div className="text-center">
                <div className="font-medium">Rapport PDF</div>
                <div className="text-xs text-muted-foreground">Synthèse complète</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Play className="h-5 w-5" />
              <div className="text-center">
                <div className="font-medium">Best of audio</div>
                <div className="text-xs text-muted-foreground">Sélection d'extraits</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <TrendingUp className="h-5 w-5" />
              <div className="text-center">
                <div className="font-medium">Analyse avancée</div>
                <div className="text-xs text-muted-foreground">Insights détaillés</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}