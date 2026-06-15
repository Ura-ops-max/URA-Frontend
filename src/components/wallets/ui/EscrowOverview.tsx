import { Briefcase, Loader2, Wallet } from 'lucide-react';
import { useWalletBalance } from '@/hooks/api/use-wallet-balance';
import { useCurrentUser } from '@/hooks/use-current-user';

function formatAmount(amount: number, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(amount);
}

export const EscrowOverview = () => {
  const { user } = useCurrentUser();
  const { data: wallet, isLoading } = useWalletBalance(user?.paylukCustomerId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <EscrowOverviewCard
        label="Main Balance"
        amount={wallet?.mainBalance ?? 0}
        currency={wallet?.currency}
        icon={<Wallet size={18} className="text-orange-600" />}
        description="Your available balance for transactions."
      />
      <EscrowOverviewCard
        label="Escrow Balance"
        amount={wallet?.escrowBalance ?? 0}
        currency={wallet?.currency}
        icon={<Briefcase size={18} className="text-orange-600" />}
        description="Funds held in escrow for active transactions."
      />
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
    <div className="p-6 space-y-3 flex flex-col rounded-[22px] transition-all duration-300 hover:bg-white/70 active:scale-[0.98] cursor-pointer border border-gray-100 shadow-sm group w-full">
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-2">
          {icon}
        </div>
        <p className="text-lg text-center">{label}</p>
      </div>
      <h5 className="text-3xl font-bold text-orange-600">{formatAmount(amount, currency)}</h5>
      <p className="text-xs text-gray-500 max-w-prose">{description}</p>
    </div>
  );
};
