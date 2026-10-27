import { apiClient } from './client.js';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
  stats?: {
    solvedQuestions: number;
    completedInterviews: number;
  };
}

export interface AuthResponse {
  message: string;
  user: User;
}

export async function loginUser(payload: { email: string; password: string }): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function registerUser(payload: { name: string; email: string; password: string }): Promise<AuthResponse> {
  return apiClient<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logoutUser(): Promise<{ message: string }> {
  return apiClient<{ message: string }>('/auth/logout', {
    method: 'POST',
  });
}

export async function fetchCurrentUser(): Promise<{ user: User }> {
  return apiClient<{ user: User }>('/auth/me');
}

export async function forgotPassword(payload: { email: string }): Promise<{ message: string; resetToken?: string }> {
  return apiClient<{ message: string; resetToken?: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload: { token: string; password: string }): Promise<{ message: string }> {
  return apiClient<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateProfile(payload: { name?: string; avatarUrl?: string }): Promise<{ user: User; message: string }> {
  return apiClient<{ user: User; message: string }>('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
