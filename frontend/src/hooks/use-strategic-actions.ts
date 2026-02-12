import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStrategicActions, createStrategicAction, updateStrategicAction, deleteStrategicAction, CreateStrategicActionDto, UpdateStrategicActionDto } from '@/lib/api/strategic-actions';

export function useStrategicActions(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'strategic-actions'],
    queryFn: () => getStrategicActions(projectId),
    enabled: !!projectId,
  });
}

export function useCreateStrategicAction(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStrategicActionDto) => createStrategicAction(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'strategic-actions'] });
    },
  });
}

export function useUpdateStrategicAction(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStrategicActionDto }) => updateStrategicAction(projectId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'strategic-actions'] });
    },
  });
}

export function useDeleteStrategicAction(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStrategicAction(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'strategic-actions'] });
    },
  });
}
