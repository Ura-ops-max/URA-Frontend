import { useState } from 'react';
import { CheckCircle, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/use-current-user';
import paylukAPI from '@/lib/payluk-axios';

export default function ConfirmPaymentPage() {
  const { user } = useCurrentUser();
  const [escrowId, setEscrowId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleConfirm = async () => {
    const id = escrowId.trim();
    if (!id) {
      toast.error('Escrow ID is required.');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const { data } = await paylukAPI.post(`/escrow/confirm-payment/${id}`, null, {
        headers: { 'customer-id': user?.paylukCustomerId, accept: 'application/json' },
      });
      const msg = data?.message ?? 'Payment confirmed! Funds have been released to the seller.';
      toast.success(msg);
      setResult({ success: true, message: msg });
      setEscrowId('');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to confirm payment.';
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
        <h2 className="text-xl font-black text-gray-900">Confirm Payment to Seller</h2>
        <p className="text-sm text-gray-400 mt-1">
          Confirm delivery and release escrow funds to the seller.
        </p>
      </div>

      <div className="flex gap-3 bg-green-50 rounded-2xl p-4 mb-6">
        <Info size={16} className="text-green-500 shrink-0 mt-0.5" />
        <p className="text-xs text-green-700 leading-relaxed">
          Only confirm payment once you've received your item and are satisfied with it. This action
          releases the escrowed funds to the seller and{' '}
          <span className="font-black">cannot be undone</span>. Use the{' '}
          <span className="font-black">transaction ID</span> from your Purchase Transactions page.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
            Escrow ID (Transaction ID) <span className="text-orange-500">*</span>
          </label>
          <Input
            placeholder="e.g. 6a2a2c68fa797d3af379daf2"
            value={escrowId}
            onChange={(e) => setEscrowId(e.target.value)}
            className="h-11 rounded-xl bg-gray-50 border-gray-100 font-mono font-bold"
          />
          <p className="text-[10px] text-gray-400 mt-1 ml-1">
            This is the <span className="font-bold">id</span> field from your Purchase Transactions
            page, not the payment token.
          </p>
        </div>

        <Button
          onClick={handleConfirm}
          disabled={loading || !escrowId.trim()}
          className="w-full h-12 bg-gray-900 hover:bg-green-600 text-white rounded-xl font-black gap-2 transition-all active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Confirming...
            </>
          ) : (
            <>
              <CheckCircle size={16} /> Confirm Payment to Seller
            </>
          )}
        </Button>
      </div>

      {result && (
        <div
          className={`mt-6 p-4 rounded-2xl flex gap-3 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}
        >
          <span
            className={`text-sm font-black mt-0.5 ${result.success ? 'text-green-600' : 'text-red-500'}`}
          >
            {result.success ? '✓' : '✕'}
          </span>
          <p className={`text-sm font-bold ${result.success ? 'text-green-700' : 'text-red-600'}`}>
            {result.message}
          </p>
        </div>
      )}
    </div>
  );
}
