import React, { useEffect, useRef } from 'react';

interface DeleteHabitModalProps {
  habitName: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteHabitModal: React.FC<DeleteHabitModalProps> = ({
  habitName,
  isDeleting,
  onCancel,
  onConfirm,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement as HTMLElement | null;
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) {
        onCancel();
        return;
      }

      if (event.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [isDeleting, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[110] grid place-items-center bg-black/60 px-5 backdrop-blur-md animate-[fadeIn_180ms_ease-out]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onCancel();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-habit-title"
        aria-describedby="delete-habit-description"
        className="w-full max-w-md animate-[modalIn_220ms_cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden rounded-[1.75rem] border border-white/[0.1] bg-zinc-950 shadow-2xl shadow-black/50"
      >
        <div className="h-1 bg-gradient-to-r from-rose-400 via-amber-200 to-rose-300" />

        <div className="p-6 sm:p-7">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/10 text-3xl ring-1 ring-rose-300/15">
            ⚠️
          </div>

          <h2 id="delete-habit-title" className="mt-5 text-2xl font-semibold tracking-tight text-zinc-50">
            ⚠️ Delete Habit
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            This will permanently remove <span className="font-medium text-zinc-200">{habitName}</span>.
          </p>

          <div
            id="delete-habit-description"
            className="mt-5 rounded-3xl bg-white/[0.045] p-4 text-sm leading-7 text-zinc-300 ring-1 ring-white/[0.06]"
          >
            <p>This will permanently remove:</p>
            <ul className="mt-2 space-y-1 text-zinc-400">
              <li>• Habit history</li>
              <li>• Streak progress</li>
              <li>• Completion records</li>
            </ul>
            <p className="mt-3 font-medium text-rose-200">This action cannot be undone.</p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="rounded-full bg-white/[0.06] px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.1] hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isDeleting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {isDeleting ? 'Deleting...' : 'Delete Habit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
