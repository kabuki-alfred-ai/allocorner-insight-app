import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Theme, Message, messages, themes } from "@/lib/data";
import { Search, Filter } from "lucide-react";

interface MessageListProps {
  theme: Theme;
  onThemeSelect: (theme: Theme) => void;
}

export function MessageList({ theme, onThemeSelect }: MessageListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPositiveOnly, setShowPositiveOnly] = useState(false);
  const [showNegativeOnly, setShowNegativeOnly] = useState(false);

  // Filter messages by theme
  const themeMessages = useMemo(() => {
    return messages.filter(message => 
      message.themes.includes(theme.name)
    );
  }, [theme.name]);

  // Apply filters
  const filteredMessages = useMemo(() => {
    let filtered = themeMessages;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(message =>
        message.transcript_txt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.quote.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sentiment filters
    if (showPositiveOnly) {
      filtered = filtered.filter(message => message.emotional_load === "high");
    }
    if (showNegativeOnly) {
      filtered = filtered.filter(message => message.emotional_load === "low");
    }

    return filtered;
  }, [themeMessages, searchTerm, showPositiveOnly, showNegativeOnly]);

  const getSentimentEmoji = (load: string) => {
    switch (load) {
      case "high": return "🙂";
      case "low": return "🙁";
      default: return "😐";
    }
  };

  const getSentimentColor = (load: string) => {
    switch (load) {
      case "high": return "text-green-600";
      case "low": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Témoignages
        </h2>
        <p className="text-sm text-muted-foreground">
          {filteredMessages.length} message{filteredMessages.length > 1 ? 's' : ''} pour "{theme.name}"
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher dans les transcriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sentiment toggles */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="positive-only"
                checked={showPositiveOnly}
                onCheckedChange={(checked) => {
                  setShowPositiveOnly(checked);
                  if (checked) setShowNegativeOnly(false);
                }}
              />
              <Label htmlFor="positive-only" className="text-sm">
                🙂 Seulement positifs
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="negative-only"
                checked={showNegativeOnly}
                onCheckedChange={(checked) => {
                  setShowNegativeOnly(checked);
                  if (checked) setShowPositiveOnly(false);
                }}
              />
              <Label htmlFor="negative-only" className="text-sm">
                🙁 Seulement négatifs
              </Label>
            </div>
          </div>

          {/* Clear filters */}
          {(searchTerm || showPositiveOnly || showNegativeOnly) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setShowPositiveOnly(false);
                setShowNegativeOnly(false);
              }}
              className="w-full"
            >
              Effacer les filtres
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Messages */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Aucun message trouvé avec ces filtres
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => (
            <Card key={message.filename} className="shadow-card hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {message.filename}
                    </span>
                    <span className={`text-lg ${getSentimentColor(message.emotional_load)}`}>
                      {getSentimentEmoji(message.emotional_load)}
                    </span>
                  </div>
                </div>

                {/* Audio player component */}
                <AudioPlayer message={message} className="mb-3" />

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {message.themes.map((themeName) => {
                    const relatedTheme = themes.find(t => t.name === themeName);
                    return (
                      <Badge 
                        key={themeName} 
                        variant="outline" 
                        className="text-xs cursor-pointer hover:bg-accent transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (relatedTheme) {
                            onThemeSelect(relatedTheme);
                          }
                        }}
                      >
                        {themeName}
                      </Badge>
                    );
                  })}
                  {message.emotions.slice(0, 2).map((emotion) => (
                    <Badge key={emotion} variant="secondary" className="text-xs">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}