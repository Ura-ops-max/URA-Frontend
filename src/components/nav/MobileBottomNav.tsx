// Phone bottom menu: Home, Orders, Wallet, Chats, More. Each icon has its word
// under it. Search stays in the top bar; New post is in More.
import { useLocation } from 'react-router-dom';
import { useGlobalChat } from '@/context/chat-provider';
import { NavItem } from './NavItem';
import { BOTTOM_NAV, isActiveEntry } from './nav-items';

// `onSearchClick` is kept for callers; search now lives in the top bar.
export default function MobileBottomNav(_props: { onSearchClick?: () => void }) {
  const { pathname } = useLocation();
  const { totalUnreadCount } = useGlobalChat();

  return (
    <nav
      aria-label="Main menu"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/40 bg-white/80 px-1 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] backdrop-blur-2xl"
    >
      <ul className="flex items-stretch justify-around">
        {BOTTOM_NAV.map((item) => (
          <li key={item.title} className="flex flex-1 justify-center">
            <NavItem
              icon={item.icon}
              label={item.title}
              to={item.url}
              active={isActiveEntry(item, pathname)}
              badge={item.title === 'Chats' ? totalUnreadCount : 0}
              className="w-full"
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
