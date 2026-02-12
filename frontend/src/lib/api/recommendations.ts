import { apiClient } from './client';
import type {
  Recommendation,
  CreateRecommendationDto,
  UpdateRecommendationDto,
} from '@/lib/types';

export async function getRecommendations(
  projectId: string,
): Promise<Recommendation[]> {
  const response = await apiClient.get<Recommendation[]>(
    `/projects/${projectId}/recommendations`,
  );
  return response.data;
}

export async function createRecommendation(
  projectId: string,
  data: CreateRecommendationDto,
): Promise<Recommendation> {
  const response = await apiClient.post<Recommendation>(
    `/projects/${projectId}/recommendations`,
    data,
  );
  return response.data;
}

export async function updateRecommendation(
  projectId: string,
  id: string,
  data: UpdateRecommendationDto,
): Promise<Recommendation> {
  const response = await apiClient.patch<Recommendation>(
    `/projects/${projectId}/recommendations/${id}`,
    data,
  );
  return response.data;
}

export async function deleteRecommendation(
  projectId: string,
  id: string,
): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/recommendations/${id}`);
}
