import { useQuery } from '@tanstack/react-query';
import { getMessages } from '@/lib/api/messages';
import type { GetMessagesParams } from '@/lib/api/messages';

export function useMessages(projectId: string, params?: Omit<GetMessagesParams, never>) {
  return useQuery({
    queryKey: ['projects', projectId, 'messages', params],
    queryFn: () => getMessages(projectId, params),
    enabled: !!projectId,
  });
}
