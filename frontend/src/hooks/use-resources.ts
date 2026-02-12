import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getResources, createResource, updateResource, deleteResource, CreateResourceDto, UpdateResourceDto } from '@/lib/api/resources';

export function useResources(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'resources'],
    queryFn: () => getResources(projectId),
    enabled: !!projectId,
  });
}

export function useCreateResource(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateResourceDto) => createResource(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'resources'] });
    },
  });
}

export function useUpdateResource(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResourceDto }) => updateResource(projectId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'resources'] });
    },
  });
}

export function useDeleteResource(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResource(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'resources'] });
    },
  });
}
