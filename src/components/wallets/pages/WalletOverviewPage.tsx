import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EscrowOverview } from '../ui/EscrowOverview';
import FundWalletModal from '../ui/FundWalletModal';
import RecentTransactions from '../ui/RecentTransactions';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePaylukGuard } from '@/hooks/use-payluk-guard';
import PaylukOnboardingModal from '@/components/shared/PaylukOnboardingModal';

const WalletOverviewPage = () => {
  const { user } = useCurrentUser();
  const { showModal, onModalSuccess, onModalDismiss, guard } = usePaylukGuard();
  const [showFundModal, setShowFundModal] = useState(false);

  // No on-load prompt: the payment profile is set up silently when the user
  // actually clicks "Fund Wallet" (see handleFundWallet / usePaylukGuard).

  const handleFundWallet = () => {
    guard(() => setShowFundModal(true));
  };

  return (
    <>
      {/* Quick actions */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800">Overview</h2>
        <Button
          onClick={handleFundWallet}
          className="h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold gap-2 text-sm active:scale-95 transition-all"
        >
          <Plus size={15} />
          Fund Wallet
        </Button>
      </div>

      <EscrowOverview />

      {user?.paylukCustomerId && <RecentTransactions customerId={user.paylukCustomerId} />}

      {showFundModal && user?.paylukCustomerId && (
        <FundWalletModal
          customerId={user.paylukCustomerId}
          onClose={() => setShowFundModal(false)}
        />
      )}

      {showModal && <PaylukOnboardingModal onSuccess={onModalSuccess} onDismiss={onModalDismiss} />}
    </>
  );
};

export default WalletOverviewPage;
