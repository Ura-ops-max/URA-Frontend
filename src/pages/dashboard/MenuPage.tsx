// src/pages/dashboard/MenuPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tag,
  Settings,
  LogOut,
  ChevronRight,
  Bookmark,
  Bell,
  ShoppingCart,
  ShoppingBag,
  Store,
  PlusCircle,
  Wallet,
} from 'lucide-react';
import { useAuthContext } from '@/context/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LogoutDialog from '@/components/shared/LogoutDialog';
import { useCartContext } from '@/context/cart-provider';
import { useNotificationContext } from '@/context/notification-provider';
import { generateAvatarUrl } from '@/utils/avatar-generator';

const MenuPage = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const { totalItems: cartItem } = useCartContext();

  const { unreadCount } = useNotificationContext();
  // Grouped Navigation Items
  const sections = [
    {
      label: 'General',
      items: [
        // { title: 'Chat', icon: MessageCircle, path: '/dashboard/chat', badge: 5 },
        {
          title: 'Notifications',
          icon: Bell,
          path: '/dashboard/notifications',
          badge: unreadCount,
        },
        { title: 'Bookmarks', icon: Bookmark, path: '/dashboard/bookmarks' },
        { title: 'Wallet & Payments', icon: Wallet, path: '/dashboard/wallet' },
      ],
    },
    {
      label: 'Shopping & Savings',
      items: [
        { title: 'My Cart', icon: ShoppingCart, path: '/dashboard/product/cart', badge: cartItem },
        { title: 'My Orders', icon: ShoppingBag, path: '/dashboard/my-orders' },
        { title: 'Deals & Offers', icon: Tag, path: '/dashboard/deal-offer' },
        // { title: 'Events', icon: Calendar, path: '/dashboard/events' },
      ],
    },
  ];

  // Business Section (Conditional)
  const businessSection = {
    label: 'Business Tools',
    items: [
      { title: 'List a Product', icon: PlusCircle, path: '/dashboard/post/create?type=product' },
      { title: 'Store Orders', icon: Store, path: '/dashboard/store-management', badge: 0 },
      // { title: 'Business Loan', icon: BadgePercent, path: '/dashboard/loans' },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/30 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white p-4 flex items-center border-b border-gray-100">
        <h1 className="text-lg font-bold w-full text-center">Menu</h1>
      </div>

      {/* User Profile Card */}
      <div className="px-4 py-6">
        <div
          className="p-4 flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-[0.98] transition-all"
          onClick={() => navigate(`/dashboard/profile/user/${user?._id}`)}
        >
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-orange-100">
              <AvatarImage
                src={
                  user?.profilePicture || generateAvatarUrl(`${user?.firstName} ${user?.lastName}`)
                }
              />
              <AvatarFallback className="bg-orange-500 text-white font-bold text-xl">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-xs text-gray-500 font-medium">View your profile</p>
            </div>
          </div>
          <ChevronRight className="text-gray-400" size={18} />
        </div>
      </div>

      {/* Render Sections */}
      <div className="flex flex-col gap-6 px-4">
        {[...sections, ...(user?.isBusinessOwner ? [businessSection] : [])].map((section, sIdx) => (
          <div key={sIdx} className="flex flex-col gap-2">
            <h3 className="px-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {section.label}
            </h3>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {section.items.map((item, iIdx) => (
                <button
                  key={iIdx}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between p-4 active:bg-orange-50 transition-colors ${
                    iIdx !== section.items.length - 1 ? 'border-b border-gray-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <item.icon size={20} className="text-orange-600" />
                    </div>
                    <span className="font-semibold text-gray-800 text-[14px]">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="text-gray-300" size={16} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Support & Logout */}
        <div className="flex flex-col gap-2 mb-4">
          <h3 className="px-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Settings
          </h3>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => navigate('/dashboard/settings')}
              className="w-full flex items-center justify-between p-4 border-b border-gray-50 active:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Settings size={20} className="text-gray-600" />
                </div>
                <span className="font-semibold text-gray-800 text-[14px]">Settings & Privacy</span>
              </div>
              <ChevronRight className="text-gray-300" size={16} />
            </button>

            <button
              onClick={() => setIsLogoutOpen(true)}
              className="w-full flex items-center gap-3 p-4 text-red-600 active:bg-red-50"
            >
              <div className="p-2 bg-red-50 rounded-lg">
                <LogOut size={20} />
              </div>
              <span className="font-semibold text-[14px]">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <LogoutDialog isOpen={isLogoutOpen} setIsOpen={setIsLogoutOpen} />
    </div>
  );
};

export default MenuPage;
