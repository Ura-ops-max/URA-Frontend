// Shop Orders: turn on the new-order horn, and the mute switch.
import { BellRing, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useOrderAlerts } from '@/context/order-alerts-provider';

export default function OrderAlertsPanel() {
  const { settings, turnOn, setSound } = useOrderAlerts();

  if (!settings.enabled) {
    return (
      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-orange-100 bg-orange-50/60 p-4 sm:flex-row sm:items-center">
        <BellRing size={20} className="shrink-0 text-orange-600" />
        <p className="flex-1 text-sm text-gray-700">Hear a short horn when a customer pays, while URA is open.</p>
        <Button
          onClick={async () => {
            const ok = await turnOn();
            if (!ok) toast.error('Your browser blocked the sound. Check that this tab is not muted.');
          }}
          className="h-11 rounded-xl bg-orange-600 font-bold hover:bg-orange-700 sm:h-9"
        >
          Turn on order alerts
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-5 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
      {settings.sound ? (
        <Volume2 size={20} className="shrink-0 text-green-600" />
      ) : (
        <VolumeX size={20} className="shrink-0 text-gray-400" />
      )}
      <p className="flex-1 text-sm text-gray-700">
        Order alerts are on. Horn sound is {settings.sound ? 'on' : 'off'}.
      </p>
      <button
        role="switch"
        aria-checked={settings.sound}
        aria-label="Horn sound"
        onClick={() => setSound(!settings.sound)}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full transition',
          settings.sound ? 'bg-green-500' : 'bg-gray-300',
        )}
      >
        <span
          className={cn(
            'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all',
            settings.sound ? 'left-6' : 'left-1',
          )}
        />
      </button>
    </div>
  );
}
