import { apiClient } from './client';

export interface ProjectResource {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: string;
  size: string;
  fileKey: string | null;
  position: number;
  createdAt: string;
}

export interface CreateResourceDto {
  title: string;
  description?: string;
  type: string;
  size?: string;
  fileKey?: string;
  position?: number;
}

export interface UpdateResourceDto {
  title?: string;
  description?: string;
  type?: string;
  size?: string;
  fileKey?: string;
  position?: number;
}

export async function getResources(projectId: string): Promise<ProjectResource[]> {
  const response = await apiClient.get<ProjectResource[]>(`/projects/${projectId}/resources`);
  return response.data;
}

export async function createResource(projectId: string, data: CreateResourceDto): Promise<ProjectResource> {
  const response = await apiClient.post<ProjectResource>(`/projects/${projectId}/resources`, data);
  return response.data;
}

export async function updateResource(projectId: string, id: string, data: UpdateResourceDto): Promise<ProjectResource> {
  const response = await apiClient.patch<ProjectResource>(`/projects/${projectId}/resources/${id}`, data);
  return response.data;
}

export async function deleteResource(projectId: string, id: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/resources/${id}`);
}

export async function downloadResource(projectId: string, id: string): Promise<Blob> {
  const response = await apiClient.get(`/projects/${projectId}/resources/${id}/download`, {
    responseType: 'blob',
  });
  return response.data as Blob;
}
