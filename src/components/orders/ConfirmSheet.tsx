// A yes/no question: a bottom sheet on phones, a centred card on larger screens.
import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ConfirmSheet({
  icon,
  title,
  text,
  confirmLabel,
  cancelLabel = 'Not now',
  tone = 'orange',
  busy = false,
  children,
  onConfirm,
  onClose,
}: {
  icon?: ReactNode;
  title: string;
  text: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'orange' | 'green' | 'red';
  busy?: boolean;
  children?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm rounded-t-3xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center sm:rounded-3xl sm:pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        {icon && <div className="mx-auto flex justify-center">{icon}</div>}
        <h3 className="mt-3 text-lg font-black">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{text}</p>
        {children}
        <div className="mt-6 flex flex-col-reverse gap-3 min-[380px]:flex-row">
          <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            className={cn(
              'flex-1 h-11 rounded-xl',
              tone === 'green' && 'bg-green-600 hover:bg-green-700',
              tone === 'red' && 'bg-red-600 hover:bg-red-700',
              tone === 'orange' && 'bg-orange-600 hover:bg-orange-700',
            )}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
