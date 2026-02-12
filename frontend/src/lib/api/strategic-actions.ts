import { apiClient } from './client';
import type { Priority } from '@/lib/types';

export interface StrategicAction {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: Priority;
  timeline: string;
  resources: string;
  position: number;
}

export interface CreateStrategicActionDto {
  title: string;
  description?: string;
  priority?: Priority;
  timeline?: string;
  resources?: string;
  position?: number;
}

export interface UpdateStrategicActionDto {
  title?: string;
  description?: string;
  priority?: Priority;
  timeline?: string;
  resources?: string;
  position?: number;
}

export async function getStrategicActions(projectId: string): Promise<StrategicAction[]> {
  const response = await apiClient.get<StrategicAction[]>(`/projects/${projectId}/strategic-actions`);
  return response.data;
}

export async function createStrategicAction(projectId: string, data: CreateStrategicActionDto): Promise<StrategicAction> {
  const response = await apiClient.post<StrategicAction>(`/projects/${projectId}/strategic-actions`, data);
  return response.data;
}

export async function updateStrategicAction(projectId: string, id: string, data: UpdateStrategicActionDto): Promise<StrategicAction> {
  const response = await apiClient.patch<StrategicAction>(`/projects/${projectId}/strategic-actions/${id}`, data);
  return response.data;
}

export async function deleteStrategicAction(projectId: string, id: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/strategic-actions/${id}`);
}
