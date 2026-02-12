import { useQuery } from '@tanstack/react-query';
import { getMessagesStats } from '@/lib/api/stats';

export function useMessagesStats(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'messages', 'stats'],
    queryFn: () => getMessagesStats(projectId),
    enabled: !!projectId,
  });
}
