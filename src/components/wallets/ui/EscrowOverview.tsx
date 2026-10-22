import { Briefcase, Loader2, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWalletBalance } from '@/hooks/api/use-wallet-balance';
import { useCurrentUser } from '@/hooks/use-current-user';
import { formatMoney } from '@/lib/money';

// Never throws on a bad currency code (Payluk sometimes sends "NG").
const formatAmount = (amount: number, currency = 'NGN') => formatMoney(amount, currency);

export const EscrowOverview = () => {
  const { user } = useCurrentUser();
  const { data: wallet, isLoading } = useWalletBalance(user?.paylukCustomerId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="p-6 space-y-3 flex flex-col rounded-[22px] border border-gray-100 shadow-sm bg-white/50 w-full"
          >
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-lg bg-orange-50/50 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-orange-400" />
              </div>
              <p className="text-lg text-gray-400">Loading...</p>
            </div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <EscrowOverviewCard
        label="Available"
        amount={wallet?.mainBalance ?? 0}
        currency={wallet?.currency}
        icon={<Wallet size={18} className="text-orange-600" />}
        description="Money you can withdraw."
      />
      <Link to="/dashboard/wallet/held" className="block" aria-label="See the orders holding this money">
        <EscrowOverviewCard
          label="Held in Buyer-Protected"
          amount={wallet?.escrowBalance ?? 0}
          currency={wallet?.currency}
          icon={<Briefcase size={18} className="text-orange-600" />}
          description="Money waiting for the buyer to confirm delivery. Tap to see the orders."
        />
      </Link>
    </div>
  );
};

interface CardProps {
  label: string;
  amount: number;
  currency?: string;
  icon: React.ReactNode;
  description: string;
}

const EscrowOverviewCard = ({ label, amount, currency, icon, description }: CardProps) => {
  return (
    <div className="flex h-full w-full flex-col space-y-3 rounded-[22px] border border-gray-100 p-5 shadow-sm transition-all duration-300 hover:bg-white/70 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">{icon}</div>
        <p className="text-base font-semibold text-gray-800 sm:text-lg">{label}</p>
      </div>
      <h5 className="text-3xl font-bold text-orange-600">{formatAmount(amount, currency)}</h5>
      <p className="max-w-prose text-xs text-gray-500">{description}</p>
    </div>
  );
};
