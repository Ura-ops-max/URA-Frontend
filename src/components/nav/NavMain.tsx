// src/components/nav/NavMain.tsx
import {
  Settings,
  LayoutDashboard,
  Bell,
  MessageCircle,
  Tag,
  Wallet,
  ShoppingBag,
  Store,
  ShoppingCart,
  Bookmark, // 🚨 Added Bookmark icon
  type LucideIcon,
  PlusCircle
} from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/context/auth-provider';
import { useCartContext } from '@/context/cart-provider';
import { useNotificationContext } from '@/context/notification-provider';
import { useGlobalChat } from '@/context/chat-provider';

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  showBadge?: boolean;
  badgeValue?: any;
};

export function NavMain() {
  const { user } = useAuthContext();
  const { unreadCount } = useNotificationContext();
  const location = useLocation();
  const pathname = location.pathname;

  const { totalItems } = useCartContext();

  const { totalUnreadCount } = useGlobalChat();
  
  const displayCount = totalUnreadCount > 99 ? '99+' : totalUnreadCount;

  
  // 1. Shared Items
  const mainItems: NavItem[] = [
    { title: 'Feed', url: '/dashboard', icon: LayoutDashboard },
    { title: 'Chat', url: '/dashboard/chat', icon: MessageCircle, showBadge: totalUnreadCount > 0, badgeValue: String(displayCount) },
    { title: 'Bookmarks', url: '/dashboard/bookmarks', icon: Bookmark }, // 🚨 Added Bookmarks here
    { 
    title: 'Notifications', 
    url: '/dashboard/notifications', 
    icon: Bell, 
    showBadge: unreadCount > 0, 
    badgeValue: String(unreadCount )
  },
    // { title: 'Wallet', url: '/dashboard/wallet', icon: Wallet },

  ];

  // 2. Shopping & Savings Items
  const shoppingItems: NavItem[] = [
    {
      title: 'Cart',
      url: '/dashboard/product/cart',
      icon: ShoppingCart,
      showBadge: totalItems > 0,
      badgeValue: totalItems
    },
    { title: 'My Orders', url: '/dashboard/my-orders', icon: ShoppingBag },
    { title: 'Deals', url: '/dashboard/deal-offer', icon: Tag },
    {title: 'Payments', url: '/dashboard/payments/setup', icon: Wallet },
    // { title: 'Events', url: '/dashboard/events', icon: Calendar },
  ];

  // 3. Business Management
  const businessItems: NavItem[] = [
    {
      title: 'List a Product',
      url: '/dashboard/post/create?type=product',
      icon: PlusCircle
    },
    { title: 'Store Orders', url: '/dashboard/store-management', icon: Store, showBadge: true, badgeValue: 12 },
    // { title: 'Business Loan', url: '/dashboard/loans', icon: BadgePercent },
    // Inside businessItems array in NavMain.tsx

  ];

  const renderMenuItems = (items: NavItem[]) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title} className="mb-1 relative">
          <SidebarMenuButton
            isActive={item.url === pathname}
            asChild
            tooltip={item.title}
            className={`transition-all duration-200 h-11 ${item.url === pathname
              ? "bg-orange-50 text-orange-600 hover:bg-orange-50 hover:text-orange-600"
              : "hover:bg-gray-100"
              }`}
          >
            <Link to={item.url} className="flex items-center gap-3">
              <div className="relative">
                <item.icon className={`${item.url === pathname ? "stroke-[2.5px]" : "stroke-[1.5px]"}`} size={20} />

                {/* Collapsed Badge - Small dot for icon-only mode */}
                {item.showBadge && (item.badgeValue ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-orange-600 text-[8px] text-white group-data-[collapsible=icon]:flex hidden border border-white">
                    {item.badgeValue}
                  </span>
                )}
              </div>
              <span className="font-medium text-[14px]">{item.title}</span>
            </Link>
          </SidebarMenuButton>

          {/* Expanded Badge - Full pill for expanded mode */}
          {item.showBadge && (item.badgeValue ?? 0) > 0 && (
            <SidebarMenuBadge className="bg-orange-500 text-white border-none group-data-[collapsible=icon]:hidden">
              {item.badgeValue}
            </SidebarMenuBadge>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">General</SidebarGroupLabel>
        {renderMenuItems(mainItems)}
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shopping</SidebarGroupLabel>
        {renderMenuItems(shoppingItems)}
      </SidebarGroup>

      {user?.isBusinessOwner && (
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Business</SidebarGroupLabel>
          {renderMenuItems(businessItems)}
        </SidebarGroup>
      )}

      <SidebarGroup className="mt-auto">
        {renderMenuItems([{ title: 'Settings', url: '/dashboard/settings', icon: Settings }])}
      </SidebarGroup>
    </>
  );
}