import { Grid, History, ArrowUpRight } from 'lucide-react';

// The wallet is money only. Orders (confirm, report a problem, claim) live in
// My Orders and Shop Orders.
export const walletsGroups = [
  {
    label: 'Wallet',
    items: [
      { id: 'overview', title: 'Overview', icon: Grid, desc: 'Your balances' },
      {
        id: 'transactions',
        title: 'Transaction History',
        icon: History,
        desc: 'Payments, refunds and withdrawals',
      },
      {
        id: 'withdraw',
        title: 'Withdraw Funds',
        icon: ArrowUpRight,
        desc: 'Send money to your bank account',
      },
    ],
  },
];
