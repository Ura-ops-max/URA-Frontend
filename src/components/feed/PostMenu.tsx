// src/components/feed/PostMenu.tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'danger';
  show?: boolean; // Useful for conditional items (e.g., show delete only if owner)
}

interface PostMenuProps {
  actions: MenuAction[];
  triggerClassName?: string;
}

export const PostMenu = ({ actions, triggerClassName }: PostMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
            <MoreHorizontal size={20} />
          </button> */}
        <button
          className={cn(
            'text-gray-400 p-1.5 hover:bg-gray-100 rounded-full transition-colors',
            triggerClassName,
          )}
        >
          <MoreVertical size={18} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-100 z-[60]">
        {actions
          .filter((action) => action.show !== false)
          .map((action, index) => (
            <div key={action.label}>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation(); // Prevents clicking the menu from opening the post
                  action.onClick();
                }}
                className={cn(
                  'gap-3 py-2.5 cursor-pointer font-medium text-[13px]',
                  action.variant === 'danger'
                    ? 'text-red-600 focus:text-red-600 focus:bg-red-50'
                    : 'text-gray-700',
                )}
              >
                <action.icon size={16} strokeWidth={2.5} />
                {action.label}
              </DropdownMenuItem>
              {/* Add a separator before the last item if it's a danger action */}
              {index === actions.length - 2 && actions[actions.length - 1].variant === 'danger' && (
                <DropdownMenuSeparator />
              )}
            </div>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
