import { useState } from 'react';
import { BadgeCheck, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/use-current-user';
import paylukAPI from '@/lib/payluk-axios';

export default function ClaimFundsPage() {
  const { user } = useCurrentUser();
  const [paymentToken, setPaymentToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleClaim = async () => {
    const token = paymentToken.trim();
    if (!token) {
      toast.error('Please enter a payment token.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await paylukAPI.get(`/escrow/claim-funds/${token}`, {
        headers: { 'customer-id': user?.paylukCustomerId, accept: 'application/json' },
      });
      const message = data?.message ?? 'Funds claimed successfully!';
      toast.success(message);
      setResult({ success: true, message });
      setPaymentToken('');
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Failed to claim funds.';
      toast.error(message);
      setResult({ success: false, message });
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
        <h2 className="text-xl font-black text-gray-900">Claim Funds</h2>
        <p className="text-sm text-gray-400 mt-1">
          Enter the payment token of the order you'd like to claim.
        </p>
      </div>

      {/* Info box */}
      <div className="flex gap-3 bg-orange-50 rounded-2xl p-4 mb-6">
        <Info size={16} className="text-orange-400 shrink-0 mt-0.5" />
        <p className="text-xs text-orange-600 leading-relaxed">
          Funds can only be claimed after the buyer confirms delivery or the maximum delivery date
          has passed. Copy the payment token from your{' '}
          <span className="font-black">Sales Transactions</span> page.
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

        <Button
          onClick={handleClaim}
          disabled={loading || !paymentToken.trim()}
          className="w-full h-12 bg-gray-900 hover:bg-orange-600 text-white rounded-xl font-black gap-2 transition-all active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Claiming...
            </>
          ) : (
            <>
              <BadgeCheck size={16} /> Claim Funds
            </>
          )}
        </Button>
      </div>

      {/* Result feedback */}
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
