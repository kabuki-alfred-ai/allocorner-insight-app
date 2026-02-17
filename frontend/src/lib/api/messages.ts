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

// ========== PROCESSING ENDPOINTS ==========

export async function triggerProcessing(
  projectId: string,
  messageId: string,
): Promise<{ message: string; messageId: string }> {
  const response = await apiClient.post(
    `/projects/${projectId}/messages/${messageId}/process`,
  );
  return response.data;
}

export async function retryProcessing(
  projectId: string,
  messageId: string,
): Promise<{ message: string; messageId: string }> {
  const response = await apiClient.post(
    `/projects/${projectId}/messages/${messageId}/retry`,
  );
  return response.data;
}

export async function processBulk(
  projectId: string,
): Promise<{ message: string; queued: number }> {
  const response = await apiClient.post(
    `/projects/${projectId}/messages/process-bulk`,
  );
  return response.data;
}

export async function retryAllFailed(
  projectId: string,
): Promise<{ message: string; retried: number }> {
  const response = await apiClient.post(
    `/projects/${projectId}/messages/retry-all-failed`,
  );
  return response.data;
}

export async function getFailedMessages(
  projectId: string,
): Promise<Message[]> {
  const response = await apiClient.get<Message[]>(
    `/projects/${projectId}/messages/failed`,
  );
  return response.data;
}

export async function getProcessingStatus(
  projectId: string,
  messageId: string,
): Promise<{
  messageId: string;
  processingStatus: string;
  processingError?: string;
  processedAt?: string;
  retryCount: number;
}> {
  const response = await apiClient.get(
    `/projects/${projectId}/messages/${messageId}/status`,
  );
  return response.data;
}
