import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  ChevronRight,
  Check,
  Loader2,
  ArrowLeft,
  Landmark,
  AlertCircle,
  CheckCircle2,
  Banknote,
  X,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useBanks, getBankCategory, type Bank, type BankCategory } from '@/hooks/api/use-banks';
import { useWalletBalance } from '@/hooks/api/use-wallet-balance';
import paylukAPI from '@/lib/payluk-axios';

// ── helpers ──────────────────────────────────────────────────────────────────

function formatNGN(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
}

function genRef() {
  return `WDR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

const CATEGORIES: BankCategory[] = [
  'All',
  'Commercial',
  'Digital',
  'Microfinance',
  'Mortgage',
  'Finance',
];

const CATEGORY_COLORS: Record<BankCategory, string> = {
  All: 'bg-gray-900 text-white border-gray-900',
  Commercial: 'bg-blue-600 text-white border-blue-600',
  Digital: 'bg-purple-600 text-white border-purple-600',
  Microfinance: 'bg-orange-500 text-white border-orange-500',
  Mortgage: 'bg-teal-600 text-white border-teal-600',
  Finance: 'bg-green-600 text-white border-green-600',
};

const CATEGORY_INACTIVE = 'bg-white text-gray-500 border-gray-200 hover:border-gray-400';

// ── Step types ────────────────────────────────────────────────────────────────
type Step = 'bank' | 'details' | 'review' | 'done';

interface IntentData {
  id: string;
  amount: number;
  reference: string;
  fee: number;
  status: string;
  withdrawalDetails: {
    bankCode: string;
    accountNumber: string;
    accountName: string;
    bankName: string;
  };
  createdAt: string;
}

// ── Bank card ─────────────────────────────────────────────────────────────────
function BankCard({
  bank,
  selected,
  onClick,
}: {
  bank: Bank;
  selected: boolean;
  onClick: () => void;
}) {
  const initials = bank.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
        selected
          ? 'border-orange-400 bg-orange-50 shadow-sm'
          : 'border-gray-100 hover:border-orange-200 hover:bg-gray-50'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${
          selected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
        }`}
      >
        {initials}
      </div>
      <p className="text-sm font-bold text-gray-800 flex-1 truncate">{bank.name}</p>
      {selected && <Check size={14} className="text-orange-500 shrink-0" />}
    </button>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepDots({ step }: { step: Step }) {
  const steps: Step[] = ['bank', 'details', 'review', 'done'];
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.slice(0, 3).map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
              i < idx
                ? 'bg-orange-500 text-white'
                : i === idx
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-400'
            }`}
          >
            {i < idx ? <Check size={12} /> : i + 1}
          </div>
          {i < 2 && (
            <div
              className={`h-0.5 w-8 rounded-full ${i < idx ? 'bg-orange-400' : 'bg-gray-100'}`}
            />
          )}
        </div>
      ))}
      <span className="ml-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
        {step === 'bank'
          ? 'Select Bank'
          : step === 'details'
            ? 'Account Details'
            : step === 'review'
              ? 'Confirm'
              : 'Done'}
      </span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WithdrawalPage() {
  const { user } = useCurrentUser();
  const { data: banks = [], isLoading: banksLoading } = useBanks();

  const [step, setStep] = useState<Step>('bank');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<BankCategory>('All');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);

  // details step
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [amount, setAmount] = useState('');
  const [holderName, setHolderName] = useState(
    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
  );
  const [holderPhone, setHolderPhone] = useState(user?.phone ?? '');

  // intent / confirm
  const [intentLoading, setIntentLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [intent, setIntent] = useState<IntentData | null>(null);
  const [confirmedIntent, setConfirmedIntent] = useState<IntentData | null>(null);
  const [reference, setReference] = useState(genRef);

  const customerId = user?.paylukCustomerId;
  const { data: walletBalance } = useWalletBalance(customerId);
  const mainBalance = walletBalance?.mainBalance ?? 0;

  // auto-verify when account number reaches 10 digits
  const verifyRef = useRef(false);
  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank && !verifyRef.current) {
      verifyRef.current = true;
      verifyAccount(accountNumber, selectedBank);
    }
    if (accountNumber.length < 10) {
      verifyRef.current = false;
      setVerified(false);
      setAccountName('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountNumber, selectedBank]);

  // ── filtered banks ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = banks;
    if (category !== 'All') list = list.filter((b) => getBankCategory(b) === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((b) => b.name.toLowerCase().includes(q) || b.code.includes(q));
    }
    return list;
  }, [banks, category, query]);

  // ── verify account ────────────────────────────────────────────────────────
  const verifyAccount = async (acctNum = accountNumber, bank = selectedBank) => {
    if (!bank || acctNum.length < 10) return;
    setVerifying(true);
    setVerified(false);
    setAccountName('');
    try {
      // Try with real bank code first; fall back to "001" on test-limit errors
      const tryVerify = async (code: string) =>
        paylukAPI.post(
          '/payment/verify-account',
          {
            accountNumber: acctNum,
            bankCode: code,
            bankName: bank.name,
          },
          { headers: { 'customer-id': customerId } },
        );

      let resp;
      try {
        resp = await tryVerify(bank.code);
      } catch (firstErr: any) {
        const msg: string = firstErr?.response?.data?.message ?? '';
        if (/daily limit|live bank resolves exceeded/i.test(msg)) {
          resp = await tryVerify('001');
        } else {
          throw firstErr;
        }
      }

      const payload = resp.data?.data ?? resp.data;
      const name = payload?.accountName ?? payload?.account_name ?? payload?.name;
      if (!name) throw new Error('Could not retrieve account name');
      setAccountName(name);
      setVerified(true);
      toast.success('Account verified!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Account verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  // ── create intent ─────────────────────────────────────────────────────────
  const createIntent = async () => {
    const amt = Number(amount);
    if (!verified || !amt || amt <= 0) return;

    if (amt > mainBalance) {
      toast.error(`Insufficient balance. Your main balance is ${formatNGN(mainBalance)}.`);
      return;
    }

    setIntentLoading(true);
    try {
      const { data } = await paylukAPI.post(
        '/payment/create-intent',
        {
          amount: amt,
          reference,
          transactionType: 'withdrawal',
          withdrawalDetails: {
            bankCode: selectedBank!.code,
            accountNumber,
            accountName,
            bankName: selectedBank!.name,
          },
        },
        { headers: { 'customer-id': customerId } },
      );
      setIntent(data?.data ?? data);
      setStep('review');
    } catch (err: any) {
      setReference(genRef()); // fresh ref on failure
      toast.error(err?.response?.data?.message ?? 'Failed to create withdrawal intent.');
    } finally {
      setIntentLoading(false);
    }
  };

  // ── confirm withdrawal ────────────────────────────────────────────────────
  const confirmWithdrawal = async () => {
    if (!intent) return;
    setConfirmLoading(true);
    try {
      const { data } = await paylukAPI.post(
        '/payment/verify',
        {
          reference: intent.reference,
        },
        { headers: { 'customer-id': customerId } },
      );
      setConfirmedIntent(data?.data ?? data);
      setStep('done');
      toast.success('Withdrawal processed successfully!');
    } catch (err: any) {
      setReference(genRef()); // fresh ref on failure
      toast.error(err?.response?.data?.message ?? 'Failed to confirm withdrawal.');
    } finally {
      setConfirmLoading(false);
    }
  };

  if (!customerId) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-sm font-bold">Payment profile not set up</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP: BANK SELECTION
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'bank') {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-black text-gray-900">Withdraw Funds</h2>
          <p className="text-xs text-gray-400 mt-1">Select your destination bank account</p>
        </div>

        <StepDots step="bank" />

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bank name or code…"
            className="pl-9 h-11 rounded-xl border-gray-100 bg-gray-50 focus:bg-white text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 flex-wrap mb-5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors ${
                category === c ? CATEGORY_COLORS[c] : CATEGORY_INACTIVE
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Bank list */}
        {banksLoading ? (
          <div className="py-16 flex flex-col items-center gap-3 opacity-40">
            <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Loading banks…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Landmark size={24} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-400">No banks found</p>
            <button
              onClick={() => {
                setQuery('');
                setCategory('All');
              }}
              className="mt-2 text-xs text-orange-500 font-bold"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filtered.map((bank) => (
              <BankCard
                key={bank.id}
                bank={bank}
                selected={selectedBank?.id === bank.id}
                onClick={() => setSelectedBank(bank)}
              />
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100">
          <Button
            onClick={() => setStep('details')}
            disabled={!selectedBank}
            className="w-full h-12 bg-gray-900 hover:bg-orange-500 text-white rounded-xl font-black gap-2 transition-all active:scale-95"
          >
            Continue <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP: ACCOUNT DETAILS
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'details') {
    return (
      <div>
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setStep('bank')}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900">Account Details</h2>
            <p className="text-xs text-gray-400 mt-0.5">Enter your bank account information</p>
          </div>
        </div>

        <StepDots step="details" />

        <div className="space-y-4">
          {/* Selected bank (read-only) */}
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white text-xs font-black shrink-0">
              {selectedBank!.name
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0])
                .join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-gray-900 truncate">{selectedBank!.name}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Code: {selectedBank!.code}
              </p>
            </div>
            <button
              onClick={() => setStep('bank')}
              className="text-[10px] font-black text-orange-500 uppercase tracking-widest"
            >
              Change
            </button>
          </div>

          {/* Balance indicator */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
            <Wallet size={14} className="text-blue-500 shrink-0" />
            <p className="text-xs font-bold text-blue-700">
              Available balance: <span className="font-black">{formatNGN(mainBalance)}</span>
            </p>
          </div>

          {/* Account number — auto-verifies at 10 digits */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
              Account Number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Input
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                  verifyRef.current = false;
                  setVerified(false);
                  setAccountName('');
                }}
                placeholder="0123456789"
                maxLength={10}
                className="h-11 rounded-xl border-gray-100 bg-gray-50 focus:bg-white font-mono pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {verifying && <Loader2 size={14} className="animate-spin text-orange-400" />}
                {verified && !verifying && <CheckCircle2 size={14} className="text-green-500" />}
              </div>
            </div>
            {accountNumber.length > 0 && accountNumber.length < 10 && (
              <p className="text-[10px] text-gray-400 mt-1 font-bold">
                {10 - accountNumber.length} more digit{10 - accountNumber.length !== 1 ? 's' : ''}{' '}
                needed
              </p>
            )}
            {accountNumber.length === 10 && verifying && (
              <p className="text-[10px] text-orange-500 mt-1 font-bold">Verifying account…</p>
            )}
          </div>

          {/* Account name (verified) */}
          {verified && accountName && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 border border-green-100">
              <CheckCircle2 size={16} className="text-green-500 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Account Name
                </p>
                <p className="text-sm font-black text-gray-900">{accountName}</p>
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
              Amount (NGN) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">
                ₦
              </span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setReference(genRef());
                }}
                placeholder="0.00"
                min="0"
                className={`h-12 pl-8 rounded-xl border-gray-100 bg-gray-50 focus:bg-white text-base font-bold ${
                  amount && Number(amount) > mainBalance
                    ? 'border-red-300 focus-visible:ring-red-200'
                    : ''
                }`}
              />
            </div>
            {amount && Number(amount) > mainBalance && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <AlertCircle size={11} className="text-red-400 shrink-0" />
                <p className="text-[11px] font-bold text-red-500">
                  Exceeds balance ({formatNGN(mainBalance)} available)
                </p>
              </div>
            )}
          </div>

          {/* Account holder name */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
              Account Holder Name
            </label>
            <Input
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              placeholder="Full Name"
              className="h-11 rounded-xl border-gray-100 bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
              Phone Number
            </label>
            <Input
              value={holderPhone}
              onChange={(e) => setHolderPhone(e.target.value)}
              placeholder="+2348012345678"
              className="h-11 rounded-xl border-gray-100 bg-gray-50 focus:bg-white"
            />
          </div>

          {!verified && accountNumber.length === 10 && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100">
              <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[11px] font-bold text-amber-700">
                Click Verify to confirm your account details before proceeding.
              </p>
            </div>
          )}

          <Button
            onClick={createIntent}
            disabled={!verified || !amount || Number(amount) <= 0 || intentLoading}
            className="w-full h-12 bg-gray-900 hover:bg-orange-500 text-white rounded-xl font-black gap-2 transition-all active:scale-95 mt-2"
          >
            {intentLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <>
                <Banknote size={15} /> Review Withdrawal
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP: REVIEW & CONFIRM
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'review' && intent) {
    const total = intent.amount + (intent.fee ?? 0);
    return (
      <div>
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setStep('details')}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900">Confirm Withdrawal</h2>
            <p className="text-xs text-gray-400 mt-0.5">Review and approve your transfer</p>
          </div>
        </div>

        <StepDots step="review" />

        {/* Summary card */}
        <div className="rounded-[24px] overflow-hidden border border-gray-100 shadow-sm mb-6">
          {/* Amount hero */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-8 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
              You are sending
            </p>
            <p className="text-4xl font-black text-white">{formatNGN(intent.amount)}</p>
            <p className="text-xs text-gray-400 mt-2">
              + {formatNGN(intent.fee ?? 0)} fee = {formatNGN(total)} total
            </p>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <Row label="Bank" value={intent.withdrawalDetails.bankName} />
            <Row label="Account Number" value={intent.withdrawalDetails.accountNumber} mono />
            <Row label="Account Name" value={intent.withdrawalDetails.accountName} />
            <div className="h-px bg-gray-100" />
            <Row label="Amount" value={formatNGN(intent.amount)} />
            <Row label="Fee" value={formatNGN(intent.fee ?? 0)} />
            <Row label="Total Debit" value={formatNGN(total)} bold />
            <div className="h-px bg-gray-100" />
            <Row label="Reference" value={intent.reference} mono small />
            <Row label="Status" value={intent.status.toUpperCase()} badge />
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={confirmWithdrawal}
            disabled={confirmLoading}
            className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-base gap-2 transition-all active:scale-95 shadow-lg shadow-orange-100"
          >
            {confirmLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Processing…
              </>
            ) : (
              <>
                <CheckCircle2 size={16} /> Confirm Withdrawal
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setStep('details')}
            disabled={confirmLoading}
            className="w-full h-11 rounded-xl font-black text-sm"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP: SUCCESS
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'done' && confirmedIntent) {
    return (
      <div className="flex flex-col items-center text-center">
        {/* Success icon */}
        <div className="relative mb-6 mt-4">
          <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-green-500" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center">
            <Banknote size={14} className="text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-gray-900 mb-1">Transfer Successful!</h2>
        <p className="text-sm text-gray-400 mb-8 max-w-xs">
          Your withdrawal has been processed and is on its way to{' '}
          {confirmedIntent.withdrawalDetails.accountName}.
        </p>

        {/* Receipt card */}
        <div className="w-full rounded-[24px] border border-gray-100 overflow-hidden shadow-sm mb-8">
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-1.5" />
          <div className="p-6 space-y-3.5">
            <ReceiptRow label="Amount Sent" value={formatNGN(confirmedIntent.amount)} large />
            <ReceiptRow label="Fee" value={formatNGN(confirmedIntent.fee ?? 0)} />
            <div className="h-px bg-dashed bg-gray-100 border-t border-dashed border-gray-200" />
            <ReceiptRow label="Recipient" value={confirmedIntent.withdrawalDetails.accountName} />
            <ReceiptRow label="Bank" value={confirmedIntent.withdrawalDetails.bankName} />
            <ReceiptRow
              label="Account"
              value={confirmedIntent.withdrawalDetails.accountNumber}
              mono
            />
            <div className="h-px bg-gray-100" />
            <ReceiptRow label="Reference" value={confirmedIntent.reference} mono small />
            <ReceiptRow
              label="Status"
              value={confirmedIntent.status.toUpperCase()}
              badge
              badgeColor="bg-green-100 text-green-700"
            />
          </div>
        </div>

        <Button
          onClick={() => {
            setStep('bank');
            setSelectedBank(null);
            setAccountNumber('');
            setAccountName('');
            setVerified(false);
            setAmount('');
            setIntent(null);
            setConfirmedIntent(null);
          }}
          className="w-full h-12 bg-gray-900 hover:bg-orange-500 text-white rounded-xl font-black gap-2 transition-all active:scale-95"
        >
          New Withdrawal
        </Button>
      </div>
    );
  }

  return null;
}

// ── Shared detail row components ──────────────────────────────────────────────
function Row({
  label,
  value,
  mono,
  bold,
  badge,
  small,
}: {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
  badge?: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 shrink-0">
        {label}
      </p>
      {badge ? (
        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-600">
          {value}
        </span>
      ) : (
        <p
          className={`text-right ${small ? 'text-[10px]' : 'text-sm'} ${bold ? 'font-black text-gray-900' : 'font-bold text-gray-700'} ${mono ? 'font-mono' : ''}`}
        >
          {value}
        </p>
      )}
    </div>
  );
}

function ReceiptRow({
  label,
  value,
  mono,
  large,
  small,
  badge,
  badgeColor,
}: {
  label: string;
  value: string;
  mono?: boolean;
  large?: boolean;
  small?: boolean;
  badge?: boolean;
  badgeColor?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 shrink-0">
        {label}
      </p>
      {badge ? (
        <span
          className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${badgeColor ?? 'bg-gray-100 text-gray-600'}`}
        >
          {value}
        </span>
      ) : (
        <p
          className={`text-right font-bold text-gray-800 ${large ? 'text-lg font-black text-gray-900' : small ? 'text-[10px] text-gray-500' : 'text-sm'} ${mono ? 'font-mono' : ''}`}
        >
          {value}
        </p>
      )}
    </div>
  );
}
