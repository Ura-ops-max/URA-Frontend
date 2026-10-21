import {
  Activity,
  History,
  Grid,
  ShoppingBag,
  ShoppingCart,
  ArrowUpRight,
} from 'lucide-react';

export const walletsGroups = [
  {
    label: 'Buyer-Protected Payments',
    items: [
      { id: 'overview', title: 'Overview', icon: Grid, desc: 'Wallet overview' },
      { id: 'activities', title: 'Recent Activity', icon: Activity, desc: 'Transaction logs' },
    ],
  },
  {
    label: 'Activity & Finances',
    items: [
      {
        id: 'transactions',
        title: 'Transaction History',
        icon: History,
        desc: 'All payments and withdrawals',
      },
      {
        id: 'withdraw',
        title: 'Withdraw Funds',
        icon: ArrowUpRight,
        desc: 'Transfer funds to your bank account',
      },
    ],
  },
  {
    label: 'My Sales',
    items: [
      {
        id: 'seller-transactions',
        title: 'My Sales Transactions',
        icon: ShoppingBag,
        desc: 'Your sales. Claim or reply to a dispute from the order.',
      },
    ],
  },
  {
    label: 'My Purchases',
    items: [
      {
        id: 'buyer-transactions',
        title: 'My Transactions',
        icon: ShoppingCart,
        desc: 'Your purchases. Confirm or dispute from the order.',
      },
    ],
  },
];
