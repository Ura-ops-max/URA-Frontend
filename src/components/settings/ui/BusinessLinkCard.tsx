// Shows the business's public page link (ura.com.ng/<slug>) and lets the
// owner copy it or grab a scannable QR code for a physical anchor location.
import { useState } from 'react';
import { Copy, Check, QrCode, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useBusinessQrCode } from '@/hooks/api/use-public-business';

const SITE_ORIGIN = (import.meta.env.VITE_SITE_URL as string | undefined) || window.location.origin;

export default function BusinessLinkCard({ slug }: { slug?: string }) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [locationLabel, setLocationLabel] = useState('');
  const { data: qr, isLoading: qrLoading } = useBusinessQrCode(showQr ? slug : undefined, locationLabel || undefined);

  if (!slug) return null;

  const publicUrl = `${SITE_ORIGIN}/${slug}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — copy it manually');
    }
  };

  return (
    <div className="p-8 border-b border-gray-100 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
          <QrCode size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Your public page</h3>
          <p className="text-sm text-gray-500">Anyone with this link can view and order — no sign-in needed to browse.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          readOnly
          value={publicUrl}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 bg-gray-50"
        />
        <button
          type="button"
          onClick={copyLink}
          className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-gray-800 transition"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
        <button
          type="button"
          onClick={() => setShowQr((v) => !v)}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition"
        >
          <QrCode size={16} />
          {showQr ? 'Hide QR code' : 'Get QR code'}
        </button>
      </div>

      {showQr && (
        <div className="rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row items-center gap-5 bg-gray-50">
          <div>
            <label className="text-xs font-medium text-gray-500">
              Location label (optional — e.g. "wuse2" if this code is for a specific anchor spot)
            </label>
            <input
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              placeholder="e.g. wuse2"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col items-center gap-2 shrink-0">
            {qrLoading ? (
              <div className="w-40 h-40 rounded-lg bg-gray-200 animate-pulse" />
            ) : qr?.qrCodeDataUrl ? (
              <img src={qr.qrCodeDataUrl} alt="QR code" className="w-40 h-40 rounded-lg border border-gray-200 bg-white" />
            ) : null}
            {qr?.qrCodeDataUrl && (
              <a
                href={qr.qrCodeDataUrl}
                download={`${slug}-qr.png`}
                className="flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700"
              >
                <Download size={14} /> Download
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
