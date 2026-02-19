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
import { useProject } from "@/hooks/use-projects";
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
// Helpers
// ──────────────────────────────────────────────

function FeatureItem({ icon, label, desc }: { icon: React.ReactNode; label: string; desc: string }) {
  return (
    <div className="flex gap-4 group/item">
      <div className="w-10 h-10 rounded-xl bg-white border border-input flex items-center justify-center text-muted-foreground group-hover/item:text-primary group-hover/item:border-primary/20 transition-all duration-300 flex-shrink-0 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/80 mb-0.5">{label}</p>
        <p className="text-[9px] font-bold text-muted-foreground/50 leading-relaxed uppercase tracking-widest">{desc}</p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function AdminMessagesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: project } = useProject(projectId!);

  const [page, setPage] = useState(1);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<Message | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Upload refs
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Bulk upload state
  const [zipFile, setZipFile] = useState<File | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatuses, setUploadStatuses] = useState<
    Record<string, "pending" | "uploading" | "success" | "error">
  >({});
  const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0 });
  const [isDragging, setIsDragging] = useState(false);
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



  const handleBulkUpload = useCallback(() => {
    if (!zipFile) {
      toast.error("Veuillez selectionner un fichier ZIP");
      return;
    }

    const formData = new FormData();
    formData.append("zip", zipFile);

    bulkMutation.mutate(formData);
  }, [zipFile, bulkMutation]);



  const handleZipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setZipFile(file);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.includes('audio') || 
      ['.mp3', '.wav', '.m4a'].some(ext => file.name.toLowerCase().endsWith(ext))
    );

    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      const statuses = { ...uploadStatuses };
      files.forEach(file => { statuses[file.name] = "pending"; });
      setUploadStatuses(statuses);
    }
  };

  // Handle multiple files selection
  const handleMultipleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);

    // Initialize statuses
    const statuses = { ...uploadStatuses };
    files.forEach((file) => {
      statuses[file.name] = "pending";
    });
    setUploadStatuses(statuses);
  };

  // Handle multiple files upload
  const handleUploadMultiple = async () => {
    const filesToUpload = selectedFiles.filter(f => uploadStatuses[f.name] === "pending" || uploadStatuses[f.name] === "error");
    if (filesToUpload.length === 0) return;

    const CONCURRENT_UPLOADS = 5;
    setUploadProgress({ completed: 0, total: filesToUpload.length });

    const uploadFile = async (file: File) => {
      try {
        setUploadStatuses((prev) => ({ ...prev, [file.name]: "uploading" }));

        const formData = new FormData();
        formData.append("audio", file);
        formData.append("filename", file.name);
        formData.append("speaker", ""); 
        formData.append("transcriptTxt", ""); 

        await createMessage(projectId!, formData);

        setUploadStatuses((prev) => ({ ...prev, [file.name]: "success" }));
        setUploadProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));
      } catch (error) {
        console.error(`Erreur upload ${file.name}:`, error);
        setUploadStatuses((prev) => ({ ...prev, [file.name]: "error" }));
        setUploadProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));
      }
    };

    for (let i = 0; i < filesToUpload.length; i += CONCURRENT_UPLOADS) {
      const batch = filesToUpload.slice(i, i + CONCURRENT_UPLOADS);
      await Promise.all(batch.map(uploadFile));
    }

    queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
    toast.success("Upload des fichiers terminé");
    
    // Clear only successful uploads
    setSelectedFiles(prev => prev.filter(f => uploadStatuses[f.name] !== "success"));
    if (multipleInputRef.current) multipleInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    const newStatuses = { ...uploadStatuses };
    delete newStatuses[fileToRemove.name];
    setUploadStatuses(newStatuses);
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
        title="Verbatims"
        description={project?.title}
        icon={<AudioLines className="h-6 w-6" />}
      />

      <div className="mt-8">
        <div className="adl-card p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-black tracking-tight">Import de fichiers</p>
                <p className="label-uppercase mt-0.5">{selectedFiles.length} sélectionnés</p>
              </div>
            </div>
            {selectedFiles.length > 0 && (
              <Button
                onClick={handleUploadMultiple}
                disabled={uploadProgress.total > 0 && uploadProgress.completed < uploadProgress.total}
                size="premium"
                className="bg-black text-white hover:bg-black/80 transition-all rounded-full px-8"
              >
                {uploadProgress.total > 0 && uploadProgress.completed < uploadProgress.total ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    {uploadProgress.completed}/{uploadProgress.total}
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 mr-2" />
                    Lancer l'import
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-3xl transition-all cursor-pointer",
                isDragging 
                  ? "border-primary bg-primary/[0.03]" 
                  : "border-black/[0.05] hover:border-primary/40 hover:bg-black/[0.02]"
              )}
              onClick={() => multipleInputRef.current?.click()}
            >
              <input
                ref={multipleInputRef}
                type="file"
                accept="audio/mp3,audio/wav,audio/m4a,audio/mpeg"
                multiple
                onChange={handleMultipleFilesSelect}
                className="hidden"
              />
              <Upload className="h-6 w-6 text-muted-foreground/40 mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60">
                Glisser-déposer ou cliquer
              </p>
            </div>

            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                  File d'attente
                </span>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[160px] pr-2 space-y-2 custom-scrollbar">
                {selectedFiles.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-black/[0.05] rounded-[2rem] bg-black/[0.01]">
                    <AudioLines className="h-5 w-5 text-muted-foreground/20 mb-3" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">
                      Aucun fichier en attente
                    </p>
                  </div>
                ) : (
                  selectedFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="group relative bg-black/[0.02] hover:bg-black/[0.04] border border-black/[0.05] p-3 rounded-2xl transition-all">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                            uploadStatuses[file.name] === "success" ? "bg-green-500/10 text-green-600" :
                            uploadStatuses[file.name] === "error" ? "bg-red-500/10 text-red-600" :
                            "bg-black/[0.03] text-muted-foreground"
                          )}>
                            {uploadStatuses[file.name] === "uploading" ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : uploadStatuses[file.name] === "success" ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <FileAudio className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-foreground truncate">{file.name}</p>
                            <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest mt-0.5">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>

                        {uploadStatuses[file.name] === "pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(index)}
                            className="h-7 w-7 rounded-lg text-muted-foreground/40 hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-4">
            <h3 className="label-uppercase">Bibliothèque</h3>
            <Badge variant="outline" className="text-primary border-none bg-primary/5 text-[9px] font-black uppercase px-3 rounded-full">
              {messagesQuery.data?.total || 0} Verbatims
            </Badge>
          </div>
          <div className="flex gap-2">
            {!messagesQuery.isLoading && messages.length > 0 && (
              <>
                <Button
                  onClick={() => processBulkMutation.mutate()}
                  disabled={pendingCount === 0 || processBulkMutation.isPending}
                  variant="outline"
                  size="sm"
                  className="rounded-full h-8 text-[9px] font-black uppercase tracking-widest px-4"
                >
                  Analyser ({pendingCount})
                </Button>
                {failedCount > 0 && (
                  <Button
                    onClick={() => retryAllFailedMutation.mutate()}
                    disabled={retryAllFailedMutation.isPending}
                    variant="outline"
                    size="sm"
                    className="rounded-full h-8 text-[9px] font-black uppercase tracking-widest px-4 border-red-500/20 text-red-500"
                  >
                    Réessayer ({failedCount})
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {messagesQuery.isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-2xl" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="adl-card p-12 text-center">
            <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">
              Aucun verbatim trouvé
            </p>
          </div>
        ) : (
          <>
            <div className="adl-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-black/[0.02] border-b border-black/[0.05]">
                      <th className="text-left py-3 px-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 w-12">Audio</th>
                      <th className="text-left py-3 px-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Fichier</th>
                      <th className="text-left py-3 px-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Statut</th>
                      <th className="text-left py-3 px-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Speaker</th>
                      <th className="text-left py-3 px-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Durée</th>
                      <th className="text-right py-3 px-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.03]">
                    {messages.map((msg) => (
                      <tr key={msg.id} className="group hover:bg-black/[0.01] transition-colors">
                        <td className="py-2 px-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "w-8 h-8 rounded-lg transition-all",
                              playingMessageId === msg.id 
                                ? "bg-primary text-white" 
                                : "hover:bg-primary/10 hover:text-primary text-muted-foreground/40"
                            )}
                            onClick={() => handlePlayAudio(msg.id)}
                          >
                            {playingMessageId === msg.id ? (
                              <Pause className="h-3.5 w-3.5" />
                            ) : (
                              <Play className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </td>
                        <td className="py-2 px-4">
                          <div className="max-w-[180px]">
                            <p className="font-bold text-foreground truncate">{msg.filename}</p>
                            {msg.transcriptTxt && (
                              <p className="text-[10px] text-muted-foreground/40 truncate italic">{msg.transcriptTxt}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <Badge variant="outline" className={cn(
                            "border-none text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                            msg.processingStatus === 'COMPLETED' ? "bg-green-500/5 text-green-600" :
                            msg.processingStatus === 'FAILED' ? "bg-red-500/5 text-red-600" :
                            "bg-black/5 text-muted-foreground/60"
                          )}>
                            {msg.processingStatus === 'COMPLETED' ? 'Traité' :
                             msg.processingStatus === 'FAILED' ? 'Échec' : 'En cours'}
                          </Badge>
                        </td>
                        <td className="py-2 px-4 text-[10px] font-bold text-muted-foreground/60">
                          {msg.speaker || "-"}
                        </td>
                        <td className="py-2 px-4 text-[10px] font-bold text-muted-foreground/60">
                          {formatDuration(msg.duration)}
                        </td>
                        <td className="py-2 px-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-black/[0.05]"
                              onClick={() => setEditingMessage(msg)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-7 h-7 rounded-lg text-muted-foreground/40 hover:text-red-500 hover:bg-red-50"
                              onClick={() => setDeletingMessage(msg)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {(messagesQuery.data?.totalPages || 1) > 1 && (
              <div className="flex items-center justify-between mt-6 px-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">
                  Page <span className="text-primary">{page}</span> / {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest px-3"
                  >
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    Précédent
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page >= (messagesQuery.data?.totalPages || 1)}
                    onClick={() => {
                      setPage((p) => Math.min(messagesQuery.data?.totalPages || 1, p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest px-3"
                  >
                    Suivant
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog
        open={!!deletingMessage}
        onOpenChange={(open) => {
          if (!open) setDeletingMessage(null);
        }}
      >
        <DialogContent className="border-white/5 bg-card/95 backdrop-blur-xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-black">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
              Êtes-vous sûr de vouloir supprimer <span className="text-primary">{deletingMessage?.filename}</span> ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-2">
            <Button
              variant="outline"
              onClick={() => setDeletingMessage(null)}
              disabled={deleteMutation.isPending}
              className="rounded-xl"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingMessage) deleteMutation.mutate(deletingMessage.id);
              }}
              disabled={deleteMutation.isPending}
              className="rounded-xl"
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
