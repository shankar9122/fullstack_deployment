import { http } from '@/lib/http/client';
import type { AuthUser, ChangePasswordInput, ChangePasswordResponse, LoginInput, LoginResponse } from '@/types/auth';

// Services only talk to the API. Saving the token is the AuthProvider's job
export const authService = {
  login(input: LoginInput): Promise<LoginResponse> {
    // Public endpoint: no token, and a 401 here just means wrong credentials
    return http.post<LoginResponse>('/auth/login', { body: input, auth: false });
  },

  async me(signal?: AbortSignal): Promise<AuthUser> {
    const { user } = await http.get<{ user: AuthUser }>('/auth/me', { signal });
    return user;
  },

  changePassword(input: ChangePasswordInput): Promise<ChangePasswordResponse> {
    return http.post<ChangePasswordResponse>('/auth/change-password', { body: input });
  },
};
