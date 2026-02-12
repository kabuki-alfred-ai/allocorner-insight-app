import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addThemeKeyword, removeThemeKeyword } from '@/lib/api/theme-keywords';

export function useAddThemeKeyword(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ themeId, keyword }: { themeId: string; keyword: string }) => 
      addThemeKeyword(themeId, keyword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'themes'] });
    },
  });
}

export function useRemoveThemeKeyword(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ themeId, keywordId }: { themeId: string; keywordId: string }) => 
      removeThemeKeyword(themeId, keywordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'themes'] });
    },
  });
}
