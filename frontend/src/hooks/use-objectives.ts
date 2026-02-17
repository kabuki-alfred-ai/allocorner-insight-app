import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getObjectives, createObjective, updateObjective, deleteObjective, reorderObjectives, CreateObjectiveDto, UpdateObjectiveDto } from '@/lib/api/objectives';

export function useObjectives(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'objectives'],
    queryFn: () => getObjectives(projectId),
    enabled: !!projectId,
  });
}

export function useCreateObjective(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateObjectiveDto) => createObjective(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'objectives'] });
      toast.success('Objectif ajouté avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de l'ajout : ${error.message}`);
    },
  });
}

export function useUpdateObjective(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateObjectiveDto }) => updateObjective(projectId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'objectives'] });
      toast.success('Objectif mis à jour avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la mise à jour : ${error.message}`);
    },
  });
}

export function useDeleteObjective(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteObjective(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'objectives'] });
      toast.success('Objectif supprimé avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la suppression : ${error.message}`);
    },
  });
}
