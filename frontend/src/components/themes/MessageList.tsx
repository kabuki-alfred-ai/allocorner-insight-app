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
      filtered = filtered.filter(message => message.tone === "POSITIVE");
    }
    if (showNegativeOnly) {
      filtered = filtered.filter(message => message.tone === "NEGATIVE");
    }

    return filtered;
  }, [themeMessages, searchTerm, showPositiveOnly, showNegativeOnly]);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-700">
      {/* Sticky Header & Filters */}
      <div className="sticky top-0 bg-white z-20 pb-6 space-y-8">
        {/* Header */}
        <div className="px-2 pt-2">
          <h3 className="label-uppercase mb-0.5">Témoignages</h3>
          <p className="text-sm font-black text-foreground">
            {filteredMessages.length} message{filteredMessages.length > 1 ? 's' : ''} indexé{filteredMessages.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters */}
        <Card className="premium-card p-6 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/30 w-3.5 h-3.5" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-10 border-none bg-black/[0.03] rounded-xl text-sm font-medium placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-6 px-1">
            <div className="flex items-center space-x-3">
              <Switch
                id="positive-only"
                checked={showPositiveOnly}
                onCheckedChange={(checked) => {
                  setShowPositiveOnly(checked);
                  if (checked) setShowNegativeOnly(false);
                }}
                className="data-[state=checked]:bg-primary"
              />
              <Label htmlFor="positive-only" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 cursor-pointer">
                Positifs
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Switch
                id="negative-only"
                checked={showNegativeOnly}
                onCheckedChange={(checked) => {
                  setShowNegativeOnly(checked);
                  if (checked) setShowPositiveOnly(false);
                }}
                className="data-[state=checked]:bg-primary"
              />
              <Label htmlFor="negative-only" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 cursor-pointer">
                Négatifs
              </Label>
            </div>
          </div>

          {(searchTerm || showPositiveOnly || showNegativeOnly) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setShowPositiveOnly(false);
                setShowNegativeOnly(false);
              }}
              className="w-full h-8 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all"
            >
              Réinitialiser
            </Button>
          )}
        </Card>
      </div>

      {/* Messages - Scrollable content */}
      <div className="space-y-6 pt-2">
        {filteredMessages.length === 0 ? (
          <div className="premium-card p-12 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
              Aucun résultat
            </p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div key={message.id}>
               <AudioPlayer message={message} projectId={projectId} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
