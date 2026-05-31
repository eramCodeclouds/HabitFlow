import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHabitStore } from './store/useHabitStore';
import { useAuthStore } from './store/useAuthStore';
import { CreateHabitForm } from './components/CreateHabitForm';
import { HabitCard } from './components/HabitCard';
import { AuthPage } from './components/AuthPage';
import { Toast } from './components/Toast';
import type { ToastMessage, ToastTone } from './components/Toast';
import type { Habit } from './types';

type HabitLogStatus = 'complete' | 'missed';

interface LocalHabitLog {
  habitId: string;
  status: HabitLogStatus;
  date: string;
  timestamp: number;
}

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getCurrentWeekDays = () => {
  const today = startOfDay(new Date());
  const mondayOffset = today.getDay() === 0 ? -6 : 1 - today.getDay();
  const monday = addDays(today, mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(monday, index);
    return {
      label: dayLabels[index],
      key: toDateKey(date),
      isToday: toDateKey(date) === toDateKey(today),
    };
  });
};

const getHabitLogs = (logs: LocalHabitLog[], habitId: string) =>
  logs.filter((log) => log.habitId === habitId);

const getLatestDailyLog = (logs: LocalHabitLog[], habitId: string, date: string) =>
  logs
    .filter((log) => log.habitId === habitId && log.date === date)
    .sort((a, b) => b.timestamp - a.timestamp)[0];

const getCompletionRate = (logs: LocalHabitLog[], habitId: string) => {
  const habitLogs = getHabitLogs(logs, habitId);
  if (habitLogs.length === 0) return null;

  const completed = habitLogs.filter((log) => log.status === 'complete').length;
  return Math.round((completed / habitLogs.length) * 100);
};

const getCurrentStreak = (logs: LocalHabitLog[], habitId: string) => {
  const today = startOfDay(new Date());
  let streak = 0;

  for (let index = 0; index < 365; index += 1) {
    const dateKey = toDateKey(addDays(today, -index));
    const dayLog = getLatestDailyLog(logs, habitId, dateKey);

    if (!dayLog && index === 0) continue;
    if (!dayLog || dayLog.status !== 'complete') break;

    streak += 1;
  }

  return streak;
};

const getWeekCompletionRate = (logs: LocalHabitLog[], habitIds: string[], weekKeys: string[]) => {
  const relevantLogs = logs.filter(
    (log) => habitIds.includes(log.habitId) && weekKeys.includes(log.date),
  );
  if (relevantLogs.length === 0) return null;

  const completed = relevantLogs.filter((log) => log.status === 'complete').length;
  return Math.round((completed / relevantLogs.length) * 100);
};

const getNextStreakTarget = (streak: number) => {
  if (streak < 3) return 3;
  if (streak < 7) return 7;
  if (streak < 10) return 10;

  return Math.ceil((streak + 1) / 5) * 5;
};

const getCurrentFocus = (habits: Habit[], logs: LocalHabitLog[], todayKey: string) => {
  if (habits.length === 0) {
    return {
      title: 'Create your first habit',
      status: 'No active habits yet.',
      detail: 'Your progress will appear here after your first check-in.',
      milestone: 'First check-in',
    };
  }

  const focusHabit =
    habits.find((habit) => getLatestDailyLog(logs, habit.id, todayKey)?.status !== 'complete') ??
    habits[0];
  const todayLog = getLatestDailyLog(logs, focusHabit.id, todayKey);
  const streak = getCurrentStreak(logs, focusHabit.id);
  const rate = getCompletionRate(logs, focusHabit.id);
  const milestone = streak >= 7 ? '10-Day Streak' : streak >= 3 ? '7-Day Streak' : '3-Day Streak';

  return {
    title: focusHabit.title,
    status:
      todayLog?.status === 'complete'
        ? 'Completed today.'
        : todayLog?.status === 'missed'
          ? 'Marked missed today.'
          : 'Not checked in today.',
    detail:
      rate === null
        ? `${streak} day current streak. No completion rate yet.`
        : `${streak} day current streak. ${rate}% completion rate.`,
    milestone,
  };
};

export const App: React.FC = () => {
  const { user, token, logout } = useAuthStore();
  const { habits, fetchHabits, isLoading, error, successMessage, clearHabits } = useHabitStore();
  const todayKey = toDateKey(new Date());
  const historyKey = user ? `habitflow_history_${user.userId}` : 'habitflow_history_guest';

  const [history, setHistory] = useState<LocalHabitLog[]>([]);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const weekDays = useMemo(() => getCurrentWeekDays(), []);
  const habitIds = useMemo(() => habits.map((habit) => habit.id), [habits]);
  const currentFocus = useMemo(
    () => getCurrentFocus(habits, history, todayKey),
    [habits, history, todayKey],
  );

  const todayCompletedCount = useMemo(
    () =>
      habits.filter((habit) => getLatestDailyLog(history, habit.id, todayKey)?.status === 'complete')
        .length,
    [habits, history, todayKey],
  );

  const longestStreak = useMemo(
    () =>
      habits.reduce((longest, habit) => Math.max(longest, getCurrentStreak(history, habit.id)), 0),
    [habits, history],
  );
  const targetStreak = getNextStreakTarget(longestStreak);
  const previousTarget = targetStreak <= 3 ? 0 : targetStreak === 7 ? 3 : targetStreak === 10 ? 7 : targetStreak - 5;
  const milestoneProgress =
    targetStreak === previousTarget
      ? 100
      : Math.min(
          100,
          Math.round(((longestStreak - previousTarget) / (targetStreak - previousTarget)) * 100),
        );
  const hasIncompleteHabits = todayCompletedCount < habits.length;

  const weeklyCompletionRate = useMemo(
    () => getWeekCompletionRate(history, habitIds, weekDays.map((day) => day.key)),
    [habitIds, history, weekDays],
  );

  const bestHabit = useMemo(() => {
    const ranked = habits
      .map((habit) => ({ habit, rate: getCompletionRate(history, habit.id) }))
      .filter((item): item is { habit: Habit; rate: number } => item.rate !== null)
      .sort((a, b) => b.rate - a.rate);

    return ranked[0]?.habit.title ?? 'No clear best habit yet';
  }, [habits, history]);

  const riskHabit = useMemo(() => {
    const ranked = habits
      .map((habit) => ({
        habit,
        misses: getHabitLogs(history, habit.id).filter((log) => log.status === 'missed').length,
      }))
      .filter((item) => item.misses > 0)
      .sort((a, b) => b.misses - a.misses);

    return ranked[0]?.habit.title ?? 'No risk habit yet';
  }, [habits, history]);

  useEffect(() => {
    if (token) {
      fetchHabits();
    }
  }, [fetchHabits, token]);

  useEffect(() => {
    const savedHistory = localStorage.getItem(historyKey);

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory) as LocalHabitLog[]);
    }
  }, [historyKey]);

  if (!token || !user) {
    return <AuthPage />;
  }

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? 'Good Morning' : greetingHour < 17 ? 'Good Afternoon' : 'Good Evening';

  const handleLogout = () => {
    logout();
    clearHabits();
  };

  const recordHabitStatus = (habitId: string, status: HabitLogStatus) => {
    setHistory((currentHistory) => {
      const nextHistory = [
        ...currentHistory,
        {
          habitId,
          status,
          date: todayKey,
          timestamp: Date.now(),
        },
      ];

      localStorage.setItem(historyKey, JSON.stringify(nextHistory));
      return nextHistory;
    });
  };

  const showToast = useCallback((tone: ToastTone, message: string) => {
    setToast({
      id: Date.now(),
      tone,
      message,
    });
  }, []);

  const handleHabitDeleted = (habitId: string) => {
    setHistory((currentHistory) => {
      const nextHistory = currentHistory.filter((log) => log.habitId !== habitId);
      localStorage.setItem(historyKey, JSON.stringify(nextHistory));
      return nextHistory;
    });
  };

  const previousWeekRate = getWeekCompletionRate(
    history,
    habitIds,
    weekDays.map((day) => toDateKey(addDays(new Date(day.key), -7))),
  );

  const trend =
    weeklyCompletionRate === null || previousWeekRate === null
      ? 'Build a baseline'
      : `${weeklyCompletionRate - previousWeekRate >= 0 ? '+' : ''}${
          weeklyCompletionRate - previousWeekRate
        }% vs last week`;

  return (
    <div className="min-h-screen bg-[#08090b] text-zinc-100 antialiased selection:bg-emerald-400/20">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(52,211,153,0.13),transparent_32%),radial-gradient(circle_at_88%_18%,rgba(96,165,250,0.1),transparent_30%)]" />

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08090b]/82 px-5 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-sm font-semibold text-zinc-950">
              HF
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100">HabitFlow</p>
              <p className="text-xs text-zinc-500">Small habits. Better days.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full bg-white/[0.06] px-4 py-2 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.1] hover:text-zinc-100"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-7 px-5 py-8 sm:px-8 lg:py-10">
        <section className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm text-zinc-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
              {greeting}, {user.name} 👋
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
              You completed{' '}
              <span className="font-semibold text-zinc-100">{todayCompletedCount}</span> of{' '}
              <span className="font-semibold text-zinc-100">{habits.length}</span> habits today.
            </p>
          </div>

          <div className="rounded-3xl bg-white/[0.05] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Current streak</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-50">🔥 {longestStreak} days</p>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>
        )}
        {successMessage && (
          <div className="rounded-2xl bg-emerald-400/10 p-4 text-sm text-emerald-200">
            {successMessage}
          </div>
        )}

        <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,rgba(39,39,42,0.96),rgba(21,94,117,0.28),rgba(20,83,45,0.28),rgba(24,24,27,0.98))] p-7 shadow-2xl shadow-black/25 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-emerald-100">Current Focus</p>
              <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                {currentFocus.title}
              </h2>
              <p className="mt-5 text-2xl font-medium text-zinc-100">{currentFocus.status}</p>
              <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-300">
                {currentFocus.detail}
              </p>
            </div>

            <div className="rounded-3xl bg-black/20 p-5 text-left ring-1 ring-white/[0.06] sm:min-w-56">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/80">
                Next milestone
              </p>
              <p className="mt-3 text-2xl font-semibold text-zinc-50">{currentFocus.milestone}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-7 lg:grid-cols-[1fr_22rem] lg:items-start">
          <div className="space-y-7">
            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-50">Today&apos;s Habits</h2>
                  <p className="mt-1 text-sm text-zinc-500">Complete, miss, and move on.</p>
                </div>
                {isLoading && habits.length === 0 && (
                  <span className="text-xs text-zinc-500">Loading...</span>
                )}
              </div>

              {habits.length === 0 && !isLoading ? (
                <div className="rounded-3xl bg-white/[0.04] p-8 text-center text-sm text-zinc-500">
                  Add one habit to begin tracking.
                </div>
              ) : (
                <div className="grid gap-3">
                  {habits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      streak={getCurrentStreak(history, habit.id)}
                      completionRate={getCompletionRate(history, habit.id)}
                      isCompleteToday={
                        getLatestDailyLog(history, habit.id, todayKey)?.status === 'complete'
                      }
                      onLogged={recordHabitStatus}
                      onDeleted={handleHabitDeleted}
                      onToast={showToast}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl bg-white/[0.035] p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-zinc-50">Weekly Activity</h2>
                <p className="mt-1 text-sm text-zinc-500">A simple view of this week.</p>
              </div>

              <div className="space-y-4 overflow-x-auto pb-1">
                <div className="grid min-w-[34rem] grid-cols-[minmax(7rem,1fr)_repeat(7,2rem)] items-center gap-2 text-xs text-zinc-500">
                  <span />
                  {weekDays.map((day) => (
                    <span key={day.key} className={day.isToday ? 'text-zinc-200' : ''}>
                      {day.label}
                    </span>
                  ))}
                </div>

                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    className="grid min-w-[34rem] grid-cols-[minmax(7rem,1fr)_repeat(7,2rem)] items-center gap-2"
                  >
                    <span className="truncate text-sm font-medium text-zinc-200">{habit.title}</span>
                    {weekDays.map((day) => {
                      const log = getLatestDailyLog(history, habit.id, day.key);
                      return (
                        <span
                          key={`${habit.id}-${day.key}`}
                          className={`h-7 rounded-lg ${
                            log?.status === 'complete'
                              ? 'bg-emerald-400'
                              : log?.status === 'missed'
                                ? 'bg-rose-400/70'
                                : 'bg-white/[0.07]'
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white/[0.035] p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-zinc-50">This Week</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-zinc-500">Completion Rate</p>
                  <p className="mt-1 text-2xl font-semibold text-zinc-50">
                    {weeklyCompletionRate === null ? 'No history yet' : `${weeklyCompletionRate}%`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Best Habit</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-200">{bestHabit}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Risk Habit</p>
                  <p className="mt-1 text-lg font-semibold text-rose-200">{riskHabit}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Trend</p>
                  <p className="mt-1 text-lg font-semibold text-blue-200">{trend}</p>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-7 lg:sticky lg:top-24">
            <section className="rounded-3xl bg-white/[0.05] p-5 shadow-2xl shadow-black/10 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-50">Next Milestone</h2>
                  <p className="mt-1 text-sm text-zinc-500">Your immediate streak goal.</p>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-300/10 text-2xl">
                  🔥
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/[0.06]">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Current Streak</p>
                  <p className="mt-3 text-3xl font-semibold text-zinc-50">
                    🔥 {longestStreak}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">Days</p>
                </div>

                <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/[0.06]">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Target Streak</p>
                  <p className="mt-3 text-3xl font-semibold text-amber-200">
                    🔥 {targetStreak}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">Days</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
                  <span>Progress</span>
                  <span>{milestoneProgress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-amber-200 transition-all"
                    style={{ width: `${milestoneProgress}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-emerald-300/[0.08] p-4 ring-1 ring-emerald-300/10">
                <p className="text-sm leading-6 text-zinc-200">
                  {hasIncompleteHabits
                    ? "Complete today's remaining habits to stay on track."
                    : "Great work. You're one step closer to your next streak milestone."}
                </p>
              </div>
            </section>

            <CreateHabitForm />
          </aside>
        </section>
      </main>

      <footer className="px-5 py-10 text-center sm:px-8">
        <div className="mx-auto max-w-sm">
          <p className="text-sm font-semibold text-zinc-100">HabitFlow</p>
          <p className="mt-2 text-sm text-zinc-500">Small habits. Better days.</p>
          <p className="mt-4 text-xs text-zinc-600">Powered by Eram.</p>
          <p className="mt-2 text-xs text-zinc-700">© 2025 HabitFlow</p>
        </div>
      </footer>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};

export default App;
