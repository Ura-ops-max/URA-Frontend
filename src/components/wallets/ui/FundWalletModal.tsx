import { useState, useEffect, useRef } from 'react';
import { X, Landmark, Copy, Check, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import paylukAPI from '@/lib/payluk-axios';

interface VirtualAccount {
  accountNumber: string;
  accountName: string;
  bank: string;
  bankCode: string;
  amount: number;
  expiresIn: string;
}

interface FundWalletModalProps {
  customerId: string;
  onClose: () => void;
}

type CopiedField = 'accountNumber' | 'bank' | null;

export default function FundWalletModal({ customerId, onClose }: FundWalletModalProps) {
  const [account, setAccount] = useState<VirtualAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<CopiedField>(null);

  const generateAccount = async () => {
    setIsLoading(true);
    try {
      const { data } = await paylukAPI.post('/payment/virtual-account', null, {
        headers: { 'customer-id': customerId },
      });

      // Log raw payload so the exact Payluk shape is visible in the console.
      console.log('[FundWallet] virtual-account response:', data);

      // Payluk may wrap the account one or two levels deep and use different
      // key casings — normalise all the likely shapes into our VirtualAccount.
      const root = data?.data ?? data;
      const a = root?.account ?? root?.virtualAccount ?? root?.virtual_account ?? root;

      setAccount({
        accountNumber:
          a?.accountNumber ?? a?.account_number ?? a?.accountNo ?? a?.account_no ?? '',
        accountName:
          a?.accountName ?? a?.account_name ?? a?.accountTitle ?? a?.account_title ?? '',
        bank: a?.bank ?? a?.bankName ?? a?.bank_name ?? '',
        bankCode: a?.bankCode ?? a?.bank_code ?? '',
        amount: a?.amount ?? 0,
        expiresIn:
          a?.expiresIn ?? a?.expiresAt ?? a?.expires_at ?? a?.expiry ?? a?.expiryDate ?? '',
      });
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Failed to generate account. Try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyField = async (field: CopiedField, value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(field);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  // Generate an account once when the modal opens. Using a ref guard prevents
  // React StrictMode's double-invoke (and re-renders) from firing duplicate
  // requests — the previous render-time call hammered the API on every render.
  const didGenerate = useRef(false);
  useEffect(() => {
    if (didGenerate.current) return;
    didGenerate.current = true;
    generateAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // Click-outside overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Stop propagation so clicking the card itself doesn't close */}
      <div
        className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 bg-gradient-to-r from-orange-500 to-orange-400" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
              <Landmark className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-tight">Fund Your Wallet</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                Bank Transfer · Nigeria only
              </p>
            </div>
          </div>

          {isLoading && (
            <div className="py-10 flex flex-col items-center gap-3 text-gray-400">
              <Loader2 className="h-7 w-7 animate-spin text-orange-400" />
              <p className="text-xs font-bold uppercase tracking-widest">Generating account...</p>
            </div>
          )}

          {!isLoading && account && (
            <>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Transfer any amount to the account below. Your wallet will be credited once the
                transfer is confirmed.
              </p>

              <div className="space-y-3 mb-6">
                {/* Bank name — copyable */}
                <CopyRow
                  label="Bank"
                  value={account.bank}
                  isCopied={copied === 'bank'}
                  onCopy={() => copyField('bank', account.bank, 'Bank name')}
                />

                <DetailRow label="Account Name" value={account.accountName} />

                {/* Account number — highlighted + copyable */}
                <div className="flex items-center justify-between bg-orange-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-0.5">
                      Account Number
                    </p>
                    <p className="text-xl font-black tracking-widest text-orange-600">
                      {account.accountNumber}
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

                <DetailRow label="Expires" value={account.expiresIn} />
              </div>

              <p className="text-[11px] text-gray-400 text-center mb-4 leading-relaxed">
                This is a one-time virtual account. Generate a new one for each deposit.
              </p>

              <Button
                variant="outline"
                onClick={generateAccount}
                className="w-full h-11 rounded-xl font-bold gap-2 border-gray-200"
              >
                <RefreshCw size={14} />
                Generate New Account
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  );
}

function CopyRow({
  label,
  value,
  isCopied,
  onCopy,
}: {
  label: string;
  value: string;
  isCopied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
          {label}
        </p>
        <p className="text-sm font-bold text-gray-800">{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="p-2 rounded-lg bg-white shadow-sm hover:shadow transition-all active:scale-95 ml-3"
      >
        {isCopied ? (
          <Check size={14} className="text-green-500" />
        ) : (
          <Copy size={14} className="text-gray-400" />
        )}
      </button>
    </div>
  );
}
