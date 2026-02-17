import { apiClient } from './client';

export interface Objective {
  id: string;
  projectId: string;
  content: string;
  position: number;
}

export interface CreateObjectiveDto {
  content: string;
  position?: number;
}

export interface UpdateObjectiveDto {
  content?: string;
  position?: number;
}

export async function getObjectives(projectId: string): Promise<Objective[]> {
  const response = await apiClient.get<Objective[]>(`/projects/${projectId}/objectives`);
  return response.data;
}

export async function createObjective(projectId: string, data: CreateObjectiveDto): Promise<Objective> {
  const response = await apiClient.post<Objective>(`/projects/${projectId}/objectives`, data);
  return response.data;
}

export async function updateObjective(projectId: string, id: string, data: UpdateObjectiveDto): Promise<Objective> {
  const response = await apiClient.patch<Objective>(`/projects/${projectId}/objectives/${id}`, data);
  return response.data;
}

export async function deleteObjective(projectId: string, id: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/objectives/${id}`);
}

export async function reorderObjectives(projectId: string, ids: string[]): Promise<void> {
  await apiClient.post(`/projects/${projectId}/objectives/reorder`, { ids });
}
