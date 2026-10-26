// Notification pop-ups at the top of the screen: newest on top, 3 at most,
// each for about 8 seconds. Tapping opens the order (or chat); X closes it.
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Bell, ShoppingBag, X } from 'lucide-react';
import { POPUP_MS, type Popup } from '@/lib/popups';

function PopupCard({ popup, onClose }: { popup: Popup; onClose: (id: string) => void }) {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => onClose(popup.id), POPUP_MS);
    return () => clearTimeout(t);
  }, [popup.id, onClose]);

  const Icon = popup.isOrder ? ShoppingBag : Bell;
  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-2xl bg-gray-900 text-white shadow-2xl animate-in fade-in slide-in-from-top-2">
      <button
        type="button"
        onClick={() => {
          onClose(popup.id);
          if (popup.link) navigate(popup.link);
        }}
        className="flex min-h-14 min-w-0 flex-1 items-center gap-3 py-2 pl-3 text-left"
      >
        <Icon size={20} className="shrink-0 text-orange-400" aria-hidden />
        <span className="line-clamp-2 text-[13px] font-bold leading-snug sm:text-sm">{popup.text}</span>
      </button>
      <button
        type="button"
        onClick={() => onClose(popup.id)}
        aria-label="Close notification"
        title="Close notification"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-400 hover:text-white"
      >
        <X size={18} aria-hidden />
      </button>
    </div>
  );
}

export default function PopupStack({ popups, onClose }: { popups: Popup[]; onClose: (id: string) => void }) {
  if (!popups.length) return null;
  // Top of the screen, inside the phone's safe area; never over the bottom menu.
  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.5rem)] z-[80] mx-auto flex w-[calc(100%-1rem)] max-w-md flex-col gap-2"
    >
      {popups.map((p) => (
        <PopupCard key={p.id} popup={p} onClose={onClose} />
      ))}
    </div>,
    document.body,
  );
}
