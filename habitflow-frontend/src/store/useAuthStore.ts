import { create } from 'zustand';
import axios from 'axios';
import { api } from '../services/api';
import type { AuthResponse, AuthUser } from '../types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticating: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const storedToken = localStorage.getItem('habitflow_token');
const storedUser = localStorage.getItem('habitflow_user');

const persistSession = (authResponse: AuthResponse) => {
  localStorage.setItem('habitflow_token', authResponse.accessToken);
  localStorage.setItem('habitflow_user', JSON.stringify(authResponse.user));
};

const clearSession = () => {
  localStorage.removeItem('habitflow_token');
  localStorage.removeItem('habitflow_user');
};

const getAuthErrorMessage = (err: unknown, fallback: string) => {
  if (!axios.isAxiosError(err)) return fallback;

  const message = err.response?.data?.message;

  if (Array.isArray(message)) return message[0];
  if (message) return message;
  if (err.code === 'ERR_NETWORK') {
    return 'Cannot connect to the backend. Please make sure the API server is running.';
  }

  return fallback;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isAuthenticating: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isAuthenticating: true, error: null });
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      persistSession(response.data);
      set({
        user: response.data.user,
        token: response.data.accessToken,
        isAuthenticating: false,
      });
    } catch (err: unknown) {
      const msg = getAuthErrorMessage(err, 'Unable to open secure session.');
      set({
        error: msg,
        isAuthenticating: false,
      });
      throw err;
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isAuthenticating: true, error: null });
    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        name,
        email,
        password,
      });
      persistSession(response.data);
      set({
        user: response.data.user,
        token: response.data.accessToken,
        isAuthenticating: false,
      });
    } catch (err: unknown) {
      const msg = getAuthErrorMessage(err, 'Unable to create account.');
      set({
        error: msg,
        isAuthenticating: false,
      });
      throw err;
    }
  },

  logout: () => {
    clearSession();
    set({ user: null, token: null, error: null });
  },
}));
