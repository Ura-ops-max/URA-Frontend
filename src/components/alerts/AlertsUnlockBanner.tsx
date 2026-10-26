// One-time banner at the top of the dashboard: browsers keep sound off until
// the person taps, so this tap plays a test horn and switches sound on.
import { useState } from 'react';
import { BellRing, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAlerts } from '@/context/alerts-provider';
import { needsHomeScreenHint } from '@/lib/horn';

export default function AlertsUnlockBanner() {
  const { prefs, turnOn } = useAlerts();
  const [hidden, setHidden] = useState(false);
  const [iphoneHint] = useState(() => {
    try {
      return needsHomeScreenHint();
    } catch {
      return false;
    }
  });

  if (hidden || prefs.unlocked || prefs.mode === 'off') return null;

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-orange-100 bg-orange-50/70 p-3 sm:flex-row sm:items-center sm:p-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <BellRing size={20} className="mt-0.5 shrink-0 text-orange-600" aria-hidden />
        <div className="min-w-0 text-sm text-gray-700">
          <p>Hear a short horn when a new notification comes in.</p>
          {iphoneHint && (
            <p className="mt-1 text-xs text-gray-500">Add URA to your home screen to get alerts when the app is closed.</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={async () => {
            const ok = await turnOn();
            if (!ok) toast.info('Your browser is blocking sound. You will still see the pop-ups.');
          }}
          className="h-11 flex-1 rounded-xl bg-orange-600 px-4 text-sm font-bold text-white hover:bg-orange-700 sm:flex-none"
        >
          Turn on alerts
        </button>
        <button
          type="button"
          onClick={() => setHidden(true)}
          aria-label="Not now"
          title="Not now"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-gray-500 hover:bg-orange-100"
        >
          <X size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}
