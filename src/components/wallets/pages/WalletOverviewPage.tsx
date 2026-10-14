import { EscrowOverview } from '../ui/EscrowOverview';
import RecentTransactions from '../ui/RecentTransactions';
import { useCurrentUser } from '@/hooks/use-current-user';

// No "Fund Wallet": shoppers pay by bank transfer or card at checkout, so the
// wallet doesn't need topping up. Balance, paying from balance, withdrawals and
// history are unchanged.
const WalletOverviewPage = () => {
  const { user } = useCurrentUser();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-800">Overview</h2>
      </div>

      <EscrowOverview />

      {user?.paylukCustomerId && <RecentTransactions customerId={user.paylukCustomerId} />}
    </>
  );
};

export default WalletOverviewPage;
