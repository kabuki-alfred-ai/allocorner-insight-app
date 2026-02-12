import { useQuery } from '@tanstack/react-query';
import { getTrends } from '@/lib/api/trends';

export function useTrends(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'trends'],
    queryFn: () => getTrends(projectId),
    enabled: !!projectId,
  });
}
