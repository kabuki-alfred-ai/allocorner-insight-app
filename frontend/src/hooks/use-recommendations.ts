import { useQuery } from '@tanstack/react-query';
import { getRecommendations } from '@/lib/api/recommendations';

export function useRecommendations(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'recommendations'],
    queryFn: () => getRecommendations(projectId),
    enabled: !!projectId,
  });
}
