import {
  Activity,
  History,
  Grid,
  ShoppingBag,
  BadgeCheck,
  MessageSquareWarning,
  ShoppingCart,
  CheckCircle,
  ArrowUpRight,
} from 'lucide-react';

export const walletsGroups = [
  {
    label: 'Escrow',
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
        desc: 'Your sales escrow transactions',
      },
      {
        id: 'claim-funds',
        title: 'Claim Funds',
        icon: BadgeCheck,
        desc: 'Claim funds from completed escrow',
      },
      {
        id: 'respond-to-dispute',
        title: 'Respond to Dispute',
        icon: MessageSquareWarning,
        desc: 'Submit your dispute response',
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
        desc: 'Your purchase escrow transactions',
      },
      {
        id: 'open-dispute',
        title: 'Open Dispute',
        icon: MessageSquareWarning,
        desc: 'Open a dispute as a buyer',
      },
      {
        id: 'confirm-payment',
        title: 'Confirm Payment to Seller',
        icon: CheckCircle,
        desc: 'Release escrow funds to seller',
      },
    ],
  },
];
