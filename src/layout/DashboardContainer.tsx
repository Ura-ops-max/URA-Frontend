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
    <div className="relative min-h-screen">
      {/* Soft ambient color wash — gives the glassy cards something to glow over */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-orange-50/50 via-white to-white" />
        <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-orange-200/25 blur-3xl" />
        <div className="absolute top-1/3 -right-10 h-80 w-80 rounded-full bg-violet-200/20 blur-3xl" />
        <div className="absolute bottom-10 left-0 h-72 w-72 rounded-full bg-emerald-200/15 blur-3xl" />
      </div>

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
