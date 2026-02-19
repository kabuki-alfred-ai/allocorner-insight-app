import { apiClient } from './client';
import type { User } from '@/lib/types';

export async function updateProfile(data: {
  name?: string;
  email?: string;
}): Promise<User> {
  const response = await apiClient.patch<User>('/users/me', data);
  return response.data;
}

export async function updatePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ message: string }> {
  const response = await apiClient.patch<{ message: string }>(
    '/users/me/password',
    data,
  );
  return response.data;
}
