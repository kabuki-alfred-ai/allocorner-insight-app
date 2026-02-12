import { apiClient } from './client';
import { getAccessToken } from './client';

export interface SignedUrlResponse {
  url: string;
}

export async function getAudioUrl(
  projectId: string,
  messageId: string,
): Promise<SignedUrlResponse> {
  // Utiliser l'URL de streaming avec le token en query param
  // car les éléments <audio> ne peuvent pas envoyer de headers Authorization
  const token = getAccessToken();
  const baseUrl = `${apiClient.defaults.baseURL}/storage/audio/${projectId}/${messageId}/stream`;
  const url = token ? `${baseUrl}?token=${token}` : baseUrl;
  
  return { url };
}

export async function getLogoUrl(
  projectId: string,
): Promise<SignedUrlResponse> {
  const response = await apiClient.get<SignedUrlResponse>(
    `/storage/logo/${projectId}`,
  );
  return response.data;
}
