import { useMutation } from '@tanstack/react-query';
import { apiFetch } from '../../api/client.ts';
import type { LoginPinPayload, LoginPasswordPayload, LoginResponse } from '../../api/types.ts';

export async function loginWithPin(payload: LoginPinPayload): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login-pin', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginWithPassword(payload: LoginPasswordPayload): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function useLoginPin() {
  return useMutation({
    mutationFn: loginWithPin,
  });
}

export function useLoginPassword() {
  return useMutation({
    mutationFn: loginWithPassword,
  });
}
