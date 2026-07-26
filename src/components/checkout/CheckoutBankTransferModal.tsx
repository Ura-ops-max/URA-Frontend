import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Landmark, Copy, Check, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import paylukAPI from '@/lib/payluk-axios';

interface VirtualAccount {
  accountNumber: string;
  accountName: string;
  bank: string;
  amount: number;
  expiresIn: string;
}

interface CheckoutBankTransferModalProps {
  /** The BUYER's Payluk customer id — the wallet that gets funded. */
  customerId: string;
  /** Payluk escrow id for this order — settled once the wallet is funded. */
  escrowId: string;
  /** What the buyer must transfer (items + shipping + Payluk fee). */
  amount: number;
  /** Our order id — used to build a unique payment reference. */
  orderId: string;
  orderNumber?: string;
  onClose: () => void;
  /** Called once the escrow has been settled from the wallet. */
  onPaid: () => void;
}

type CopiedField = 'accountNumber' | 'bank' | null;
type Phase = 'generating' | 'awaiting' | 'settling' | 'paid' | 'error';

const formatNaira = (n: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(n);

export default function CheckoutBankTransferModal({
  customerId,
  escrowId,
  amount,
  orderId,
  orderNumber,
  onClose,
  onPaid,
}: CheckoutBankTransferModalProps) {
  const [account, setAccount] = useState<VirtualAccount | null>(null);
  const [phase, setPhase] = useState<Phase>('generating');
  const [copied, setCopied] = useState<CopiedField>(null);
  const [error, setError] = useState<string | null>(null);

  // Guards against overlapping settle attempts and post-unmount state writes.
  const settlingRef = useRef(false);
  const mountedRef = useRef(true);

  const generateAccount = useCallback(async () => {
    setPhase('generating');
    setError(null);
    try {
      const { data } = await paylukAPI.post('/payment/virtual-account', null, {
        headers: { 'customer-id': customerId },
      });
      const root = data?.data ?? data;
      const a = root?.account ?? root?.virtualAccount ?? root?.virtual_account ?? root;
      if (!mountedRef.current) return;
      setAccount({
        accountNumber:
          a?.accountNumber ?? a?.account_number ?? a?.accountNo ?? a?.account_no ?? '',
        accountName:
          a?.accountName ?? a?.account_name ?? a?.accountTitle ?? a?.account_title ?? '',
        bank: a?.bank ?? a?.bankName ?? a?.bank_name ?? '',
        expiresIn:
          a?.expiresIn ?? a?.expiresAt ?? a?.expires_at ?? a?.expiry ?? a?.expiryDate ?? '',
        amount: a?.amount ?? 0,
      });
      setPhase('awaiting');
    } catch (err: any) {
      if (!mountedRef.current) return;
      setError(err?.response?.data?.message ?? 'Failed to generate account. Try again.');
      setPhase('error');
    }
  }, [customerId]);

  // Settle the escrow from the (now funded) wallet. Payluk's webhook then flips
  // the order to paid on our backend. Guarded so polling + the manual button
  // never fire two payments at once.
  const settleFromWallet = useCallback(async () => {
    if (settlingRef.current) return;
    settlingRef.current = true;
    setPhase('settling');
    try {
      await paylukAPI.post(
        '/payment/escrow',
        {
          amount,
          reference: `order_${orderId}_${Date.now()}`,
          gateway: 'wallet',
          transactionType: 'escrow',
          escrowDetails: { escrowId: [escrowId] },
        },
        { headers: { 'customer-id': customerId } },
      );
      if (!mountedRef.current) return;
      setPhase('paid');
      toast.success('Payment received — your order is being processed.');
      onPaid();
    } catch (err: any) {
      settlingRef.current = false;
      if (!mountedRef.current) return;
      // Most common cause: funds haven't landed yet. Keep waiting rather than
      // hard-failing so the buyer can retry once the transfer clears.
      setPhase('awaiting');
      const msg = err?.response?.data?.message ?? '';
      toast.error(
        /insufficient|balance/i.test(msg)
          ? "We haven't received your transfer yet. It can take a minute — try again shortly."
          : msg || 'Could not confirm payment yet. Please try again.',
      );
    }
  }, [amount, orderId, escrowId, customerId, onPaid]);

  // Check the wallet balance; auto-settle the moment it covers the amount.
  const checkBalance = useCallback(async (): Promise<boolean> => {
    try {
      const { data } = await paylukAPI.get('/wallet', {
        headers: { 'customer-id': customerId },
      });
      const payload = data?.data ?? data;
      const balance = payload?.mainBalance ?? payload?.balance ?? 0;
      if (balance >= amount && !settlingRef.current) {
        await settleFromWallet();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [customerId, amount, settleFromWallet]);

  // Generate the account once on open.
  const didGenerate = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    if (!didGenerate.current) {
      didGenerate.current = true;
      generateAccount();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [generateAccount]);

  // Poll the wallet every 8s while awaiting the transfer.
  useEffect(() => {
    if (phase !== 'awaiting') return;
    const id = setInterval(() => {
      void checkBalance();
    }, 8000);
    return () => clearInterval(id);
  }, [phase, checkBalance]);

  const copyField = async (field: CopiedField, value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(field);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const busy = phase === 'generating' || phase === 'settling';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={busy ? undefined : onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 bg-gradient-to-r from-orange-500 to-orange-400" />

        {!busy && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
              <Landmark className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-tight">
                Pay by Bank Transfer
              </h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                {orderNumber ? `Order ${orderNumber}` : 'Secure checkout'}
              </p>
            </div>
          </div>

          {phase === 'generating' && (
            <div className="py-10 flex flex-col items-center gap-3 text-gray-400">
              <Loader2 className="h-7 w-7 animate-spin text-orange-400" />
              <p className="text-xs font-bold uppercase tracking-widest">Generating account…</p>
            </div>
          )}

          {phase === 'error' && (
            <div className="py-6 flex flex-col items-center gap-4">
              <p className="text-sm text-red-500 font-semibold text-center">{error}</p>
              <Button
                onClick={generateAccount}
                className="h-11 rounded-xl font-bold gap-2 bg-orange-500 hover:bg-orange-600"
              >
                <RefreshCw size={14} /> Try again
              </Button>
            </div>
          )}

          {phase === 'paid' && (
            <div className="py-10 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <Check className="h-7 w-7 text-green-500" />
              </div>
              <p className="text-sm font-black text-gray-900">Payment confirmed!</p>
              <p className="text-xs text-gray-400 text-center">Your order is being processed.</p>
            </div>
          )}

          {(phase === 'awaiting' || phase === 'settling') && account && (
            <>
              <div className="mb-6 flex items-baseline justify-between rounded-2xl bg-orange-50 px-4 py-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                  Amount to transfer
                </span>
                <span className="text-2xl font-black text-orange-600">{formatNaira(amount)}</span>
              </div>

              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Transfer the <span className="font-bold text-gray-700">exact amount</span> to the
                account below. We'll confirm automatically once it arrives — keep this open.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
                      Bank
                    </p>
                    <p className="text-sm font-bold text-gray-800">{account.bank || '—'}</p>
                  </div>
                  <button
                    onClick={() => copyField('bank', account.bank, 'Bank name')}
                    className="p-2 rounded-lg bg-white shadow-sm hover:shadow transition-all active:scale-95 ml-3"
                  >
                    {copied === 'bank' ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} className="text-gray-400" />
                    )}
                  </button>
                </div>

                {account.accountName && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Account Name
                    </p>
                    <p className="text-sm font-bold text-gray-800">{account.accountName}</p>
                  </div>
                )}

                <div className="flex items-center justify-between bg-orange-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-0.5">
                      Account Number
                    </p>
                    <p className="text-xl font-black tracking-widest text-orange-600">
                      {account.accountNumber || '—'}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      copyField('accountNumber', account.accountNumber, 'Account number')
                    }
                    className="p-2 rounded-lg bg-white shadow-sm hover:shadow transition-all active:scale-95"
                  >
                    {copied === 'accountNumber' ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-center gap-2 text-gray-400">
                {phase === 'settling' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Confirming payment…
                    </span>
                  </>
                ) : (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-orange-300" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Waiting for your transfer…
                    </span>
                  </>
                )}
              </div>

              <Button
                onClick={() => void checkBalance()}
                disabled={busy}
                className="w-full h-12 rounded-xl font-bold gap-2 bg-orange-500 hover:bg-orange-600"
              >
                {phase === 'settling' ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>
                    <RefreshCw size={14} /> I've sent it — check now
                  </>
                )}
              </Button>

              <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
                <ShieldCheck size={14} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Held safely in escrow
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
