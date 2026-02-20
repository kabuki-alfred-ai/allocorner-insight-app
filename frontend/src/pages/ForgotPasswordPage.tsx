import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { forgotPassword } from "@/lib/api/auth";
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

const schema = z.object({
  email: z.string().email("Email invalide"),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await forgotPassword(values.email);
    } catch {
      // silent — anti-enumeration
    } finally {
      toast.success("Si cet email existe, un lien de réinitialisation a été envoyé.");
      form.reset();
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center px-4 font-sans selection:bg-primary/20 relative overflow-hidden dark text-white">
      {/* Background radial effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full opacity-30 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full opacity-20 pointer-events-none" />

      {/* Background Audio Wave (Dynamic) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.15] z-0">
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-around h-[120%] px-2 gap-2 md:gap-4">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="w-full bg-primary rounded-t-full transition-all duration-300 animate-waveform"
              style={{
                height: `${Math.random() * 70 + 10}%`,
                animationDelay: `${i * 0.05}s`,
                animationDuration: `${0.8 + Math.random() * 0.5}s`,
                opacity: 0.2 + (i / 50) * 0.4
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Top subtle gradient */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#000000] via-[#000000]/80 to-transparent z-0 pointer-events-none" />

      {/* Main Card Wrapper for Gradient Border */}
      <div className="w-full max-w-[420px] rounded-[2.5rem] p-[2px] bg-gradient-to-br from-primary/80 via-primary/20 to-transparent relative z-10 shadow-[0_0_80px_rgba(249,115,22,0.15)] group/card">
        <div className="w-full verbatim-card-dark !border-none !shadow-none sm:p-4 rounded-[calc(2.5rem-2px)] hover:!scale-100 hover:!translate-y-0 hover:!bg-black [&:hover::before]:!opacity-0">

        <CardHeader className="text-center space-y-8 pt-10 pb-4">
          <div className="flex flex-col items-center gap-8">
            <div className="p-6 bg-black rounded-[1.5rem] shadow-inner border border-white/5 group relative">
              <div className="absolute inset-0 bg-primary/10 blur-xl group-hover:bg-primary/20 transition-all rounded-full" />
              <img
                src="https://www.allocorner.fr/wp-content/uploads/2024/01/Logo-Allo-Corner-4.png"
                alt="Allo Corner Logo"
                className="h-8 w-auto object-contain relative z-10 brightness-110"
              />
            </div>

            <div className="space-y-3 px-2">
              <div className="flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 opacity-90">
                  Mot de passe oublié
                </p>
                <h1 className="text-3xl font-extrabold font-heading text-white tracking-tight">
                  Récupération
                </h1>
              </div>
              <p className="text-sm font-medium text-white/50 max-w-[280px] mx-auto leading-relaxed">
                Saisissez votre email pour recevoir un lien de réinitialisation
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 px-8 pb-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                      Adresse email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="nom@exemple.com"
                        className="h-12 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 focus:bg-white/10 focus:ring-2 focus:ring-primary/40 focus:border-white/10 transition-all text-white placeholder:text-white/20 px-5 rounded-2xl font-medium"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] text-destructive font-bold" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all active:scale-[0.98] mt-8"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Envoi en cours...</span>
                  </div>
                ) : (
                  "Envoyer le lien"
                )}
              </Button>

              <div className="flex justify-center mt-4 pt-4">
                <Link
                  to="/login"
                  className="text-[10px] text-white/30 hover:text-primary transition-colors font-black uppercase tracking-widest"
                >
                  Retour à la connexion
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
        </div>
      </div>
      
      {/* Footer minimal */}
      <div className="absolute bottom-8 text-center w-full z-10 pointer-events-none">
        <p className="text-[10px] font-black tracking-widest uppercase text-white/20">
          Propulsé par Allo Corner
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
