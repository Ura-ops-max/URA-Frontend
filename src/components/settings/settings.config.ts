// src/common/settings.config.ts
import { 
  User, Lock, Activity, History
} from 'lucide-react';

export const settingsGroups = [
  {
    label: "Account",
    items: [
      { id: 'profile', title: 'Edit Profile', icon: User, desc: 'Change avatar, name, and bio' },
      { id: 'security', title: 'Password & Security', icon: Lock, desc: '2FA, password updates' },
      // { id: 'notifications', title: 'Notifications', icon: Bell, desc: 'Push and email alerts' },
    ]
  },
  {
    label: "Activity & Finances",
    items: [
      { id: 'activities', title: 'Recent Activity', icon: Activity, desc: 'Logs of your posts, likes, and comments' },
      { id: 'transactions', title: 'Transaction History', icon: History, desc: 'All payments and withdrawals' },
      // { id: 'payment-methods', title: 'Saved Cards', icon: CreditCard, desc: 'Manage your payment options' },
    ]
  },
  // {
  //   label: "Preferences & Privacy",
  //   items: [
  //     { id: 'privacy', title: 'Privacy Center', icon: ShieldCheck, desc: 'Who can see your posts and profile' },
  //     { id: 'language', title: 'Language', icon: Globe, desc: 'English (US)' },
  //     { id: 'devices', title: 'Logged Devices', icon: Smartphone, desc: 'Manage active sessions' },
  //   ]
  // }
];