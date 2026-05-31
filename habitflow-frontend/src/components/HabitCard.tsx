import React, { useState } from 'react';
import { useHabitStore } from '../store/useHabitStore';
import type { Habit } from '../types';
import { DeleteHabitModal } from './DeleteHabitModal';
import { EditHabitModal } from './EditHabitModal';
import { HabitActionMenu } from './HabitActionMenu';
import type { ToastTone } from './Toast';

interface HabitCardProps {
  habit: Habit;
  streak?: number;
  completionRate?: number | null;
  isCompleteToday?: boolean;
  onLogged?: (habitId: string, status: 'complete' | 'missed') => void;
  onDeleted?: (habitId: string) => void;
  onToast?: (tone: ToastTone, message: string) => void;
}

const getHabitIcon = (title: string) => {
  const normalized = title.toLowerCase();

  if (normalized.includes('study') || normalized.includes('read')) return '📚';
  if (normalized.includes('gym') || normalized.includes('fitness') || normalized.includes('exercise')) return '🏃';
  if (normalized.includes('water') || normalized.includes('hydrate')) return '💧';
  if (normalized.includes('sleep')) return '🌙';
  if (normalized.includes('meditat')) return '🧘';
  return '✨';
};

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  streak = 0,
  completionRate = null,
  isCompleteToday = false,
  onLogged,
  onDeleted,
  onToast,
}) => {
  const { logHabitStatus, updateHabit, deleteHabit, fetchHabits, actionLoadingId } = useHabitStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isCurrentlyProcessing = actionLoadingId === habit.id;

  const handleLog = async (status: 'complete' | 'missed') => {
    await logHabitStatus(habit.id, status);
    onLogged?.(habit.id, status);
  };

  const handleDeleteHabit = async () => {
    try {
      await deleteHabit(habit.id);
      setIsDeleteModalOpen(false);
      onDeleted?.(habit.id);
      await fetchHabits();
      onToast?.('success', 'Habit deleted successfully');
    } catch {
      onToast?.('error', 'Unable to delete habit. Please try again.');
    }
  };

  const handleUpdateHabit = async (title: string) => {
    try {
      await updateHabit(habit.id, title);
      await fetchHabits();
      setIsEditModalOpen(false);
      onToast?.('success', 'Habit updated successfully');
    } catch {
      onToast?.('error', 'Unable to update habit. Please try again.');
    }
  };

  return (
    <>
      <article className="relative flex flex-col gap-4 rounded-3xl bg-white/[0.045] p-5 pr-14 transition hover:bg-white/[0.065] sm:flex-row sm:items-center sm:justify-between">
        <div className="absolute right-4 top-4">
          <HabitActionMenu onEdit={() => setIsEditModalOpen(true)} onDelete={() => setIsDeleteModalOpen(true)} />
        </div>

        <div className="flex min-w-0 items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/[0.07] text-2xl">
            {getHabitIcon(habit.title)}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-zinc-50">{habit.title}</h3>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
              <span>🔥 {streak} day streak</span>
              <span>
                {completionRate === null ? 'No completion history yet' : `${completionRate}% completion rate`}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <button
            type="button"
            onClick={() => handleLog('missed')}
            disabled={isCurrentlyProcessing}
            className="rounded-full bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-rose-400/10 hover:text-rose-200 disabled:opacity-40"
          >
            Missed
          </button>
          <button
            type="button"
            onClick={() => handleLog('complete')}
            disabled={isCurrentlyProcessing || isCompleteToday}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:bg-emerald-300 disabled:text-emerald-950 disabled:opacity-100"
          >
            {isCurrentlyProcessing ? 'Saving...' : isCompleteToday ? 'Completed' : 'Complete'}
          </button>
        </div>
      </article>

      {isEditModalOpen && (
        <EditHabitModal
          initialTitle={habit.title}
          isSaving={isCurrentlyProcessing}
          onCancel={() => setIsEditModalOpen(false)}
          onSave={handleUpdateHabit}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteHabitModal
          habitName={habit.title}
          isDeleting={isCurrentlyProcessing}
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteHabit}
        />
      )}
    </>
  );
};
