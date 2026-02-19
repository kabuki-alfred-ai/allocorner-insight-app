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
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      {/* Header & Filters in a single premium row */}
      <div className="adl-card p-4 flex flex-col xl:flex-row items-center gap-4">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-foreground/40 w-4 h-4" />
          <Input
            placeholder="Rechercher dans les témoignages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 border-none bg-black/[0.04] hover:bg-black/[0.06] rounded-full text-sm font-bold placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-primary/20 transition-all w-full"
          />
        </div>

        <div className="flex flex-wrap md:flex-nowrap items-center gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-6 px-5 py-2 bg-black/[0.02] rounded-full h-14 border border-black/[0.03] flex-1 xl:flex-none justify-center">
            <div className="flex items-center gap-3">
              <Switch
                id="positive-only"
                checked={showPositiveOnly}
                onCheckedChange={(checked) => {
                  setShowPositiveOnly(checked);
                  if (checked) setShowNegativeOnly(false);
                }}
                className="data-[state=checked]:bg-chart-positive"
              />
              <Label htmlFor="positive-only" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 cursor-pointer">
                Positifs
              </Label>
            </div>

            <div className="w-[1px] h-6 bg-black/[0.05]" />

            <div className="flex items-center gap-3">
              <Switch
                id="negative-only"
                checked={showNegativeOnly}
                onCheckedChange={(checked) => {
                  setShowNegativeOnly(checked);
                  if (checked) setShowPositiveOnly(false);
                }}
                className="data-[state=checked]:bg-chart-negative"
              />
              <Label htmlFor="negative-only" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 cursor-pointer">
                Négatifs
              </Label>
            </div>
          </div>

          {(searchTerm || showPositiveOnly || showNegativeOnly) && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                setShowPositiveOnly(false);
                setShowNegativeOnly(false);
              }}
              className="h-14 px-8 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/5 transition-all w-full xl:w-auto"
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-2 pt-4">
        <h3 className="text-2xl font-black tracking-tighter">
          Témoignages associés
        </h3>
        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[0.2em] bg-primary/5 text-primary border-none px-4 py-1.5 rounded-full">
          {filteredMessages.length} message{filteredMessages.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Messages List - Grid for desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredMessages.length === 0 ? (
          <div className="col-span-full adl-card-flat py-20 text-center flex flex-col items-center justify-center">
             <div className="p-5 bg-black/[0.02] rounded-full mb-6 relative">
               <Filter className="h-6 w-6 text-muted-foreground/30 relative z-10" />
               <div className="absolute inset-0 bg-primary/5 rounded-full scale-150 blur-xl"></div>
             </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
              Aucun résultat pour ces filtres
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
