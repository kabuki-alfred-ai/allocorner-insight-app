import { useState, useMemo } from"react";
import { Badge } from"@/components/ui/badge";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Switch } from"@/components/ui/switch";
import { Label } from"@/components/ui/label";
import { AudioPlayer } from"@/components/AudioPlayer";
import type { Theme, Message } from"@/lib/types";
import { Search, Filter, Play } from "lucide-react";
import { useAudio } from "@/lib/audio-context";
import { cn } from "@/lib/utils";

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
 filtered = filtered.filter(message => message.tone ==="POSITIVE");
 }
 if (showNegativeOnly) {
 filtered = filtered.filter(message => message.tone ==="NEGATIVE");
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
 {/* Header & Filters simplified */}
 <div className="flex flex-col gap-6">
 <div className="relative w-full">
 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/40 w-4 h-4" />
 <Input
 placeholder="Rechercher dans ce thème..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="pl-9 h-10 bg-transparent border-transparent hover:bg-muted/30 focus:bg-background focus:border-input transition-all font-sans text-sm text-foreground"
 />
 </div>

 <div className="flex items-center justify-between">
 <div className="flex items-center gap-6">
 <button
 onClick={() => {
 setShowPositiveOnly(!showPositiveOnly);
 if (!showPositiveOnly) setShowNegativeOnly(false);
 }}
 className={cn(
 "text-xs font-medium font-medium transition-colors",
 showPositiveOnly ? "text-chart-positive" : "text-muted-foreground/40 hover:text-muted-foreground"
 )}
 >
 Positifs
 </button>
 <button
 onClick={() => {
 setShowNegativeOnly(!showNegativeOnly);
 if (!showNegativeOnly) setShowPositiveOnly(false);
 }}
 className={cn(
 "text-xs font-medium font-medium transition-colors",
 showNegativeOnly ? "text-chart-negative" : "text-muted-foreground/40 hover:text-muted-foreground"
 )}
 >
 Négatifs
 </button>
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
 className="h-8 px-3 text-xs font-medium font-medium text-muted-foreground/60"
 >
 Reset
 </Button>
 )}
 </div>
 </div>

 <div className="flex items-center justify-between pt-4">
 <div className="space-y-1">
 <h3 className="text-xl font-semibold tracking-tight">
 Témoignages
 </h3>
 <p className="text-xs font-medium text-muted-foreground/40 font-medium">
 {filteredMessages.length} message{filteredMessages.length > 1 ? 's' : ''}
 </p>
 </div>
 
 {filteredMessages.length > 0 && (
 <Button 
 onClick={handlePlayAll}
 className="rounded-full bg-primary text-primary-foreground text-xs font-medium h-8 px-4 gap-2 shadow-sm"
 >
 <Play className="h-3 w-3 fill-current" />
 Tout écouter
 </Button>
 )}
 </div>

 {/* Messages List - 1 column for 3-column layout compatibility */}
 <div className="flex flex-col border-t border-border/50 pt-4">
 {filteredMessages.length === 0 ? (
 <div className="bg-muted/20 border border-transparent rounded-xl p-6 py-12 text-center flex flex-col items-center justify-center">
 <div className="mb-4 relative">
 <Filter className="h-5 w-5 text-muted-foreground/30 relative z-10" />
 </div>
 <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground/40">
 Aucun résultat
 </p>
 </div>
 ) : (
 filteredMessages.map((message, index) => (
 <AudioPlayer 
 key={message.id} 
 message={message} 
 projectId={projectId} 
 index={index}
 />
 ))
 )}
 </div>
 </div>
 );
}
