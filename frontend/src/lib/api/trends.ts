import { apiClient } from './client';
import type { Trends, UpsertTrendsDto } from '@/lib/types';

export async function getTrends(projectId: string): Promise<Trends> {
  const response = await apiClient.get<Trends>(
    `/projects/${projectId}/trends`,
  );
  return response.data;
}

export async function upsertTrends(
  projectId: string,
  data: UpsertTrendsDto,
): Promise<Trends> {
  const response = await apiClient.put<Trends>(
    `/projects/${projectId}/trends`,
    data,
  );
  return response.data;
}
