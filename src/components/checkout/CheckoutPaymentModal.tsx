import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Copy, Check, Loader2, RefreshCw, Wallet, ShieldCheck, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useEscrowCheckout } from 'payluk-escrow-inline-checkout/react';
import { Button } from '@/components/ui/button';
import paylukAPI from '@/lib/payluk-axios';
import { BASE_ROUTE } from '@/routes/common/routePaths.ts';

interface VirtualAccount {
  accountNumber: string;
  accountName: string;
  bank: string;
}

interface CheckoutPaymentModalProps {
  /** The BUYER's Payluk customer id. */
  customerId: string;
  /** Payluk escrow id for this order — the seller's receiving escrow. */
  escrowId: string;
  /** Payluk payment token — powers the inline (popup) card/bank checkout. */
  paymentToken?: string;
  /** Finalised total the buyer must pay (product + delivery + Payluk fee). */
  amount: number;
  /** Our order id — used to build a unique payment reference. */
  orderId: string;
  orderNumber?: string;
  onClose: () => void;
  /** Called once the escrow has been settled (order is paid). */
  onPaid: () => void;
}

type CopiedField = 'accountNumber' | 'bank' | null;
type Phase = 'loading' | 'ready' | 'settling' | 'paid';

const formatNaira = (n: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(n);

export default function CheckoutPaymentModal({
  customerId,
  escrowId,
  paymentToken,
  amount,
  orderId,
  orderNumber,
  onClose,
  onPaid,
}: CheckoutPaymentModalProps) {
  const [account, setAccount] = useState<VirtualAccount | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [copied, setCopied] = useState<CopiedField>(null);
  // Which payment path the buyer picked after "Proceed to Pay": the choice
  // screen, or the escrow (wallet / bank transfer) flow. "Normal" opens the
  // Payluk popup directly, so it has no sub-screen here.
  const [method, setMethod] = useState<'choose' | 'escrow'>('choose');
  const { pay } = useEscrowCheckout();

  const settlingRef = useRef(false);
  const mountedRef = useRef(true);

  // ── Generate the seller's receiving (virtual) account for external transfer.
  const generateAccount = useCallback(async () => {
    setAccountError(null);
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
      });
    } catch (err: any) {
      if (!mountedRef.current) return;
      setAccountError(err?.response?.data?.message ?? 'Could not generate a transfer account.');
    }
  }, [customerId]);

  // ── Read the buyer's wallet balance.
  const fetchBalance = useCallback(async (): Promise<number> => {
    try {
      const { data } = await paylukAPI.get('/wallet', {
        headers: { 'customer-id': customerId },
      });
      const payload = data?.data ?? data;
      const balance = payload?.mainBalance ?? payload?.balance ?? 0;
      if (mountedRef.current) setWalletBalance(balance);
      return balance;
    } catch {
      if (mountedRef.current) setWalletBalance((b) => b ?? 0);
      return 0;
    }
  }, [customerId]);

  // ── Settle the escrow from the (now funded) wallet. Payluk's webhook flips the
  // order to paid on our backend. Guarded so polling + buttons never double-fire.
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
      setPhase('ready');
      const msg = err?.response?.data?.message ?? '';
      toast.error(
        /insufficient|balance/i.test(msg)
          ? "We haven't received your transfer yet — it can take a minute. Try again shortly."
          : msg || 'Could not confirm payment yet. Please try again.',
      );
    }
  }, [amount, orderId, escrowId, customerId, onPaid]);

  // Poll: the moment the wallet covers the amount (e.g. an external transfer
  // landed), settle automatically.
  const checkAndSettle = useCallback(async () => {
    const balance = await fetchBalance();
    if (balance >= amount && !settlingRef.current) {
      await settleFromWallet();
    }
  }, [fetchBalance, amount, settleFromWallet]);

  // "Normal payment" — opens Payluk's inline checkout popup (card / bank / USSD),
  // like a standard Paystack-style checkout. It still settles this escrow, so the
  // webhook marks the order paid the same way.
  const payWithPopup = useCallback(async () => {
    if (!paymentToken) {
      toast.error('Card payment is unavailable for this order — use wallet or transfer.');
      return;
    }
    try {
      await pay({
        paymentToken,
        reference: `pop_${orderId}_${Date.now()}`,
        redirectUrl: `${window.location.origin}${BASE_ROUTE.PAYLUK_PAYMENT_COMPLETE}`,
        brand: import.meta.env.VITE_APP_NAME ?? 'URA',
        customerId,
        callback: () => {
          setPhase('paid');
          toast.success('Payment successful — your order is being processed.');
          onPaid();
        },
        onClose: () => {
          toast.info('Payment window closed.');
        },
      });
    } catch (err: any) {
      toast.error(err?.message || 'Could not open the payment window. Please try again.');
    }
  }, [paymentToken, pay, orderId, customerId, onPaid]);

  // Initial load: balance + account together.
  const didInit = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    if (!didInit.current) {
      didInit.current = true;
      Promise.all([fetchBalance(), generateAccount()]).finally(() => {
        if (mountedRef.current) setPhase('ready');
      });
    }
    return () => {
      mountedRef.current = false;
    };
  }, [fetchBalance, generateAccount]);

  // Poll every 8s while the buyer is on the transfer step.
  useEffect(() => {
    if (phase !== 'ready') return;
    const id = setInterval(() => void checkAndSettle(), 8000);
    return () => clearInterval(id);
  }, [phase, checkAndSettle]);

  const copyField = async (field: CopiedField, value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(field);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const busy = phase === 'settling' || phase === 'loading';
  const canPayFromWallet = walletBalance != null && walletBalance >= amount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={busy ? undefined : onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 h-1.5 bg-linear-to-r from-orange-500 to-orange-400" />

        {!busy && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-tight">Complete Payment</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                {orderNumber ? `Order ${orderNumber}` : 'Held safely in escrow'}
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="mb-6 flex items-baseline justify-between rounded-2xl bg-orange-50 px-4 py-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
              Total to pay
            </span>
            <span className="text-2xl font-black text-orange-600">{formatNaira(amount)}</span>
          </div>

          {phase === 'loading' && (
            <div className="py-10 flex flex-col items-center gap-3 text-gray-400">
              <Loader2 className="h-7 w-7 animate-spin text-orange-400" />
              <p className="text-xs font-bold uppercase tracking-widest">Preparing payment…</p>
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

          {(phase === 'ready' || phase === 'settling') && method === 'choose' && (
            <>
              <p className="text-sm text-gray-500 mb-4">Choose how you'd like to pay:</p>

              {/* Normal payment — Payluk popup (card / bank / USSD) */}
              {paymentToken && (
                <button
                  onClick={() => void payWithPopup()}
                  disabled={busy}
                  className="group w-full flex items-center gap-4 rounded-2xl border-2 border-gray-100 p-4 text-left transition hover:border-gray-900 hover:bg-gray-50 disabled:opacity-50 mb-3"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900">Normal Payment</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Instant checkout — card, bank transfer or USSD
                    </p>
                  </div>
                </button>
              )}

              {/* Escrow — buyer protection, pay from wallet or bank transfer */}
              <button
                onClick={() => setMethod('escrow')}
                className="group w-full flex items-center gap-4 rounded-2xl border-2 border-gray-100 p-4 text-left transition hover:border-orange-500 hover:bg-orange-50/40"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900">Pay with Escrow</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Protected — held until you confirm delivery
                  </p>
                </div>
              </button>
            </>
          )}

          {(phase === 'ready' || phase === 'settling') && method === 'escrow' && (
            <>
              <button
                onClick={() => setMethod('choose')}
                className="mb-4 text-xs font-bold text-gray-400 hover:text-gray-600"
              >
                ← Payment options
              </button>

              {/* ── Option 1: Pay from wallet ─────────────────────────── */}
              <div className="rounded-2xl border border-gray-100 p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-gray-500">
                    <Wallet size={16} className="text-orange-500" />
                    Wallet balance
                  </span>
                  <span className="text-sm font-black text-gray-900">
                    {walletBalance == null ? '—' : formatNaira(walletBalance)}
                  </span>
                </div>
                <Button
                  onClick={() => void settleFromWallet()}
                  disabled={!canPayFromWallet || busy}
                  className="w-full h-12 rounded-xl font-bold gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
                >
                  {phase === 'settling' ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Wallet size={16} />
                  )}
                  Pay {formatNaira(amount)} from Wallet
                </Button>
                {!canPayFromWallet && walletBalance != null && (
                  <p className="mt-2 text-center text-[11px] leading-relaxed text-gray-400">
                    Not enough balance — pay by bank transfer below (no wallet top-up needed).
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                  or bank transfer
                </span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>

              {/* ── Option 2: External bank transfer ──────────────────── */}
              {accountError ? (
                <div className="flex flex-col items-center gap-3 py-2">
                  <p className="text-xs text-red-500 font-semibold text-center">{accountError}</p>
                  <Button
                    variant="outline"
                    onClick={() => void generateAccount()}
                    className="h-10 rounded-xl font-bold gap-2 border-gray-200"
                  >
                    <RefreshCw size={14} /> Try again
                  </Button>
                </div>
              ) : !account ? (
                <div className="py-4 flex items-center justify-center gap-2 text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Generating account…
                  </span>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                    Transfer the <span className="font-bold text-gray-700">exact amount</span> to the
                    account below from any bank app. We confirm automatically — keep this open.
                  </p>

                  <div className="space-y-3 mb-5">
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
                    <Loader2 className="h-4 w-4 animate-spin text-orange-300" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {phase === 'settling' ? 'Confirming payment…' : 'Waiting for your transfer…'}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => void checkAndSettle()}
                    disabled={busy}
                    className="w-full h-11 rounded-xl font-bold gap-2 border-gray-200"
                  >
                    <RefreshCw size={14} /> I've sent it — check now
                  </Button>
                </>
              )}

              <div className="mt-5 flex items-center justify-center gap-2 text-gray-400">
                <ShieldCheck size={14} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Held safely in escrow until delivery
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
