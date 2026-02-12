import axios from 'axios';
import { apiClient } from './client';
import type { Invitation, AuthResponse } from '@/lib/types';

export interface CreateInvitationDto {
  email: string;
}

export interface AcceptInvitationDto {
  email: string;
  password: string;
  name: string;
}

export async function createInvitation(
  projectId: string,
  data: CreateInvitationDto,
): Promise<Invitation> {
  const response = await apiClient.post<Invitation>(
    `/projects/${projectId}/invitations`,
    data,
  );
  return response.data;
}

export async function getInvitations(
  projectId: string,
): Promise<Invitation[]> {
  const response = await apiClient.get<Invitation[]>(
    `/projects/${projectId}/invitations`,
  );
  return response.data;
}

export async function revokeInvitation(
  projectId: string,
  id: string,
): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/invitations/${id}`);
}

/**
 * Validate an invitation token. This is a public endpoint (no auth required).
 */
export async function validateInvitation(
  token: string,
): Promise<Invitation> {
  const baseURL =
    import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const response = await axios.get<Invitation>(
    `${baseURL}/invitations/${token}`,
  );
  return response.data;
}

/**
 * Accept an invitation. This is a public endpoint (no auth required).
 */
export async function acceptInvitation(
  token: string,
  data: AcceptInvitationDto,
): Promise<AuthResponse> {
  const baseURL =
    import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const response = await axios.post<AuthResponse>(
    `${baseURL}/invitations/${token}/accept`,
    data,
  );
  return response.data;
}
