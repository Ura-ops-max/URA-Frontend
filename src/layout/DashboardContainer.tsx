import React from 'react';

interface DashboardContainerProps {
  leftColumn?: React.ReactNode;
  children: React.ReactNode;
  rightColumn?: React.ReactNode;
}

const DashboardContainer = ({ leftColumn, children, rightColumn }: DashboardContainerProps) => {
  // Logic to calculate how wide the middle column should be
  let mainColSpan = 'lg:col-span-4';
  if (leftColumn && rightColumn) mainColSpan = 'lg:col-span-2';
  else if (leftColumn || rightColumn) mainColSpan = 'lg:col-span-3';

  return (
    /* Removed the solid bg-FFF9F6 to let the layout's glassy vibe shine through */
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1440px] lg:px-4 grid grid-cols-1 lg:grid-cols-4 lg:gap-8">
        {/* LEFT COLUMN */}
        {leftColumn && (
          <aside className="space-y-6 lg:col-span-1 hidden lg:block sticky top-24 self-start">
            {leftColumn}
          </aside>
        )}

        {/* MAIN FEED: Now using the refined scrollbar classes */}
        <main
          className={`space-y-8 flex flex-col h-fit scrollbar-base scrollbar-main ${mainColSpan}`}
        >
          {children}
        </main>

        {/* RIGHT COLUMN */}
        {rightColumn && (
          <aside className="space-y-6 lg:col-span-1 hidden lg:block sticky top-24 self-start">
            {rightColumn}
          </aside>
        )}
      </div>
    </div>
  );
};

export default DashboardContainer;
