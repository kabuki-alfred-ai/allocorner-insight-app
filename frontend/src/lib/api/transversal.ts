import { apiClient } from './client';
import type {
  TransversalAnalysis,
  CreateTransversalAnalysisDto,
  UpdateTransversalAnalysisDto,
} from '@/lib/types';

export async function getTransversalAnalyses(
  projectId: string,
): Promise<TransversalAnalysis[]> {
  const response = await apiClient.get<TransversalAnalysis[]>(
    `/projects/${projectId}/transversal`,
  );
  return response.data;
}

export async function createTransversalAnalysis(
  projectId: string,
  data: CreateTransversalAnalysisDto,
): Promise<TransversalAnalysis> {
  const response = await apiClient.post<TransversalAnalysis>(
    `/projects/${projectId}/transversal`,
    data,
  );
  return response.data;
}

export async function updateTransversalAnalysis(
  projectId: string,
  id: string,
  data: UpdateTransversalAnalysisDto,
): Promise<TransversalAnalysis> {
  const response = await apiClient.patch<TransversalAnalysis>(
    `/projects/${projectId}/transversal/${id}`,
    data,
  );
  return response.data;
}

export async function deleteTransversalAnalysis(
  projectId: string,
  id: string,
): Promise<void> {
  await apiClient.delete(
    `/projects/${projectId}/transversal/${id}`,
  );
}
