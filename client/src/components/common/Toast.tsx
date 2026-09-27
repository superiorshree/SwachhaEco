import { useEffect } from 'react';
import { Bell, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning';
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-sm">
      <div className="bg-[#1d1d1f] text-white p-4 rounded-md shadow-product border border-white/10 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#16793f]/30 text-[#75cf5e] flex items-center justify-center shrink-0 mt-0.5">
          <Bell className="w-4 h-4" />
        </div>
        <div className="flex-1 text-[13px]">
          <span className="font-semibold text-white block">
            {toast.title}
          </span>
          <p className="text-white/80 mt-0.5 leading-snug">
            {toast.message}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-white/40 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
