// The main menu, in one place: the left sidebar and the phone bottom menu.
// One icon means one thing across the app (see the icon map below).
//
// Icon map: Feed = LayoutDashboard, Chats = MessageCircle, Saved = Bookmark,
// Notifications = Bell, Cart = ShoppingCart, My Orders = ShoppingBag,
// Shop Orders = Store, Inventory = Boxes, Wallet = Wallet, New post = Plus,
// List a Product = PackagePlus, Deals = Tag, Settings = Settings,
// Home = House, Search = Search, More = Menu.
import {
  Bell,
  Bookmark,
  Boxes,
  House,
  LayoutDashboard,
  Menu,
  MessageCircle,
  PackagePlus,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tag,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface MenuEntry {
  title: string;
  url: string;
  icon: LucideIcon;
  /** Shorter word for narrow spaces (the collapsed sidebar). */
  short?: string;
  /** Paths that make this entry look selected (bottom menu). */
  activePaths?: string[];
}

export const SIDEBAR_MAIN: MenuEntry[] = [
  { title: 'Feed', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Chats', url: '/dashboard/chat', icon: MessageCircle },
  { title: 'Saved', url: '/dashboard/bookmarks', icon: Bookmark },
  { title: 'Notifications', url: '/dashboard/notifications', icon: Bell, short: 'Alerts' },
];

export const SIDEBAR_SHOPPING: MenuEntry[] = [
  { title: 'Cart', url: '/dashboard/product/cart', icon: ShoppingCart },
  { title: 'My Orders', url: '/dashboard/my-orders', icon: ShoppingBag, short: 'Orders' },
  { title: 'Deals', url: '/dashboard/deal-offer', icon: Tag },
  { title: 'Wallet', url: '/dashboard/wallet', icon: Wallet },
];

export const SIDEBAR_BUSINESS: MenuEntry[] = [
  { title: 'List a Product', url: '/dashboard/post/create?type=product', icon: PackagePlus, short: 'Sell' },
  { title: 'Inventory', url: '/dashboard/inventory', icon: Boxes },
  { title: 'Shop Orders', url: '/dashboard/shop-orders', icon: Store, short: 'Shop' },
];

export const SIDEBAR_SETTINGS: MenuEntry = { title: 'Settings', url: '/dashboard/settings', icon: Settings };

/** Phone bottom menu: five items, each with its word under the icon. */
export const BOTTOM_NAV: MenuEntry[] = [
  { title: 'Home', url: '/dashboard', icon: House, activePaths: ['/dashboard'] },
  { title: 'Orders', url: '/dashboard/my-orders', icon: ShoppingBag, activePaths: ['/dashboard/my-orders', '/dashboard/orders'] },
  { title: 'Wallet', url: '/dashboard/wallet', icon: Wallet, activePaths: ['/dashboard/wallet'] },
  { title: 'Chats', url: '/dashboard/chat', icon: MessageCircle, activePaths: ['/dashboard/chat'] },
  {
    title: 'More',
    url: '/dashboard/menu',
    icon: Menu,
    activePaths: ['/dashboard/menu', '/dashboard/settings', '/dashboard/profile', '/dashboard/post'],
  },
];

/** Is this bottom-menu entry selected on this page? */
export const isActiveEntry = (e: MenuEntry, pathname: string) =>
  (e.activePaths ?? [e.url]).some((p) => (p === '/dashboard' ? pathname === p : pathname.startsWith(p)));
