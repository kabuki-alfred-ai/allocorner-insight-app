import { useQuery } from '@tanstack/react-query';
import { getThemes } from '@/lib/api/themes';

export function useThemes(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'themes'],
    queryFn: () => getThemes(projectId),
    enabled: !!projectId,
  });
}
