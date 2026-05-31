// Ensure "export" is explicitly added so other files can import this block!
export interface Habit {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  status: 'completed' | 'missed';
  createdAt: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
