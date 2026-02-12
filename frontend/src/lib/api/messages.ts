import { apiClient } from './client';
import type {
  Message,
  PaginatedResponse,
  EmotionalLoad,
  UpdateMessageDto,
} from '@/lib/types';

export interface GetMessagesParams {
  page?: number;
  limit?: number;
  theme?: string;
  emotion?: string;
  emotionalLoad?: EmotionalLoad;
  search?: string;
}

export async function getMessages(
  projectId: string,
  params?: GetMessagesParams,
): Promise<PaginatedResponse<Message>> {
  const response = await apiClient.get<PaginatedResponse<Message>>(
    `/projects/${projectId}/messages`,
    { params },
  );
  return response.data;
}

export async function createMessage(
  projectId: string,
  formData: FormData,
): Promise<Message> {
  const response = await apiClient.post<Message>(
    `/projects/${projectId}/messages`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return response.data;
}

export async function bulkUploadMessages(
  projectId: string,
  formData: FormData,
): Promise<Message[]> {
  const response = await apiClient.post<Message[]>(
    `/projects/${projectId}/messages/bulk`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return response.data;
}

export async function updateMessage(
  projectId: string,
  messageId: string,
  data: UpdateMessageDto,
): Promise<Message> {
  const response = await apiClient.patch<Message>(
    `/projects/${projectId}/messages/${messageId}`,
    data,
  );
  return response.data;
}

export async function deleteMessage(
  projectId: string,
  messageId: string,
): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/messages/${messageId}`);
}
