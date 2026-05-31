import React, { useEffect, useRef, useState } from 'react';

interface EditHabitModalProps {
  initialTitle: string;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (title: string) => void;
}

export const EditHabitModal: React.FC<EditHabitModalProps> = ({
  initialTitle,
  isSaving,
  onCancel,
  onSave,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    inputRef.current?.select();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) {
        onCancel();
        return;
      }

      if (event.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
  }, [isSaving, onCancel]);

  const trimmedTitle = title.trim();
  const canSave = trimmedTitle.length >= 3 && trimmedTitle !== initialTitle;

  return (
    <div
      className="fixed inset-0 z-[110] grid place-items-center bg-black/60 px-5 backdrop-blur-md animate-[fadeIn_180ms_ease-out]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          onCancel();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-habit-title"
        className="w-full max-w-md animate-[modalIn_220ms_cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden rounded-[1.75rem] border border-white/[0.1] bg-zinc-950 shadow-2xl shadow-black/50"
      >
        <div className="h-1 bg-gradient-to-r from-emerald-300 via-blue-300 to-zinc-200" />

        <form
          className="p-6 sm:p-7"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSave && !isSaving) {
              onSave(trimmedTitle);
            }
          }}
        >
          <h2 id="edit-habit-title" className="text-2xl font-semibold tracking-tight text-zinc-50">
            Edit Habit
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Rename this habit without changing its streak history.
          </p>

          <label className="mt-6 block text-sm font-medium text-zinc-300" htmlFor="edit-habit-name">
            Habit name
          </label>
          <input
            ref={inputRef}
            id="edit-habit-name"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isSaving}
            className="mt-2 w-full rounded-2xl bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none ring-1 ring-white/[0.08] placeholder:text-zinc-600 transition focus:ring-emerald-300/40 disabled:opacity-50"
          />

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="rounded-full bg-white/[0.06] px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.1] hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSave || isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-white/[0.08] disabled:text-zinc-600"
            >
              {isSaving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500/30 border-t-zinc-950" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
