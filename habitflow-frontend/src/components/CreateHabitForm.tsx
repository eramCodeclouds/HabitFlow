import React, { useState } from 'react';
import { useHabitStore } from '../store/useHabitStore';

export const CreateHabitForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [createdHabitName, setCreatedHabitName] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const { addHabit, fetchHabits, isLoading } = useHabitStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const habitName = title.trim();
    if (!habitName || isLoading) return;

    try {
      await addHabit(habitName);
      setCreatedHabitName(habitName);
      setTitle('');
      setIsSuccessModalOpen(true);
    } catch {
      // Store catches runtime validation display variables internally
    }
  };

  const closeSuccessModal = async () => {
    setIsSuccessModalOpen(false);
    await fetchHabits();
  };

  return (
    <>
      <div className="rounded-3xl bg-white/[0.05] p-5 shadow-2xl shadow-black/10 sm:p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-zinc-100">Add Habit</h3>
          <p className="mt-1 text-sm text-zinc-500">Choose something small enough to repeat.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Habit name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Walk for 10 minutes"
              disabled={isLoading}
              className="w-full rounded-2xl bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none ring-1 ring-white/[0.06] placeholder:text-zinc-600 transition focus:ring-emerald-300/40 disabled:opacity-40"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:bg-white/[0.08] disabled:text-zinc-600 active:scale-[0.99]"
          >
            {isLoading ? 'Saving...' : 'Create Habit'}
          </button>
        </form>
      </div>

      {isSuccessModalOpen && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/55 px-5 backdrop-blur-md animate-[fadeIn_180ms_ease-out]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="habit-added-title"
        >
          <div className="w-full max-w-md animate-[modalIn_220ms_cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden rounded-[1.75rem] border border-white/[0.1] bg-zinc-950 shadow-2xl shadow-black/50">
            <div className="h-1 bg-gradient-to-r from-emerald-300 via-blue-300 to-amber-200" />

            <div className="p-6 sm:p-7">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.06] text-3xl ring-1 ring-white/[0.08]">
                ✨
              </div>

              <div className="mt-5 text-center">
                <h2 id="habit-added-title" className="text-2xl font-semibold tracking-tight text-zinc-50">
                  ✨ Habit Added
                </h2>
                <p className="mt-3 text-lg font-medium text-emerald-100">"{createdHabitName}"</p>
                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-zinc-400">
                  Your journey starts today.{'\n'}Stay consistent and build momentum.
                </p>
              </div>

              <div className="mt-6 rounded-3xl bg-white/[0.045] p-5 text-center ring-1 ring-white/[0.06]">
                <p className="text-sm font-semibold text-amber-100">🔥 First Goal</p>
                <p className="mt-2 text-3xl font-semibold text-zinc-50">3-Day Streak</p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={closeSuccessModal}
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 active:scale-[0.99] sm:order-2"
                >
                  Start Tracking
                </button>
                <button
                  type="button"
                  onClick={closeSuccessModal}
                  className="rounded-full bg-white/[0.06] px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.1] hover:text-white active:scale-[0.99] sm:order-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
