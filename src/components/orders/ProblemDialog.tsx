
// Buyer reports a problem (Buyer-Protected); the seller responds once one is open.
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { paymentsApi, paymentErrorMessage } from '@/lib/payments-api';

export default function ProblemDialog({
  orderId,
  asSeller,
  onClose,
  onDone,
}: {
  orderId: string;
  asSeller: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await paymentsApi.submitDispute(orderId, message.trim(), file);
      toast.success(asSeller ? 'Your response was sent.' : 'Problem reported. URA will look into it.');
      onDone();
    } catch (err: any) {
      toast.error(paymentErrorMessage(err, 'Could not send. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-3xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-black">{asSeller ? 'Respond to problem' : 'Report a problem'}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {asSeller
            ? 'Explain your side. You can respond once.'
            : 'The money stays on hold while URA looks into it. You can report once.'}
        </p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          rows={5}
          placeholder={asSeller ? 'Your response' : 'What went wrong?'}
          className="mt-4 w-full rounded-xl border border-gray-200 p-3 text-base sm:text-sm outline-none focus:ring-2 focus:ring-orange-300"
        />
        <label className="mt-3 block text-xs font-semibold text-gray-600">
          Photo or PDF (optional, up to 5 MB)
          <input
            type="file"
            accept="image/*,application/pdf"
            className="mt-1 block w-full text-xs"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f && f.size > 5 * 1024 * 1024) {
                toast.error('That file is over 5 MB.');
                e.target.value = '';
                return;
              }
              setFile(f);
            }}
          />
        </label>
        <div className="mt-6 flex flex-col-reverse gap-3 min-[380px]:flex-row">
          <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700" onClick={submit} disabled={sending || !message.trim()}>
            {sending ? <Loader2 size={16} className="animate-spin" /> : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}
