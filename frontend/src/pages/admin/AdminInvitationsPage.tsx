import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, XCircle, Loader2, Mail, Link2, Check, ArrowLeft, Settings, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  createInvitation,
  getInvitations,
  revokeInvitation,
} from "@/lib/api/invitations";

import type { Invitation, InvitationStatus } from "@/lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  InvitationStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "En attente",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  ACCEPTED: {
    label: "Acceptee",
    className: "bg-green-100 text-green-800 border-green-300",
  },
  EXPIRED: {
    label: "Expiree",
    className: "bg-gray-100 text-gray-600 border-gray-300",
  },
  REVOKED: {
    label: "Revoquee",
    className: "bg-red-100 text-red-800 border-red-300",
  },
};

function statusBadge(status: InvitationStatus) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminInvitationsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [createdInvitation, setCreatedInvitation] = useState<Invitation | null>(null);
  const [copied, setCopied] = useState(false);

  // -- Query -----------------------------------------------------------------

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ["invitations", projectId],
    queryFn: () => getInvitations(projectId!),
    enabled: !!projectId,
  });

  // -- Mutations -------------------------------------------------------------

  const createMutation = useMutation({
    mutationFn: (emailValue: string) =>
      createInvitation(projectId!, { email: emailValue }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["invitations", projectId] });
      toast.success("Invitation envoyee");
      setEmail("");
      setCreatedInvitation(data);
    },
    onError: () => toast.error("Erreur lors de l'envoi de l'invitation"),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revokeInvitation(projectId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations", projectId] });
      toast.success("Invitation revoquee");
    },
    onError: () => toast.error("Erreur lors de la revocation"),
  });

  // -- Handlers --------------------------------------------------------------

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("L'adresse e-mail est requise");
      return;
    }
    createMutation.mutate(trimmed);
  }

  function getInvitationLink(token: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/accept-invitation/${token}`;
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Lien copie dans le presse-papiers");
    } catch {
      toast.error("Impossible de copier le lien");
    }
  }

  // -- Render ----------------------------------------------------------------

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
       <PageHeader 
        title="Collaborateurs"
        description="Gérez les invitations et les accès des membres du projet"
        icon={<Users className="h-6 w-6" />}
      />

      <div className="mt-12 space-y-12">
        {/* Invite form */}
        <Card className="premium-card">
          <CardHeader className="px-8 pt-8 pb-4">
            <CardTitle className="text-lg font-extrabold font-heading flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Inviter un membre
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleInvite} className="flex flex-col md:flex-row items-end gap-4">
              <div className="flex-1 w-full space-y-2">
                <Label htmlFor="invite-email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Adresse e-mail</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collaborateur@exemple.fr"
                  className="h-12 rounded-xl bg-background/50 border-white/5"
                  required
                />
              </div>
              <Button 
                type="submit" 
                size="action"
                disabled={createMutation.isPending}
                className="shadow-lg shadow-primary/20"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Envoyer l'invitation
              </Button>
            </form>
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-4 ml-1">
              Une invitation par email sera envoyée. Validité: 7 jours.
            </p>
          </CardContent>
        </Card>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && invitations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Aucune invitation pour le moment.
          </CardContent>
        </Card>
      )}

      {/* Invitations list */}
      {!isLoading && invitations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invitations.map((inv) => (
            <Card key={inv.id} className="group border-white/5 shadow-sm rounded-[2rem] overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:bg-card/80">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    {statusBadge(inv.status)}
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-1 truncate">{inv.email}</h3>
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                    PIRE LE {formatDate(inv.expiresAt)}
                  </p>
                  
                  {inv.status === "PENDING" && (
                    <div className="mt-6 p-4 rounded-2xl bg-muted/30 border border-white/5">
                      <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Link2 className="h-3 w-3" />
                        Lien direct
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-[10px] bg-background/50 px-2 py-1.5 rounded-lg truncate border border-white/5 font-mono">
                          {getInvitationLink(inv.token)}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg shrink-0"
                          onClick={() => copyToClipboard(getInvitationLink(inv.token))}
                        >
                          {copied ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Link2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {inv.status === "PENDING" && (
                  <div className="mt-8 pt-6 border-t border-white/5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => revokeMutation.mutate(inv.id)}
                      disabled={revokeMutation.isPending}
                      className="w-full font-bold text-[10px] uppercase tracking-widest rounded-xl h-10 text-destructive border-destructive/20 hover:bg-destructive/5 hover:border-destructive/30"
                    >
                      {revokeMutation.isPending ? (
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 mr-2" />
                      )}
                      Révoquer l'accès
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>

      {/* Success Dialog */}
      <Dialog open={!!createdInvitation} onOpenChange={() => setCreatedInvitation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Invitation envoyee
            </DialogTitle>
            <DialogDescription>
              L'invitation a ete envoyee par email a {createdInvitation?.email}.
              Vous pouvez aussi partager ce lien directement :
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-muted px-3 py-2 rounded truncate">
                {createdInvitation && getInvitationLink(createdInvitation.token)}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => createdInvitation && copyToClipboard(getInvitationLink(createdInvitation.token))}
              >
                {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Ce lien expire le {createdInvitation && formatDate(createdInvitation.expiresAt)}.
            </p>
            <Button onClick={() => setCreatedInvitation(null)} className="w-full">
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
  );
}

export default AdminInvitationsPage;
