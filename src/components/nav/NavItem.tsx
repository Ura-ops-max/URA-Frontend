// A main-menu entry: the icon with its word under it, never the icon alone.
// Used by the phone bottom menu and the top bar. At least 44 x 44 px.
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItemProps {
  icon: LucideIcon;
  /** The word shown under the icon. Required. */
  label: string;
  to?: string;
  onClick?: () => void;
  active?: boolean;
  /** A small count on the icon (cart items, unread). */
  badge?: number;
  className?: string;
}

export function NavItem({ icon: Icon, label, to, onClick, active = false, badge = 0, className }: NavItemProps) {
  const body = (
    <>
      <span
        className={cn(
          'relative flex items-center justify-center rounded-2xl px-3 py-1 transition-colors',
          active ? 'bg-gray-950 text-white' : 'text-gray-700',
        )}
      >
        <Icon size={20} strokeWidth={active ? 2.5 : 2} aria-hidden />
        {badge > 0 && (
          <span className="absolute -right-0.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-orange-500 px-0.5 text-[9px] font-black text-white">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>
      <span className={cn('text-[10px] font-bold leading-tight', active ? 'text-gray-950' : 'text-gray-600')}>{label}</span>
    </>
  );
  const cls = cn(
    'flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 active:scale-95 transition-transform',
    className,
  );
  return to ? (
    <Link to={to} onClick={onClick} className={cls} aria-current={active ? 'page' : undefined}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {body}
    </button>
  );
}
