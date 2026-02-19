import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { resetPassword } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const schema = z
  .object({
    newPassword: z.string().min(8, "8 caractères minimum"),
    confirmPassword: z.string().min(8, "8 caractères minimum"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormValues) => {
    if (!token) return;
    try {
      await resetPassword({ token, newPassword: values.newPassword, confirmPassword: values.confirmPassword });
      toast.success("Mot de passe réinitialisé avec succès !");
      navigate("/login");
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message ?? "Token invalide ou expiré.";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center px-4 font-sans selection:bg-primary/20 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full opacity-30" />

      <Card className="w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/[0.08] bg-[#0c0c0e]/90 backdrop-blur-2xl relative z-10 overflow-hidden rounded-[2.5rem]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

        <CardHeader className="text-center space-y-8 pt-14 pb-4">
          <div className="flex flex-col items-center gap-10">
            <div className="p-8 bg-black rounded-[2rem] border border-white/10 shadow-inner group relative">
              <div className="absolute inset-0 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-all rounded-full" />
              <img
                src="https://www.allocorner.fr/wp-content/uploads/2024/01/Logo-Allo-Corner-4.png"
                alt="Allo Corner Logo"
                className="h-10 w-auto object-contain relative z-10 brightness-125"
              />
            </div>

            <div className="space-y-3">
              <div className="flex flex-col items-center">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-3 leading-none opacity-80">
                  Nouveau mot de passe
                </p>
                <h1 className="text-4xl font-extrabold font-heading text-white tracking-tight">
                  Réinitialisation
                </h1>
              </div>
              <p className="text-xs font-medium text-white/40 max-w-[260px] mx-auto leading-relaxed">
                Choisissez un nouveau mot de passe sécurisé
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8 px-10 pb-14">
          {!token ? (
            <div className="text-center space-y-6">
              <p className="text-sm text-red-400 font-medium">
                Lien invalide. Aucun token de réinitialisation trouvé.
              </p>
              <Link
                to="/login"
                className="text-[10px] text-white/30 hover:text-primary transition-colors font-bold uppercase tracking-widest"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                        Nouveau mot de passe
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="bg-white/5 border-white/20 focus:bg-white/10 focus:border-primary/50 transition-all text-white placeholder:text-white/20 px-5"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-400 font-bold" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                        Confirmer le mot de passe
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="bg-white/5 border-white/20 focus:bg-white/10 focus:border-primary/50 transition-all text-white placeholder:text-white/20 px-5"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] text-red-400 font-bold" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-[0.25em] rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] mt-6"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Réinitialisation...</span>
                    </div>
                  ) : (
                    "Réinitialiser le mot de passe"
                  )}
                </Button>

                <div className="flex justify-center">
                  <Link
                    to="/login"
                    className="text-[10px] text-white/30 hover:text-primary transition-colors font-bold uppercase tracking-widest"
                  >
                    Retour à la connexion
                  </Link>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ResetPasswordPage;
