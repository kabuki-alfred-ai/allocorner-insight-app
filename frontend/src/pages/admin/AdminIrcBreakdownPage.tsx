import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useIrcBreakdown, useUpsertIrcBreakdown } from "@/hooks/use-irc-breakdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";

const ircBreakdownSchema = z.object({
  intensity: z.coerce.number().min(0).max(100),
  thematicRichness: z.coerce.number().min(0).max(100),
  narrativeCoherence: z.coerce.number().min(0).max(100),
  originality: z.coerce.number().min(0).max(100),
});

type IrcBreakdownFormValues = z.infer<typeof ircBreakdownSchema>;

export default function AdminIrcBreakdownPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: ircBreakdown, isLoading } = useIrcBreakdown(projectId!);
  const upsertIrcBreakdown = useUpsertIrcBreakdown(projectId!);

  const form = useForm<IrcBreakdownFormValues>({
    resolver: zodResolver(ircBreakdownSchema),
    defaultValues: {
      intensity: 0,
      thematicRichness: 0,
      narrativeCoherence: 0,
      originality: 0,
    },
  });

  // Pré-remplir le formulaire quand les données arrivent
  if (ircBreakdown && !form.formState.isDirty) {
    form.reset({
      intensity: ircBreakdown.intensity,
      thematicRichness: ircBreakdown.thematicRichness,
      narrativeCoherence: ircBreakdown.narrativeCoherence,
      originality: ircBreakdown.originality,
    });
  }

  const onSubmit = async (values: IrcBreakdownFormValues) => {
    try {
      await upsertIrcBreakdown.mutateAsync(values);
      toast.success("Décomposition IRC enregistrée");
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="Décomposition IRC"
        description="Configurer les critères de décomposition du score IRC"
        icon={<BarChart3 className="h-6 w-6" />}
      />

      <Card className="premium-card max-w-2xl">
        <CardHeader>
          <CardTitle>Critères IRC</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="intensity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intensité émotionnelle (30%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thematicRichness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Richesse thématique (25%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="narrativeCoherence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cohérence narrative (25%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="originality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Originalité (20%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={upsertIrcBreakdown.isPending}
              >
                {upsertIrcBreakdown.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Enregistrer
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
