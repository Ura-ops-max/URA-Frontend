// src/components/nav/NavMain.tsx
// Left sidebar. Every entry shows its word: in full when open, and a short
// word under the icon when the sidebar is collapsed (never the icon alone).
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
import {
  SIDEBAR_BUSINESS,
  SIDEBAR_MAIN,
  SIDEBAR_SETTINGS,
  SIDEBAR_SHOPPING,
  type MenuEntry,
} from './nav-items';

type NavItem = MenuEntry & {
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

  const badges: Record<string, { show: boolean; value: string | number }> = {
    Chats: { show: totalUnreadCount > 0, value: String(displayCount) },
    Notifications: { show: unreadCount > 0, value: String(unreadCount) },
    Cart: { show: totalItems > 0, value: totalItems },
  };
  const withBadges = (items: MenuEntry[]): NavItem[] =>
    items.map((i) => ({ ...i, showBadge: badges[i.title]?.show, badgeValue: badges[i.title]?.value }));

  const mainItems = withBadges(SIDEBAR_MAIN);
  const shoppingItems = withBadges(SIDEBAR_SHOPPING);
  const businessItems = withBadges(SIDEBAR_BUSINESS);

  const renderMenuItems = (items: NavItem[]) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title} className="mb-1 relative">
          <SidebarMenuButton
            isActive={item.url === pathname}
            asChild
            tooltip={item.title}
            className={`transition-all duration-200 h-11 group-data-[collapsible=icon]:h-auto! group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:py-1.5! ${
              item.url === pathname
                ? 'bg-orange-50 text-orange-600 hover:bg-orange-50 hover:text-orange-600'
                : 'hover:bg-gray-100'
            }`}
          >
            <Link
              to={item.url}
              className="flex items-center gap-3 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-0.5"
            >
              <div className="relative">
                <item.icon
                  className={`${item.url === pathname ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`}
                  size={20}
                />

                {/* Collapsed Badge - Small dot for icon-only mode */}
                {item.showBadge && (item.badgeValue ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-orange-600 text-[8px] text-white group-data-[collapsible=icon]:flex hidden border border-white">
                    {item.badgeValue}
                  </span>
                )}
              </div>
              {/* Collapsed sidebar: a short word under the icon. */}
              <span className="hidden text-center text-[10px] font-semibold leading-tight group-data-[collapsible=icon]:block">
                {item.short ?? item.title}
              </span>
              <span className="font-medium text-[14px] group-data-[collapsible=icon]:hidden">{item.title}</span>
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
      <SidebarGroup className="group-data-[collapsible=icon]:px-0">
        <SidebarGroupLabel className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          General
        </SidebarGroupLabel>
        {renderMenuItems(mainItems)}
      </SidebarGroup>

      <SidebarGroup className="group-data-[collapsible=icon]:px-0">
        <SidebarGroupLabel className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Shopping
        </SidebarGroupLabel>
        {renderMenuItems(shoppingItems)}
      </SidebarGroup>

      {user?.isBusinessOwner && (
        <SidebarGroup className="group-data-[collapsible=icon]:px-0">
          <SidebarGroupLabel className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Business
          </SidebarGroupLabel>
          {renderMenuItems(businessItems)}
        </SidebarGroup>
      )}

      <SidebarGroup className="mt-auto group-data-[collapsible=icon]:px-0">
        {renderMenuItems([SIDEBAR_SETTINGS])}
      </SidebarGroup>
    </>
  );
}
