// Settings > Alerts: "Horn for new notifications" (saved on this device).
import { BellRing, Check } from 'lucide-react';
import { useAlerts } from '@/context/alerts-provider';
import { HORN_MODE_LABELS, type HornMode } from '@/lib/horn';
import { cn } from '@/lib/utils';

const HINTS: Record<HornMode, string> = {
  all: 'A short horn for every new notification.',
  orders: 'A horn only for order updates, like a new paid order.',
  off: 'No sound. You still see the pop-ups.',
};

export default function AlertSettings() {
  const { prefs, setMode, turnOn } = useAlerts();

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-black text-gray-900">Alerts</h2>
      <p className="mt-1 text-sm text-gray-500">Saved on this device.</p>

      <fieldset className="mt-6">
        <legend className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
          <BellRing size={18} className="text-orange-600" aria-hidden />
          Horn for new notifications
        </legend>
        <div role="radiogroup" aria-label="Horn for new notifications" className="space-y-2">
          {(Object.keys(HORN_MODE_LABELS) as HornMode[]).map((mode) => {
            const on = prefs.mode === mode;
            return (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setMode(mode)}
                className={cn(
                  'flex min-h-14 w-full items-center gap-3 rounded-2xl border p-3 text-left transition',
                  on ? 'border-orange-300 bg-orange-50' : 'border-gray-100 bg-white hover:border-gray-200',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                    on ? 'border-orange-600 bg-orange-600 text-white' : 'border-gray-300',
                  )}
                  aria-hidden
                >
                  {on && <Check size={14} />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-gray-900">{HORN_MODE_LABELS[mode]}</span>
                  <span className="block text-xs text-gray-500">{HINTS[mode]}</span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {!prefs.unlocked && prefs.mode !== 'off' && (
        <button
          type="button"
          onClick={() => void turnOn()}
          className="mt-5 h-11 w-full rounded-xl bg-orange-600 px-4 text-sm font-bold text-white hover:bg-orange-700 sm:w-auto"
        >
          Turn on alerts
        </button>
      )}
    </div>
  );
}
