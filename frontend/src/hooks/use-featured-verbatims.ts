import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getFeaturedVerbatims, createFeaturedVerbatim, deleteFeaturedVerbatim } from '@/lib/api/featured-verbatims';
import type { CreateFeaturedVerbatimDto } from '@/lib/types';

export function useFeaturedVerbatims(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'featured-verbatims'],
    queryFn: () => getFeaturedVerbatims(projectId),
    enabled: !!projectId,
  });
}

export function useCreateFeaturedVerbatim(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFeaturedVerbatimDto) => createFeaturedVerbatim(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'featured-verbatims'] });
      toast.success('Verbatim marquant ajouté');
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout du verbatim");
    },
  });
}

export function useDeleteFeaturedVerbatim(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFeaturedVerbatim(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'featured-verbatims'] });
      toast.success('Verbatim supprimé');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });
}
