import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, UserCog } from "lucide-react";
import { isAxiosError } from "axios";

import { useAuth } from "@/lib/auth-context";
import { updateProfile, updatePassword } from "@/lib/api/users";
import { PageHeader } from "@/components/PageHeader";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// ──────────────────────────────────────────────
// Schemas
// ──────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  email: z.string().email("Email invalide"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z.string().min(8, "Au moins 8 caractères"),
    confirmPassword: z.string().min(8, "Au moins 8 caractères"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function ProfilePage() {
  const { user, updateUser } = useAuth();

  // ── Profile form ──

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
    },
  });

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      updateUser({ name: updatedUser.name, email: updatedUser.email });
      toast.success("Profil mis à jour avec succès");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message as string | undefined;
        if (status === 409) {
          profileForm.setError("email", {
            message: "Cet email est déjà utilisé",
          });
          return;
        }
        toast.error(message ?? "Erreur lors de la mise à jour");
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    },
  });

  // ── Password form ──

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const passwordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      passwordForm.reset();
      toast.success("Mot de passe modifié avec succès");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        const message = error.response?.data?.message as string | undefined;
        if (message?.toLowerCase().includes("current password")) {
          passwordForm.setError("currentPassword", {
            message: "Mot de passe actuel incorrect",
          });
          return;
        }
        toast.error(message ?? "Erreur lors du changement de mot de passe");
      } else {
        toast.error("Erreur lors du changement de mot de passe");
      }
    },
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Mon profil"
        description="Gérez vos informations personnelles et votre mot de passe"
        icon={<UserCog className="h-6 w-6" />}
      />

      <div className="mt-12">
        <Card className="premium-card overflow-hidden">
          <CardContent className="p-0">
            <Tabs defaultValue="info" className="w-full">
              <div className="px-10 pt-6 border-b border-white/5 bg-muted/10">
                <TabsList className="bg-transparent h-auto p-0 gap-8">
                  <TabsTrigger
                    value="info"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary transition-all"
                  >
                    Informations
                  </TabsTrigger>
                  <TabsTrigger
                    value="password"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary transition-all"
                  >
                    Mot de passe
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* ── Tab: Informations ── */}
              <TabsContent value="info" className="m-0 focus-visible:ring-0">
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit((data) =>
                      profileMutation.mutate(data),
                    )}
                  >
                    <div className="p-10 space-y-8">
                      <h3 className="label-uppercase mb-6 flex items-center gap-2 !text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Informations personnelles
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                Nom complet
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Votre nom"
                                  className="bg-muted/30 border-input font-bold"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                Adresse email
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="votre@email.com"
                                  className="bg-muted/30 border-input font-bold"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/20 border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-sm shadow-primary/20">
                          {user?.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{user?.name}</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {user?.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="px-10 py-8 bg-muted/30 border-t border-white/5 flex justify-end">
                      <Button
                        type="submit"
                        size="premium"
                        disabled={profileMutation.isPending}
                        className="shadow-xl shadow-primary/20 px-12 h-12 bg-black text-white hover:bg-black/90 font-black rounded-xl border-none"
                      >
                        {profileMutation.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Enregistrer les modifications
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              {/* ── Tab: Mot de passe ── */}
              <TabsContent value="password" className="m-0 focus-visible:ring-0">
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit((data) =>
                      passwordMutation.mutate(data),
                    )}
                  >
                    <div className="p-10 space-y-8">
                      <h3 className="label-uppercase mb-6 flex items-center gap-2 !text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Changer le mot de passe
                      </h3>

                      <div className="max-w-md space-y-6">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                Mot de passe actuel
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  className="bg-muted/30 border-input font-bold"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                Nouveau mot de passe
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  className="bg-muted/30 border-input font-bold"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                                Confirmer le nouveau mot de passe
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  className="bg-muted/30 border-input font-bold"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="px-10 py-8 bg-muted/30 border-t border-white/5 flex justify-end">
                      <Button
                        type="submit"
                        size="premium"
                        disabled={passwordMutation.isPending}
                        className="shadow-xl shadow-primary/20 px-12 h-12 bg-black text-white hover:bg-black/90 font-black rounded-xl border-none"
                      >
                        {passwordMutation.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Changer le mot de passe
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProfilePage;
