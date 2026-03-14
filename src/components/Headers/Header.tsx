import { Link, useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Home, Search, Image as ImageIcon, Bell, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '../shared/Logo';
import { DashboardAvatar } from '../dashboard/DashboardAvatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '../ui/separator';
import { useCartContext } from '@/context/cart-provider';
import { useNotificationContext } from '@/context/notification-provider';
import { useState, useRef, useEffect } from 'react';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';

export default function Header({ onSearchClick }: { onSearchClick: () => void }) {
  const location = useLocation();
  const pathname = location.pathname;
  const { totalItems: cartItemCount } = useCartContext();
  const { unreadCount } = useNotificationContext();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getPageLabel = (path: string) => {
    if (path.includes('/post/create')) return 'Create Post';
    if (path.includes('/settings')) return 'Settings';
    if (path.includes('/profile/user')) return 'User Profile';
    if (path.includes('/profile/business')) return 'Business Profile';
    if (path.includes('/chat')) return 'Chat';
    if (path.includes('/activity')) return 'Activity';
    if (path.includes('/bookmark')) return 'Bookmark';
    if (path.includes('/deal-offer')) return 'Products';
    if (path.includes('/notifications')) return 'Notifications';
    if (path.includes('/cart')) return 'Shopping Cart';
    return null;
  };

  const pageHeading = getPageLabel(pathname);

  const desktopMenu = [
    { name: 'Home', to: '/dashboard', icon: Home },
    // { name: 'About', to: '/about', icon: Info },
    { name: 'Search', onClick: onSearchClick, icon: Search },
    { name: 'Image Search', to: '/dashboard/search/image', icon: ImageIcon },
    { name: 'Cart', to: '/dashboard/product/cart', icon: ShoppingCart },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen]);

  return (
    /* Glass Effect: Light bg opacity, heavy blur, and very subtle shadow */
    <header className="sticky top-0 z-40 w-full bg-white/60 backdrop-blur-xl border-b border-white/20 h-16 transition-all duration-300">
      <div className="flex items-center justify-between h-full px-4 lg:px-10">

        {/* LEFT SECTION: Breadcrumbs & Trigger */}
        <div className="flex items-center gap-4">
          <div className="lg:hidden">
            <Logo url="/dashboard" />
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <SidebarTrigger className="hover:bg-gray-100/50 rounded-full h-9 w-9 flex items-center justify-center transition-colors" />
            <Separator orientation="vertical" className="h-4 bg-gray-200" />
            
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  {pageHeading ? (
                    <BreadcrumbLink asChild>
                      {/* Using text-[13px] and medium weight for a cleaner look */}
                      <Link to="/dashboard" className="text-[13px] font-medium text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-wider">Dashboard</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">Dashboard</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {pageHeading && (
                  <>
                    <BreadcrumbSeparator className="text-gray-300" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-[13px] font-bold text-gray-900 uppercase tracking-wider">{pageHeading}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* CENTER SECTION: Modern Floating Nav */}
        <nav className="hidden lg:flex items-center bg-gray-100/40 p-1 rounded-2xl border border-white/20">
          {desktopMenu.map((item) => {
            const isActive = pathname === item.to;
            const Icon = item.icon;
            const baseClass = cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-xl text-[13px] font-bold transition-all duration-200 relative",
              isActive 
                ? "bg-white text-black shadow-sm" 
                : "text-gray-500 hover:text-black hover:bg-white/50"
            );

            return item.onClick ? (
              <button key={item.name} onClick={item.onClick} className={baseClass}>
                <Icon size={16} strokeWidth={2.5} /> {item.name}
              </button>
            ) : (
              <Link key={item.name} to={item.to!} className={baseClass}>
                <Icon size={16} strokeWidth={2.5} /> 
                <span>{item.name}</span>
                {item.name === 'Cart' && cartItemCount > 0 && (
                  <span className="ml-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#f97316] text-[9px] font-black text-white">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT SECTION: Icons & Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* Mobile Cart */}
          <Link to="/dashboard/product/cart" className="lg:hidden relative p-2.5 text-gray-600 hover:bg-gray-100/50 rounded-full transition-all">
            <ShoppingCart size={20} />
            {cartItemCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#f97316] text-[9px] font-black text-white border-2 border-white shadow-sm">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={cn(
                "relative p-2.5 rounded-full transition-all duration-200",
                isNotifOpen ? 'bg-gray-950 text-white shadow-lg shadow-gray-200' : 'text-gray-600 hover:bg-gray-100/50'
              )}
            >
              <Bell size={20} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              /* Dropdown: High depth shadow and rounded edges */
              <div className="absolute right-0 mt-3 w-80 origin-top-right">
                <NotificationDropdown onClose={() => setIsNotifOpen(false)} />
              </div>
            )}
          </div>

          <Separator orientation="vertical" className="h-6 mx-1 bg-gray-200 hidden sm:block" />

          <div className="pl-1">
            <DashboardAvatar />
          </div>
        </div>
      </div>
    </header>
  );
}