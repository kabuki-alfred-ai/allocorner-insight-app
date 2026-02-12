import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Upload,
  FileArchive,
  Loader2,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Settings,
  AudioLines,
  Play,
  Pause
} from "lucide-react";

import {
  getMessages,
  createMessage,
  bulkUploadMessages,
  updateMessage,
  deleteMessage,
} from "@/lib/api/messages";
import type { Message, EmotionalLoad } from "@/lib/types";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
} from "@/components/ui/form";

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const PAGE_LIMIT = 50;

const EMOTIONAL_LOAD_OPTIONS: { value: EmotionalLoad; label: string }[] = [
  { value: "LOW", label: "Faible" },
  { value: "MEDIUM", label: "Moyenne" },
  { value: "HIGH", label: "Elevee" },
];

const emotionalLoadColor: Record<EmotionalLoad, string> = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-red-100 text-red-800",
};

// ──────────────────────────────────────────────
// Edit form schema
// ──────────────────────────────────────────────

const editMessageSchema = z.object({
  speaker: z.string().optional().default(""),
  transcriptTxt: z.string().optional().default(""),
  emotionalLoad: z.enum(["LOW", "MEDIUM", "HIGH"]).default("LOW"),
  quote: z.string().optional().default(""),
});

type EditMessageValues = z.infer<typeof editMessageSchema>;

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function AdminMessagesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<Message | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Upload refs
  const audioInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Individual upload state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [speaker, setSpeaker] = useState("");
  const [transcriptTxt, setTranscriptTxt] = useState("");

  // Bulk upload state
  const [zipFile, setZipFile] = useState<File | null>(null);

  // ── Fetch messages ──

  const messagesQuery = useQuery({
    queryKey: ["messages", projectId, page],
    queryFn: () => getMessages(projectId!, { page, limit: PAGE_LIMIT }),
    enabled: !!projectId,
    staleTime: 0, // Force refresh
  });

  const messages = messagesQuery.data?.data || [];
  const totalPages = messagesQuery.data?.totalPages || 1;

  // ── Individual upload mutation ──

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => createMessage(projectId!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
      toast.success("Message importe avec succes");
      setAudioFile(null);
      setSpeaker("");
      setTranscriptTxt("");
      if (audioInputRef.current) audioInputRef.current.value = "";
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de l'import : ${error.message}`);
    },
  });

  // ── Bulk upload mutation ──

  const bulkMutation = useMutation({
    mutationFn: (formData: FormData) => bulkUploadMessages(projectId!, formData),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
      toast.success(`${result.length} message(s) importe(s) avec succes`);
      setZipFile(null);
      if (zipInputRef.current) zipInputRef.current.value = "";
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de l'import en masse : ${error.message}`);
    },
  });

  // ── Update mutation ──

  const updateMutation = useMutation({
    mutationFn: ({ messageId, data }: { messageId: string; data: EditMessageValues }) =>
      updateMessage(projectId!, messageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
      toast.success("Message mis a jour");
      setEditingMessage(null);
    },
    onError: (error: Error) => {
      toast.error(`Erreur de mise a jour : ${error.message}`);
    },
  });

  // ── Delete mutation ──

  const deleteMutation = useMutation({
    mutationFn: (messageId: string) => deleteMessage(projectId!, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
      toast.success("Message supprime");
      setDeletingMessage(null);
    },
    onError: (error: Error) => {
      toast.error(`Erreur de suppression : ${error.message}`);
    },
  });

  // ── Handlers ──

  const handleIndividualUpload = useCallback(() => {
    if (!audioFile) {
      toast.error("Veuillez selectionner un fichier audio");
      return;
    }

    const formData = new FormData();
    formData.append("audio", audioFile);
    if (speaker.trim()) formData.append("speaker", speaker.trim());
    if (transcriptTxt.trim()) formData.append("transcriptTxt", transcriptTxt.trim());

    createMutation.mutate(formData);
  }, [audioFile, speaker, transcriptTxt, createMutation]);

  const handleBulkUpload = useCallback(() => {
    if (!zipFile) {
      toast.error("Veuillez selectionner un fichier ZIP");
      return;
    }

    const formData = new FormData();
    formData.append("zip", zipFile);

    bulkMutation.mutate(formData);
  }, [zipFile, bulkMutation]);

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAudioFile(file);
  };

  const handleZipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setZipFile(file);
  };

  const formatDuration = (seconds: number | null): string => {
    if (seconds === null || seconds === undefined) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get audio URL for a message
  const getAudioUrl = (messageId: string) => {
    const token = localStorage.getItem("access_token");
    const baseUrl = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/storage/audio/${projectId}/${messageId}/stream`;
    return token ? `${baseUrl}?token=${token}` : baseUrl;
  };

  // Handle play/pause audio
  const handlePlayAudio = (messageId: string) => {
    if (playingMessageId === messageId) {
      audioRef.current?.pause();
      setPlayingMessageId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(getAudioUrl(messageId));
      audioRef.current = audio;
      audio.play().catch(() => {
        toast.error("Erreur lors de la lecture de l'audio");
      });
      audio.onended = () => setPlayingMessageId(null);
      audio.onerror = () => {
        toast.error("Erreur lors du chargement de l'audio");
        setPlayingMessageId(null);
      };
      setPlayingMessageId(messageId);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="Gestion des Verbatims"
        description="Administration et import des données audio pour ce projet"
        icon={<AudioLines className="h-6 w-6" />}
        actions={
          <Button
            variant="outline"
            size="action"
            onClick={() => navigate(`/projects/${projectId}/admin`)}
            className="border-primary/10 text-primary hover:bg-primary/5"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
        }
      />

      <div className="grid gap-12 md:grid-cols-2 mt-12">
        {/* Individual upload */}
        <Card className="border-white/5 shadow-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="px-8 py-6 bg-muted/20 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-extrabold font-heading">Import individuel</CardTitle>
            </div>
            <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-80">
              Format MP3, WAV ou M4A
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Fichier audio *</Label>
              <Input
                ref={audioInputRef}
                type="file"
                accept=".mp3,.wav,.m4a"
                onChange={handleAudioFileChange}
                className="bg-muted/30 border-white/5 rounded-xl h-11"
              />
              {audioFile && (
                <p className="text-[10px] font-bold text-primary mt-1">
                  {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} Mo)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Intervenant</Label>
              <Input
                placeholder="Nom de l'intervenant"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                className="bg-muted/30 border-white/5 rounded-xl h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Transcription</Label>
              <Textarea
                placeholder="Transcription du message (optionnel)"
                value={transcriptTxt}
                onChange={(e) => setTranscriptTxt(e.target.value)}
                rows={3}
                className="bg-muted/30 border-white/5 rounded-xl"
              />
            </div>

            <Button
              onClick={handleIndividualUpload}
              disabled={!audioFile || createMutation.isPending}
              size="action"
              className="w-full shadow-lg shadow-primary/20"
            >
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Importer le message
            </Button>
          </CardContent>
        </Card>

        {/* Bulk upload */}
        <Card className="border-white/5 shadow-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="px-8 py-6 bg-muted/20 border-b border-white/5">
            <div className="flex items-center gap-2">
              <FileArchive className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-extrabold font-heading">Import en masse</CardTitle>
            </div>
            <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-80">
              Fichier ZIP compressé
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Fichier ZIP *</Label>
              <Input
                ref={zipInputRef}
                type="file"
                accept=".zip"
                onChange={handleZipFileChange}
                className="bg-muted/30 border-white/5 rounded-xl h-11"
              />
              {zipFile && (
                <p className="text-[10px] font-bold text-primary mt-1">
                  {zipFile.name} ({(zipFile.size / 1024 / 1024).toFixed(2)} Mo)
                </p>
              )}
            </div>

            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
              <p className="text-xs font-bold text-primary/80 leading-relaxed">
                <span className="block mb-2 opacity-60 uppercase tracking-widest text-[9px]">Format attendu :</span>
                Le ZIP doit contenir :
                <br/>• Des fichiers audio nommés <code className="bg-primary/10 px-1 py-0.5 rounded">1.mp3</code>, <code className="bg-primary/10 px-1 py-0.5 rounded">2.mp3</code>, etc.
                <br/>• Un fichier <code className="bg-primary/10 px-1 py-0.5 rounded">data.csv</code> avec 3 colonnes : filename, transcript, speaker
              </p>
            </div>

            <Button
              onClick={handleBulkUpload}
              disabled={!zipFile || bulkMutation.isPending}
              size="action"
              className="w-full shadow-lg shadow-primary/20"
            >
              {bulkMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Importer la bibliothèque
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Messages list */}
      <div className="mt-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black font-heading">
              Verbatimothèque
            </h3>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">
              {messagesQuery.data?.total || 0} messages importés au total 
              {messagesQuery.data?.totalPages && messagesQuery.data.totalPages > 1 && 
                ` (Page ${page}/${messagesQuery.data.totalPages})`
              }
            </p>
          </div>
        </div>

        {messagesQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Aucun message pour ce projet. Importez des fichiers audio ci-dessus.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Table */}
            <div className="rounded-[2rem] border border-white/5 overflow-hidden shadow-sm bg-card backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-white/5">
                      <th className="text-left py-6 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 w-16">Audio</th>
                      <th className="text-left py-6 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Fichier</th>
                      <th className="text-left py-6 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Intervenant</th>
                      <th className="text-left py-6 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Durée</th>
                      <th className="text-left py-6 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Charge Émotionnelle</th>
                      <th className="text-left py-6 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Themes</th>
                      <th className="text-right py-6 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {messages.map((msg) => (
                      <tr key={msg.id} className="group hover:bg-primary/[0.02] transition-colors">
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "w-10 h-10 rounded-xl transition-all",
                              playingMessageId === msg.id 
                                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                                : "hover:bg-primary/10 hover:text-primary"
                            )}
                            onClick={() => handlePlayAudio(msg.id)}
                            title={playingMessageId === msg.id ? "Pause" : "Lecture"}
                          >
                            {playingMessageId === msg.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4 ml-0.5" />
                            )}
                          </Button>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-extrabold font-heading text-sm transition-colors group-hover:text-primary">
                            {msg.filename}
                          </span>
                          {msg.transcriptTxt && (
                            <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-1 max-w-[200px]">
                              {msg.transcriptTxt}
                            </p>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-muted-foreground/80">
                          {msg.speaker || "-"}
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-muted-foreground/80">
                          {formatDuration(msg.duration)}
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border-none",
                              msg.emotionalLoad === 'HIGH' ? "bg-red-500/10 text-red-500" :
                              msg.emotionalLoad === 'MEDIUM' ? "bg-amber-500/10 text-amber-500" :
                              "bg-emerald-500/10 text-emerald-500"
                            )}
                          >
                            {
                              EMOTIONAL_LOAD_OPTIONS.find(
                                (o) => o.value === msg.emotionalLoad
                              )?.label || msg.emotionalLoad
                            }
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-black tracking-widest font-heading">
                            {msg.messageThemes?.length || 0}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-9 h-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                              onClick={() => setEditingMessage(msg)}
                              title="Modifier"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-9 h-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                              onClick={() => setDeletingMessage(msg)}
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {(messagesQuery.data?.totalPages || 1) > 1 && (
              <div className="flex items-center justify-between mt-8 px-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Page <span className="text-primary">{page}</span> sur {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="h-10 rounded-xl border-white/5 bg-card px-4 font-bold text-[10px] uppercase tracking-widest"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= (messagesQuery.data?.totalPages || 1)}
                    onClick={() => {
                      setPage((p) => Math.min(messagesQuery.data?.totalPages || 1, p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="h-10 rounded-xl border-white/5 bg-card px-4 font-bold text-[10px] uppercase tracking-widest"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit dialog */}
      <EditMessageDialog
        message={editingMessage}
        isOpen={!!editingMessage}
        onClose={() => setEditingMessage(null)}
        onSave={(data) => {
          if (editingMessage) {
            updateMutation.mutate({ messageId: editingMessage.id, data });
          }
        }}
        isPending={updateMutation.isPending}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deletingMessage}
        onOpenChange={(open) => {
          if (!open) setDeletingMessage(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Etes-vous sur de vouloir supprimer le message{" "}
              <span className="font-medium">{deletingMessage?.filename}</span> ?
              Cette action est irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingMessage(null)}
              disabled={deleteMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingMessage) deleteMutation.mutate(deletingMessage.id);
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ──────────────────────────────────────────────
// Edit Message Dialog (sub-component)
// ──────────────────────────────────────────────

interface EditMessageDialogProps {
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditMessageValues) => void;
  isPending: boolean;
}

function EditMessageDialog({
  message,
  isOpen,
  onClose,
  onSave,
  isPending,
}: EditMessageDialogProps) {
  const form = useForm<EditMessageValues>({
    resolver: zodResolver(editMessageSchema),
    defaultValues: {
      speaker: "",
      transcriptTxt: "",
      emotionalLoad: "LOW",
      quote: "",
    },
  });

  // Reset form values when a different message is opened for editing
  useEffect(() => {
    if (message && isOpen) {
      form.reset({
        speaker: message.speaker || "",
        transcriptTxt: message.transcriptTxt || "",
        emotionalLoad: message.emotionalLoad || "LOW",
        quote: message.quote || "",
      });
    }
  }, [message, isOpen, form]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset({
        speaker: "",
        transcriptTxt: "",
        emotionalLoad: "LOW",
        quote: "",
      });
      onClose();
    }
  };

  const handleSubmit = (data: EditMessageValues) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl border-white/5 bg-card/95 backdrop-blur-xl rounded-[2.5rem] p-0 overflow-hidden">
        <div className="p-10">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-black font-heading">Modifier le verbatim</DialogTitle>
            <DialogDescription className="text-xs font-bold text-primary uppercase tracking-widest mt-1">
              Ref: {message?.filename || ""}
            </DialogDescription>
          </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="speaker"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Intervenant</Label>
                  <Input 
                    placeholder="Nom de l'intervenant" 
                    className="h-11 rounded-xl bg-background/50 border-white/5"
                    {...field} 
                  />
                  {form.formState.errors.speaker && (
                    <p className="text-[10px] font-bold text-destructive mt-1 ml-1">{form.formState.errors.speaker.message}</p>
                  )}
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="transcriptTxt"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Transcription complète</Label>
                  <Textarea
                    placeholder="Texte intégral de la transcription"
                    rows={5}
                    className="rounded-xl bg-background/50 border-white/5 resize-none"
                    {...field}
                  />
                  {form.formState.errors.transcriptTxt && (
                    <p className="text-[10px] font-bold text-destructive mt-1 ml-1">{form.formState.errors.transcriptTxt.message}</p>
                  )}
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="emotionalLoad"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Charge émotionnelle</Label>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background/50 border-white/5">
                      <SelectValue placeholder="Sélectionnez un niveau" />
                    </SelectTrigger>
                    <SelectContent className="border-white/5 bg-card/95 backdrop-blur-xl rounded-xl">
                      {EMOTIONAL_LOAD_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.emotionalLoad && (
                    <p className="text-[10px] font-bold text-destructive mt-1 ml-1">{form.formState.errors.emotionalLoad.message}</p>
                  )}
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="quote"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Verbatim Totem (Citation)</Label>
                  <Textarea
                    placeholder="Citation marquante extraite du message"
                    rows={2}
                    className="rounded-xl bg-background/50 border-white/5 resize-none font-bold text-primary italic"
                    {...field}
                  />
                  {form.formState.errors.quote && (
                    <p className="text-[10px] font-bold text-destructive mt-1 ml-1">{form.formState.errors.quote.message}</p>
                  )}
                </div>
              )}
            />

            <DialogFooter className="mt-10 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="h-12 rounded-xl border-white/10 font-bold text-[10px] uppercase tracking-widest px-8"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="h-12 rounded-xl shadow-lg shadow-primary/20 font-black text-xs uppercase tracking-widest px-10"
              >
                {isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Enregistrer les modifications
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </div>
    </DialogContent>
  </Dialog>
);
}

export default AdminMessagesPage;
