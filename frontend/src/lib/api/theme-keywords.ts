import { apiClient } from './client';
import type { ThemeKeyword } from '@/lib/types';

export async function addThemeKeyword(themeId: string, keyword: string): Promise<ThemeKeyword> {
  const response = await apiClient.post<ThemeKeyword>(`/themes/${themeId}/keywords`, { keyword });
  return response.data;
}

export async function removeThemeKeyword(themeId: string, keywordId: string): Promise<void> {
  await apiClient.delete(`/themes/${themeId}/keywords/${keywordId}`);
}
