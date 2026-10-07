import { useState } from 'react';
import { MessageSquareWarning, Loader2, Paperclip, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/use-current-user';
import paylukAPI from '@/lib/payluk-axios';

export default function RespondToDisputePage() {
  const { user } = useCurrentUser();
  const [paymentToken, setPaymentToken] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async () => {
    const token = paymentToken.trim();
    if (!token) {
      toast.error('Payment token is required.');
      return;
    }
    if (!message.trim()) {
      toast.error('Message is required.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const form = new FormData();
      form.append('message', message.trim());
      if (file) form.append('file', file);

      const { data } = await paylukAPI.post(`/escrow/submit-dispute/${token}`, form, {
        headers: {
          'customer-id': user?.paylukCustomerId,
          'content-type': 'multipart/form-data',
        },
      });
      const msg = data?.message ?? 'Dispute response submitted successfully!';
      toast.success(msg);
      setResult({ success: true, message: msg });
      setPaymentToken('');
      setMessage('');
      setFile(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to submit dispute response.';
      toast.error(msg);
      setResult({ success: false, message: msg });
    } finally {
      setLoading(false);
    }
  };

  if (!user?.paylukCustomerId) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-sm font-bold">Payment profile not set up</p>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <div className="mb-8">
        <h2 className="text-xl font-black text-gray-900">Respond to Dispute</h2>
        <p className="text-sm text-gray-400 mt-1">
          Submit your response to an open dispute.
        </p>
      </div>

      <div className="flex gap-3 bg-orange-50 rounded-2xl p-4 mb-6">
        <Info size={16} className="text-orange-400 shrink-0 mt-0.5" />
        <p className="text-xs text-orange-600 leading-relaxed">
          You can only respond to a dispute after the maximum delivery date has passed. Include any
          supporting evidence in the message or attach a file.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
            Payment Token <span className="text-orange-500">*</span>
          </label>
          <Input
            placeholder="e.g. PY_XrxtqrJ73255"
            value={paymentToken}
            onChange={(e) => setPaymentToken(e.target.value)}
            className="h-11 rounded-xl bg-gray-50 border-gray-100 font-mono font-bold tracking-wider"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
            Message <span className="text-orange-500">*</span>
          </label>
          <textarea
            placeholder="Describe your position in the dispute..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
          />
        </div>

        {/* File upload */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
            Evidence (optional)
          </label>
          {file ? (
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <div className="flex items-center gap-2">
                <Paperclip size={14} className="text-orange-400" />
                <p className="text-xs font-bold text-gray-700 truncate max-w-[200px]">
                  {file.name}
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 rounded-xl px-4 py-3 border border-dashed border-gray-200 hover:border-orange-300 transition-colors">
              <Paperclip size={14} className="text-gray-400" />
              <span className="text-xs font-bold text-gray-400">Attach a file</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || !paymentToken.trim() || !message.trim()}
          className="w-full h-12 bg-gray-900 hover:bg-orange-600 text-white rounded-xl font-black gap-2 transition-all active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Submitting...
            </>
          ) : (
            <>
              <MessageSquareWarning size={16} /> Submit Response
            </>
          )}
        </Button>
      </div>

      {result && (
        <div
          className={`mt-6 p-4 rounded-2xl flex gap-3 items-start ${
            result.success ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              result.success ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <span
              className={`text-xs font-black ${result.success ? 'text-green-600' : 'text-red-500'}`}
            >
              {result.success ? '✓' : '✕'}
            </span>
          </div>
          <p className={`text-sm font-bold ${result.success ? 'text-green-700' : 'text-red-600'}`}>
            {result.message}
          </p>
        </div>
      )}
    </div>
  );
}
