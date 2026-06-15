import { cn } from '@/lib/utils';
import React from 'react';

interface SidebarWidgetProps {
  isDesktop: boolean;
  isError: boolean;
  errorTitle: string;
  children: React.ReactNode;
  className?: string;
}

const SidebarWidget: React.FC<SidebarWidgetProps> = ({
  isDesktop,
  isError,
  errorTitle,
  children,
  className,
}) => {
  // 1. Logic: Don't render anything if it's mobile
  if (!isDesktop) return null;

  // 2. Logic: Show a consistent error box if the fetch failed
  if (isError) {
    return (
      <div className={cn('rounded-xl bg-white p-4 shadow-md text-center', className)}>
        <p className="text-red-500 font-medium">{errorTitle}</p>
        <p className="text-xs text-gray-400 mt-1">Please try again later.</p>
      </div>
    );
  }

  // 3. Logic: Render the actual component (ChatList, ActivityPanel, etc.)
  return <>{children}</>;
};

export default SidebarWidget;
