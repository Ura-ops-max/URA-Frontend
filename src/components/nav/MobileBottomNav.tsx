import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, MessageCircle, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileBottomNav({ onSearchClick }: { onSearchClick: () => void }) {
  const { pathname } = useLocation();

  const navItems = [
    {
      name: 'Home',
      to: '/dashboard',
      icon: Home,
      activePaths: ['/dashboard'],
    },
    {
      name: 'Search',
      onClick: onSearchClick,
      icon: Search,
      activePaths: ['/search', '/explore'],
    },
    {
      name: 'Post',
      to: '/dashboard/post/create?type=post',
      icon: PlusSquare,
      activePaths: ['/dashboard/post', '/dashboard/inventory/new'],
    },
    {
      name: 'Chats',
      to: '/dashboard/chat',
      icon: MessageCircle,
      activePaths: ['/dashboard/chat', '/dashboard/messages'],
    },
    {
      name: 'More',
      to: '/dashboard/menu',
      icon: MoreHorizontal,
      activePaths: ['/dashboard/menu', '/dashboard/settings', '/dashboard/profile'],
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/40 backdrop-blur-2xl border-t border-white/40 px-2 py-3 z-50 pb-[env(safe-area-inset-bottom)]">
      <ul className="flex justify-around items-end">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.activePaths.some((path) =>
            item.name === 'Home' ? pathname === path : pathname.startsWith(path),
          );

          return (
            <li key={item.name} className="flex-1">
              <Link
                to={item.to || '#'}
                onClick={item.onClick}
                className="w-full flex flex-col items-center gap-1 group active:scale-95 transition-transform"
              >
                {/* ICON CONTAINER: 
                    Added a subtle background ring to ensure icon visibility 
                */}
                <div
                  className={cn(
                    'p-2 rounded-2xl transition-all duration-300',
                    isActive
                      ? 'bg-gray-950 text-white shadow-lg shadow-gray-200'
                      : 'bg-white/20 text-gray-900 group-hover:bg-white/40',
                  )}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>

                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-widest transition-colors',
                    isActive ? 'text-gray-950' : 'text-gray-500',
                  )}
                >
                  {item.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
