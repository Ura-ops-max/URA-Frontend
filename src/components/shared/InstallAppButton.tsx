import { useState } from 'react';
import { Download, Share, Plus, X } from 'lucide-react';
import { usePwaInstall } from '@/hooks/usePwaInstall';

/**
 * "Download App" button. On Android/Chrome it triggers the native PWA install;
 * on iOS Safari (no install API) it shows the manual Add-to-Home-Screen steps.
 * Renders nothing when the app is already installed or can't be installed.
 */
export default function InstallAppButton({ className = '' }: { className?: string }) {
  const { canInstall, promptInstall, installed, isIos } = usePwaInstall();
  const [showIosHelp, setShowIosHelp] = useState(false);

  if (installed || (!canInstall && !isIos)) return null;

  const handleClick = () => {
    if (canInstall) void promptInstall();
    else if (isIos) setShowIosHelp(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 border-orange-500 bg-white px-4 py-2.5 text-sm font-bold text-orange-600 transition hover:bg-orange-50 active:scale-95 ${className}`}
      >
        <Download size={16} />
        Download App
      </button>

      {isIos && showIosHelp && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setShowIosHelp(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-gray-900">Add URA to Home Screen</h3>
              <button onClick={() => setShowIosHelp(false)} className="text-gray-400">
                <X size={20} />
              </button>
            </div>
            <ol className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                  1
                </span>
                Tap the <Share size={16} className="text-blue-500" /> Share button in Safari
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                  2
                </span>
                Choose <span className="font-bold">Add to Home Screen</span>{' '}
                <Plus size={16} className="text-gray-500" />
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                  3
                </span>
                Tap <span className="font-bold">Add</span> — URA now opens like an app.
              </li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
