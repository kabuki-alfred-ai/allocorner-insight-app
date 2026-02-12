import { apiClient } from './client';

export interface IrcBreakdown {
  id: string;
  projectId: string;
  intensity: number;
  thematicRichness: number;
  narrativeCoherence: number;
  originality: number;
}

export interface CreateIrcBreakdownDto {
  intensity: number;
  thematicRichness: number;
  narrativeCoherence: number;
  originality: number;
}

export async function getIrcBreakdown(projectId: string): Promise<IrcBreakdown | null> {
  const response = await apiClient.get<IrcBreakdown | null>(`/projects/${projectId}/irc-breakdown`);
  return response.data;
}

export async function upsertIrcBreakdown(projectId: string, data: CreateIrcBreakdownDto): Promise<IrcBreakdown> {
  const response = await apiClient.post<IrcBreakdown>(`/projects/${projectId}/irc-breakdown`, data);
  return response.data;
}
