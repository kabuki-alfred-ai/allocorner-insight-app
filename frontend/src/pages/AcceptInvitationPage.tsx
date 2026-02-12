import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import {
  validateInvitation,
  acceptInvitation,
} from "@/lib/api/invitations";
import type { Invitation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// ──────────────────────────────────────────────
// Validation schema
// ──────────────────────────────────────────────

const acceptSchema = z
  .object({
    name: z.string().min(1, "Nom requis"),
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caracteres"),
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type AcceptFormValues = z.infer<typeof acceptSchema>;

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [validating, setValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const form = useForm<AcceptFormValues>({
    resolver: zodResolver(acceptSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setValidationError("Lien d'invitation invalide.");
      setValidating(false);
      return;
    }

    validateInvitation(token)
      .then((data) => {
        setInvitation(data);
        // Pre-fill email from the invitation
        form.setValue("email", data.email);
      })
      .catch((error: unknown) => {
        const axiosError = error as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (axiosError?.response?.status === 410) {
          setValidationError("Cette invitation a expire.");
        } else if (axiosError?.response?.status === 404) {
          setValidationError("Invitation introuvable.");
        } else {
          setValidationError(
            axiosError?.response?.data?.message ||
              "Impossible de valider cette invitation.",
          );
        }
      })
      .finally(() => {
        setValidating(false);
      });
  }, [token, form]);

  const onSubmit = async (values: AcceptFormValues) => {
    if (!token) return;

    try {
      await acceptInvitation(token, {
        email: values.email,
        password: values.password,
        name: values.name,
      });
      toast.success("Compte cree avec succes ! Vous pouvez maintenant vous connecter.");
      navigate("/login", { replace: true });
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const message =
        axiosError?.response?.data?.message ||
        "Une erreur est survenue. Veuillez reessayer.";
      toast.error(message);
    }
  };

  // Loading state while validating token
  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-analytics flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Validation de l'invitation...
          </p>
        </div>
      </div>
    );
  }

  // Error state -- invalid or expired token
  if (validationError) {
    return (
      <div className="min-h-screen bg-gradient-analytics flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-elevated">
          <CardHeader className="text-center space-y-4">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-destructive/10 text-destructive">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Invitation invalide
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  {validationError}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Button asChild variant="outline">
              <Link to="/login">Retour a la connexion</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-analytics flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="flex flex-col items-center gap-3">
            <Badge className="h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold bg-primary text-primary-foreground">
              AC
            </Badge>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Creer votre compte
              </h1>
              {invitation && (
                <p className="text-sm text-muted-foreground mt-2">
                  Vous avez ete invite au projet :{" "}
                  <span className="font-medium text-foreground">
                    {invitation.projectId}
                  </span>
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        disabled
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Votre nom complet"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Minimum 8 caracteres"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirmez votre mot de passe"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creation en cours...
                  </>
                ) : (
                  "Creer mon compte"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Deja un compte ? Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AcceptInvitationPage;
