import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getIrcBreakdown, upsertIrcBreakdown, CreateIrcBreakdownDto } from '@/lib/api/irc-breakdown';

export function useIrcBreakdown(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'irc-breakdown'],
    queryFn: () => getIrcBreakdown(projectId),
    enabled: !!projectId,
  });
}

export function useUpsertIrcBreakdown(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIrcBreakdownDto) => upsertIrcBreakdown(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'irc-breakdown'] });
    },
  });
}
