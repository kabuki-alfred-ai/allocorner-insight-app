import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AudioPlayer } from "@/components/AudioPlayer";
import type { Theme, Message } from "@/lib/types";
import { Search, Filter, Play } from "lucide-react";
import { useAudio } from "@/lib/audio-context";

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
  const { playMessage, currentMessage, isPlaying } = useAudio();

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

  const handlePlayAll = () => {
    if (filteredMessages.length > 0) {
      playMessage(filteredMessages[0], projectId, filteredMessages);
    }
  };

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      {/* Header & Filters simplified for column layout */}
      <div className="flex flex-col gap-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/40 w-3.5 h-3.5" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 border-none bg-black/[0.04] hover:bg-black/[0.06] rounded-full text-xs font-bold placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-primary/20 transition-all w-full"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="positive-only"
                checked={showPositiveOnly}
                onCheckedChange={(checked) => {
                  setShowPositiveOnly(checked);
                  if (checked) setShowNegativeOnly(false);
                }}
                className="scale-75 data-[state=checked]:bg-chart-positive"
              />
              <Label htmlFor="positive-only" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 cursor-pointer">
                Positifs
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="negative-only"
                checked={showNegativeOnly}
                onCheckedChange={(checked) => {
                  setShowNegativeOnly(checked);
                  if (checked) setShowPositiveOnly(false);
                }}
                className="scale-75 data-[state=checked]:bg-chart-negative"
              />
              <Label htmlFor="negative-only" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 cursor-pointer">
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
              className="h-8 px-4 rounded-full text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-2 pt-4">
        <div className="space-y-1">
          <h3 className="text-2xl font-black tracking-tighter">
            Témoignages associés
          </h3>
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{filteredMessages.length} message{filteredMessages.length > 1 ? 's' : ''}</p>
        </div>
        
        {filteredMessages.length > 0 && (
          <Button 
            onClick={handlePlayAll}
            className="rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest h-9 px-5 gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Tout écouter
          </Button>
        )}
      </div>

      {/* Messages List - 1 column for 3-column layout compatibility */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMessages.length === 0 ? (
          <div className="adl-card-flat py-12 text-center flex flex-col items-center justify-center">
             <div className="p-4 bg-black/[0.02] rounded-full mb-4 relative">
               <Filter className="h-5 w-5 text-muted-foreground/30 relative z-10" />
               <div className="absolute inset-0 bg-primary/5 rounded-full scale-150 blur-xl"></div>
             </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
              Aucun résultat
            </p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div key={message.id} onClick={() => playMessage(message, projectId, filteredMessages)}>
               <AudioPlayer message={message} projectId={projectId} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
