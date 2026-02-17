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
  Pause,
  Check,
  AlertCircle,
  Clock,
  RotateCw,
  FileAudio,
} from "lucide-react";

import {
  getMessages,
  createMessage,
  bulkUploadMessages,
  updateMessage,
  deleteMessage,
  triggerProcessing,
  retryProcessing,
  processBulk,
  retryAllFailed,
} from "@/lib/api/messages";
import type { Message, EmotionalLoad, Tone, ProcessingStatus } from "@/lib/types";

import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
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

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: "POSITIVE", label: "Positive" },
  { value: "NEGATIVE", label: "Négative" },
  { value: "NEUTRAL", label: "Neutre" },
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
  tone: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]).default("NEUTRAL"),
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

  // Multiple files upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatuses, setUploadStatuses] = useState<
    Record<string, "pending" | "uploading" | "success" | "error">
  >({});
  const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0 });
  const multipleInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch messages ──

  const messagesQuery = useQuery({
    queryKey: ["messages", projectId, page],
    queryFn: () => getMessages(projectId!, { page, limit: PAGE_LIMIT }),
    enabled: !!projectId,
    staleTime: 0, // Force refresh
    refetchInterval: (query) => {
      // Auto-refresh every 5 seconds if there are active jobs
      const hasActive = query.state.data?.data.some((m: Message) =>
        ["QUEUED", "PROCESSING"].includes(m.processingStatus)
      );
      return hasActive ? 5000 : false;
    },
  });

  const messages = messagesQuery.data?.data || [];
  const totalPages = messagesQuery.data?.totalPages || 1;

  // Calculate status counts
  const pendingCount = messages.filter((m) => m.processingStatus === "PENDING").length;
  const processingCount = messages.filter((m) =>
    ["QUEUED", "PROCESSING"].includes(m.processingStatus)
  ).length;
  const failedCount = messages.filter((m) => m.processingStatus === "FAILED").length;

  // ── Individual upload mutation ──

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => createMessage(projectId!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
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
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
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
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
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
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      toast.success("Message supprime");
      setDeletingMessage(null);
    },
    onError: (error: Error) => {
      toast.error(`Erreur de suppression : ${error.message}`);
    },
  });

  // ── Processing mutations ──

  const retryMutation = useMutation({
    mutationFn: (messageId: string) => retryProcessing(projectId!, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
      toast.success("Traitement relance");
    },
    onError: (error: Error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const processBulkMutation = useMutation({
    mutationFn: () => processBulk(projectId!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(`Erreur : ${error.message}`);
    },
  });

  const retryAllFailedMutation = useMutation({
    mutationFn: () => retryAllFailed(projectId!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(`Erreur : ${error.message}`);
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

  // Handle multiple files selection
  const handleMultipleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    setSelectedFiles(files);

    // Initialize statuses
    const statuses: Record<string, "pending"> = {};
    files.forEach((file) => {
      statuses[file.name] = "pending";
    });
    setUploadStatuses(statuses);
  };

  // Handle multiple files upload
  const handleUploadMultiple = async () => {
    const CONCURRENT_UPLOADS = 5; // 5 uploads simultaneously
    setUploadProgress({ completed: 0, total: selectedFiles.length });

    const uploadFile = async (file: File) => {
      try {
        setUploadStatuses((prev) => ({ ...prev, [file.name]: "uploading" }));

        const formData = new FormData();
        formData.append("audio", file);
        formData.append("filename", file.name);
        formData.append("speaker", ""); // Will be filled by Google
        formData.append("transcriptTxt", ""); // Will be filled by Google

        await createMessage(projectId!, formData);

        setUploadStatuses((prev) => ({ ...prev, [file.name]: "success" }));
        setUploadProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));
      } catch (error) {
        console.error(`Erreur upload ${file.name}:`, error);
        setUploadStatuses((prev) => ({ ...prev, [file.name]: "error" }));
        setUploadProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));
      }
    };

    // Upload by batch of 5
    for (let i = 0; i < selectedFiles.length; i += CONCURRENT_UPLOADS) {
      const batch = selectedFiles.slice(i, i + CONCURRENT_UPLOADS);
      await Promise.all(batch.map(uploadFile));
    }

    // Refresh the messages list
    queryClient.invalidateQueries({ queryKey: ["messages", projectId] });

    toast.success(`${uploadProgress.completed} fichiers uploades avec succes`);

    // Reset
    setSelectedFiles([]);
    setUploadStatuses({});
    if (multipleInputRef.current) multipleInputRef.current.value = "";
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

        {/* Multiple files upload */}
        <Card className="border-white/5 shadow-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="px-8 py-6 bg-muted/20 border-b border-white/5">
            <div className="flex items-center gap-2">
              <FileArchive className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-extrabold font-heading">Import Multiple</CardTitle>
            </div>
            <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-80">
              Fichiers audio illimités
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Fichiers audio (illimité)</Label>
              <Input
                ref={multipleInputRef}
                type="file"
                accept="audio/mp3,audio/wav,audio/m4a,audio/mpeg"
                multiple
                onChange={handleMultipleFilesSelect}
                className="bg-muted/30 border-white/5 rounded-xl h-11"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Sélectionnez autant de fichiers MP3, WAV ou M4A que nécessaire
              </p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {selectedFiles.length} fichier(s) sélectionné(s)
                  </p>
                  <Button
                    onClick={handleUploadMultiple}
                    disabled={uploadProgress.total > 0 && uploadProgress.completed < uploadProgress.total}
                    size="sm"
                  >
                    {uploadProgress.total > 0 && uploadProgress.completed < uploadProgress.total ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Upload en cours... {uploadProgress.completed}/{uploadProgress.total}
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Uploader tous les fichiers
                      </>
                    )}
                  </Button>
                </div>

                {/* File list with status */}
                <div className="max-h-60 overflow-y-auto border rounded-xl p-2 bg-muted/20">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between py-1.5 px-2 hover:bg-muted/30 rounded">
                      <div className="flex items-center gap-2 flex-1 truncate">
                        <FileAudio className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      {uploadStatuses[file.name] === "uploading" && (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      )}
                      {uploadStatuses[file.name] === "success" && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                      {uploadStatuses[file.name] === "error" && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Global progress bar */}
                {uploadProgress.total > 0 && (
                  <div className="space-y-1">
                    <Progress value={(uploadProgress.completed / uploadProgress.total) * 100} />
                    <p className="text-xs text-center text-muted-foreground">
                      {uploadProgress.completed} / {uploadProgress.total} fichiers uploadés
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
              <p className="text-xs font-bold text-primary/80 leading-relaxed">
                <span className="block mb-2 opacity-60 uppercase tracking-widest text-[9px]">Traitement automatique :</span>
                Les fichiers seront automatiquement traités par Google Cloud :
                <br/>• Transcription automatique
                <br/>• Détection du ton (positif/négatif/neutre)
                <br/>• Identification des intervenants (Speaker 0, Speaker 1, etc.)
              </p>
            </div>
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

        {/* Processing indicator */}
        {processingCount > 0 && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div className="flex-1">
                  <p className="font-bold text-sm">
                    Traitement en cours...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {processingCount} fichier(s) en cours de traitement
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bulk action buttons */}
        {!messagesQuery.isLoading && messages.length > 0 && (
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => processBulkMutation.mutate()}
              disabled={pendingCount === 0 || processBulkMutation.isPending}
              variant="outline"
              size="sm"
              className="rounded-xl"
            >
              <Play className="h-4 w-4 mr-2" />
              Traiter tous les fichiers en attente ({pendingCount})
            </Button>

            {failedCount > 0 && (
              <Button
                onClick={() => retryAllFailedMutation.mutate()}
                disabled={retryAllFailedMutation.isPending}
                variant="outline"
                size="sm"
                className="rounded-xl"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Réessayer les échecs ({failedCount})
              </Button>
            )}
          </div>
        )}

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
                      <th className="text-left py-6 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Statut</th>
                      <th className="text-left py-6 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Intervenant</th>
                      <th className="text-left py-6 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Durée</th>
                      <th className="text-left py-6 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">Tonalité</th>
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
                        <td className="py-4 px-4">
                          {msg.processingStatus === "PENDING" && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-none text-[10px] font-black tracking-widest">
                              <Clock className="h-3 w-3 mr-1" />
                              En attente
                            </Badge>
                          )}
                          {msg.processingStatus === "QUEUED" && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-none text-[10px] font-black tracking-widest">
                              <Clock className="h-3 w-3 mr-1" />
                              En file
                            </Badge>
                          )}
                          {msg.processingStatus === "PROCESSING" && (
                            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-none text-[10px] font-black tracking-widest">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Traitement
                            </Badge>
                          )}
                          {msg.processingStatus === "COMPLETED" && (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-none text-[10px] font-black tracking-widest">
                              <Check className="h-3 w-3 mr-1" />
                              Traité
                            </Badge>
                          )}
                          {msg.processingStatus === "FAILED" && (
                            <Badge
                              variant="outline"
                              className="bg-red-100 text-red-700 border-none text-[10px] font-black tracking-widest cursor-help"
                              title={msg.processingError || "Échec du traitement"}
                            >
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Échec
                            </Badge>
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
                              msg.tone === 'POSITIVE' ? "bg-emerald-500/10 text-emerald-500" :
                              msg.tone === 'NEGATIVE' ? "bg-red-500/10 text-red-500" :
                              "bg-gray-500/10 text-gray-500"
                            )}
                          >
                            {
                              TONE_OPTIONS.find(
                                (o) => o.value === msg.tone
                              )?.label || msg.tone
                            }
                          </Badge>
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
                            {msg.processingStatus === "FAILED" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-9 h-9 rounded-xl hover:bg-blue-500/10 hover:text-blue-500 transition-all"
                                onClick={() => retryMutation.mutate(msg.id)}
                                title={msg.processingError || "Réessayer le traitement"}
                                disabled={retryMutation.isPending}
                              >
                                <RotateCw className="h-4 w-4" />
                              </Button>
                            )}
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
      tone: "NEUTRAL",
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
        tone: message.tone || "NEUTRAL",
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
        tone: "NEUTRAL",
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
              name="tone"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Tonalité</Label>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-background/50 border-white/5">
                      <SelectValue placeholder="Sélectionnez une tonalité" />
                    </SelectTrigger>
                    <SelectContent className="border-white/5 bg-card/95 backdrop-blur-xl rounded-xl">
                      {TONE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.tone && (
                    <p className="text-[10px] font-bold text-destructive mt-1 ml-1">{form.formState.errors.tone.message}</p>
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
