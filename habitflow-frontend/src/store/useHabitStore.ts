import { create } from 'zustand';
import { api } from '../services/api';
import type { Habit } from '../types';

interface HabitState {
  habits: Habit[];
  isLoading: boolean;
  actionLoadingId: string | null;
  error: string | null;
  successMessage: string | null;
  fetchHabits: () => Promise<void>;
  addHabit: (title: string) => Promise<void>;
  updateHabit: (habitId: string, title: string) => Promise<void>;
  logHabitStatus: (habitId: string, status: 'complete' | 'missed') => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  clearHabits: () => void;
}

export const useHabitStore = create<HabitState>((set) => ({
  habits: [],
  isLoading: false,
  actionLoadingId: null,
  error: null,
  successMessage: null,

  fetchHabits: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Habit[]>('/habits');
      set({ habits: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch habits from engine.', isLoading: false });
    }
  },

  addHabit: async (title: string) => {
    set({ isLoading: true, error: null, successMessage: null });
    try {
      const response = await api.post<Habit>('/habits', { title });
      set((state) => ({
        habits: [response.data, ...state.habits],
        isLoading: false,
        successMessage: `Habit "${title}" successfully integrated.`
      }));
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to create habit.';
      set({ error: Array.isArray(msg) ? msg[0] : msg, isLoading: false });
      throw err;
    }
  },

  updateHabit: async (habitId: string, title: string) => {
    set({ actionLoadingId: habitId, error: null, successMessage: null });
    try {
      const response = await api.patch<Habit>(`/habits/${habitId}`, { title });
      set((state) => ({
        habits: state.habits.map((habit) => (habit.id === habitId ? response.data : habit)),
        actionLoadingId: null,
      }));
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Unable to update habit.';
      set({
        error: Array.isArray(msg) ? msg[0] : msg,
        actionLoadingId: null,
      });
      throw err;
    }
  },

  logHabitStatus: async (habitId: string, status: 'complete' | 'missed') => {
    set({ actionLoadingId: habitId, error: null, successMessage: null });
    try {
      await api.post(`/habits/${status}`, { habitId });
      set({
        actionLoadingId: null,
        successMessage: null,
      });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || `Failed to execute tracking update.`, 
        actionLoadingId: null 
      });
    }
  },

  deleteHabit: async (habitId: string) => {
    set({ actionLoadingId: habitId, error: null, successMessage: null });
    try {
      await api.delete(`/habits/${habitId}`);
      set({
        actionLoadingId: null,
        successMessage: null,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Unable to delete habit.';
      set({
        error: Array.isArray(msg) ? msg[0] : msg,
        actionLoadingId: null,
      });
      throw err;
    }
  },

  clearHabits: () => {
    set({
      habits: [],
      isLoading: false,
      actionLoadingId: null,
      error: null,
      successMessage: null,
    });
  },
}));
