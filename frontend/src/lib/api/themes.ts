import { apiClient } from './client';
import type {
  Theme,
  CreateThemeDto,
  UpdateThemeDto,
  Message,
} from '@/lib/types';

export async function getThemes(projectId: string): Promise<Theme[]> {
  const response = await apiClient.get<Theme[]>(
    `/projects/${projectId}/themes`,
  );
  return response.data;
}

export async function createTheme(
  projectId: string,
  data: CreateThemeDto,
): Promise<Theme> {
  const response = await apiClient.post<Theme>(
    `/projects/${projectId}/themes`,
    data,
  );
  return response.data;
}

export async function updateTheme(
  projectId: string,
  themeId: string,
  data: UpdateThemeDto,
): Promise<Theme> {
  const response = await apiClient.patch<Theme>(
    `/projects/${projectId}/themes/${themeId}`,
    data,
  );
  return response.data;
}

export async function deleteTheme(
  projectId: string,
  themeId: string,
): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/themes/${themeId}`);
}

// ---------------------------------------------------------------------------
// Theme-Message Associations
// ---------------------------------------------------------------------------

export interface MessageWithAssociation extends Message {
  isAssociated: boolean;
}

/**
 * Définit le verbatim totem pour un thème
 */
export async function setThemeTotemMessage(
  projectId: string,
  themeId: string,
  messageId: string | null,
): Promise<Theme> {
  const response = await apiClient.post<Theme>(
    `/projects/${projectId}/themes/${themeId}/totem`,
    { messageId },
  );
  return response.data;
}

/**
 * Récupère tous les messages d'un projet avec indicateur d'association au thème
 */
export async function getAvailableMessagesForTheme(
  projectId: string,
  themeId: string,
): Promise<MessageWithAssociation[]> {
  const response = await apiClient.get<MessageWithAssociation[]>(
    `/projects/${projectId}/themes/${themeId}/messages/available`,
  );
  return response.data;
}

/**
 * Récupère tous les messages associés à un thème
 */
export async function getMessagesByTheme(
  projectId: string,
  themeId: string,
): Promise<Message[]> {
  const response = await apiClient.get<Message[]>(
    `/projects/${projectId}/themes/${themeId}/messages`,
  );
  return response.data;
}

/**
 * Associe un message à un thème
 */
export async function associateMessageToTheme(
  projectId: string,
  themeId: string,
  messageId: string,
): Promise<{ associated: boolean }> {
  const response = await apiClient.post<{ associated: boolean }>(
    `/projects/${projectId}/themes/${themeId}/messages/${messageId}`,
  );
  return response.data;
}

/**
 * Dissocie un message d'un thème
 */
export async function dissociateMessageFromTheme(
  projectId: string,
  themeId: string,
  messageId: string,
): Promise<{ dissociated: boolean }> {
  const response = await apiClient.delete<{ dissociated: boolean }>(
    `/projects/${projectId}/themes/${themeId}/messages/${messageId}`,
  );
  return response.data;
}

/**
 * Associe plusieurs messages à un thème en batch
 */
export async function associateMessagesBatch(
  projectId: string,
  themeId: string,
  messageIds: string[],
): Promise<{ associated: number }> {
  const response = await apiClient.post<{ associated: number }>(
    `/projects/${projectId}/themes/${themeId}/messages/batch`,
    { messageIds },
  );
  return response.data;
}
