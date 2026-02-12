import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AudioPlayer } from "@/components/AudioPlayer";
import type { Theme, Message } from "@/lib/types";
import { Search, Filter } from "lucide-react";

interface MessageListProps {
  theme: Theme;
  onThemeSelect: (theme: Theme) => void;
  messages: Message[];
  allThemes: Theme[];
  projectId: string;
}

export function MessageList({ theme, onThemeSelect, messages, allThemes, projectId }: MessageListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPositiveOnly, setShowPositiveOnly] = useState(false);
  const [showNegativeOnly, setShowNegativeOnly] = useState(false);

  // Filter messages by theme
  const themeMessages = useMemo(() => {
    return messages.filter(message =>
      (message.messageThemes?.map(mt => mt.theme.name) || []).includes(theme.name)
    );
  }, [theme.name, messages]);

  // Apply filters
  const filteredMessages = useMemo(() => {
    let filtered = themeMessages;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(message =>
        message.transcriptTxt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.quote.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sentiment filters
    if (showPositiveOnly) {
      filtered = filtered.filter(message => message.emotionalLoad === "HIGH");
    }
    if (showNegativeOnly) {
      filtered = filtered.filter(message => message.emotionalLoad === "LOW");
    }

    return filtered;
  }, [themeMessages, searchTerm, showPositiveOnly, showNegativeOnly]);

  const getSentimentEmoji = (load: string) => {
    switch (load) {
      case "HIGH": return "\u{1F642}";
      case "LOW": return "\u{1F641}";
      default: return "\u{1F610}";
    }
  };

  const getSentimentColor = (load: string) => {
    switch (load) {
      case "HIGH": return "text-green-600";
      case "LOW": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Temoignages
        </h2>
        <p className="text-sm font-medium text-muted-foreground/80">
          {filteredMessages.length} message{filteredMessages.length > 1 ? 's' : ''} pour "{theme.name}"
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 w-4 h-4" />
            <Input
              placeholder="Rechercher dans les transcriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 placeholder:text-muted-foreground/40"
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
                {"\u{1F642}"} Seulement positifs
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
                {"\u{1F641}"} Seulement negatifs
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
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Aucun message trouve avec ces filtres
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => (
            <div key={message.filename} className="space-y-4">
               {/* Audio player component - now with its own card styling */}
               <AudioPlayer message={message} projectId={projectId} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
