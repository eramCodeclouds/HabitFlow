import React, { useEffect, useRef, useState } from 'react';

interface HabitActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const HabitActionMenu: React.FC<HabitActionMenuProps> = ({ onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const firstItemRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    firstItemRef.current?.focus();

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'),
    );
    const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      items[(currentIndex + 1) % items.length]?.focus();
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      items[(currentIndex - 1 + items.length) % items.length]?.focus();
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Habit actions"
        onClick={() => setIsOpen((current) => !current)}
        className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.05] text-xl leading-none text-zinc-400 transition hover:bg-white/[0.09] hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
      >
        ⋮
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Habit actions"
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 top-11 z-30 w-44 animate-[fadeIn_140ms_ease-out] overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/95 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          <button
            ref={firstItemRef}
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
            className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white focus:bg-white/[0.06] focus:text-white focus:outline-none"
          >
            Edit Habit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
            className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200 focus:bg-rose-500/10 focus:text-rose-200 focus:outline-none"
          >
            Delete Habit
          </button>
        </div>
      )}
    </div>
  );
};
