import { apiClient } from './client';
import type {
  FeaturedVerbatim,
  CreateFeaturedVerbatimDto,
} from '@/lib/types';

export async function getFeaturedVerbatims(
  projectId: string,
): Promise<FeaturedVerbatim[]> {
  const response = await apiClient.get<FeaturedVerbatim[]>(
    `/projects/${projectId}/featured-verbatims`,
  );
  return response.data;
}

export async function createFeaturedVerbatim(
  projectId: string,
  data: CreateFeaturedVerbatimDto,
): Promise<FeaturedVerbatim> {
  const response = await apiClient.post<FeaturedVerbatim>(
    `/projects/${projectId}/featured-verbatims`,
    data,
  );
  return response.data;
}

export async function deleteFeaturedVerbatim(
  projectId: string,
  id: string,
): Promise<void> {
  await apiClient.delete(
    `/projects/${projectId}/featured-verbatims/${id}`,
  );
}
