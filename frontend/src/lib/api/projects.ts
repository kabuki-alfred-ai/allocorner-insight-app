import { apiClient } from './client';
import type {
  Project,
  ProjectWithRelations,
  ProjectMetrics,
  ProjectPlutchik,
  CreateProjectDto,
  UpdateProjectDto,
  UpsertMetricsDto,
  UpsertPlutchikDto,
} from '@/lib/types';

export async function getProjects(): Promise<Project[]> {
  const response = await apiClient.get<Project[]>('/projects');
  return response.data;
}

export async function getProject(id: string): Promise<ProjectWithRelations> {
  const response = await apiClient.get<ProjectWithRelations>(
    `/projects/${id}`,
  );
  return response.data;
}

export async function createProject(data: CreateProjectDto): Promise<Project> {
  const response = await apiClient.post<Project>('/projects', data);
  return response.data;
}

export async function updateProject(
  id: string,
  data: UpdateProjectDto,
): Promise<Project> {
  const response = await apiClient.patch<Project>(`/projects/${id}`, data);
  return response.data;
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/projects/${id}`);
}

export async function upsertMetrics(
  projectId: string,
  data: UpsertMetricsDto,
): Promise<ProjectMetrics> {
  const response = await apiClient.put<ProjectMetrics>(
    `/projects/${projectId}/metrics`,
    data,
  );
  return response.data;
}

export async function upsertPlutchik(
  projectId: string,
  data: UpsertPlutchikDto,
): Promise<ProjectPlutchik> {
  const response = await apiClient.put<ProjectPlutchik>(
    `/projects/${projectId}/plutchik`,
    data,
  );
  return response.data;
}
