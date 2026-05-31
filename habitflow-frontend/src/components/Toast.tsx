import React, { useEffect } from 'react';

export type ToastTone = 'success' | 'error';

export interface ToastMessage {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(onDismiss, 3000);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast]);

  if (!toast) return null;

  return (
    <div className="fixed right-5 top-5 z-[120] animate-[toastIn_220ms_ease-out] sm:right-8">
      <div className="flex min-w-72 items-center gap-3 rounded-2xl border border-white/[0.08] bg-zinc-950/95 px-4 py-3 text-sm text-zinc-100 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <span
          className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
            toast.tone === 'success'
              ? 'bg-emerald-400/15 text-emerald-200'
              : 'bg-rose-400/15 text-rose-200'
          }`}
        >
          {toast.tone === 'success' ? '✓' : '!'}
        </span>
        <p className="font-medium">{toast.message}</p>
      </div>
    </div>
  );
};
