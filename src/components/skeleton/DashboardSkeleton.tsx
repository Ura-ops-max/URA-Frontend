import { Skeleton } from '@/components/ui/skeleton';

export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#FFF9F6] py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT SIDEBAR SKELETON */}
        <aside className="space-y-6 lg:col-span-1 hidden lg:block">
          {/* Profile Card Skeleton */}
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
            <Skeleton className="h-20 w-20 rounded-full mx-auto animate-pulse" />
            <div className="space-y-2 text-center">
              <Skeleton className="h-4 w-3/4 mx-auto animate-pulse" />
              <Skeleton className="h-3 w-1/2 mx-auto animate-pulse" />
            </div>
          </div>

          {/* Chat List Skeleton */}
          <div className="rounded-xl border bg-white p-4 shadow-sm space-y-4">
            <Skeleton className="h-4 w-1/3 animate-pulse" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-3/4 animate-pulse" />
                  <Skeleton className="h-2 w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN FEED SKELETON */}
        <main className="space-y-6 lg:col-span-2">
          {/* Share Box Skeleton */}
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full animate-pulse" />
              <Skeleton className="h-10 flex-1 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Feed Posts Skeletons */}
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full animate-pulse" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 animate-pulse" />
                  <Skeleton className="h-3 w-16 animate-pulse" />
                </div>
              </div>
              <Skeleton className="h-48 w-full rounded-lg animate-pulse" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full animate-pulse" />
                <Skeleton className="h-4 w-5/6 animate-pulse" />
              </div>
            </div>
          ))}
        </main>

        {/* RIGHT SIDEBAR SKELETON */}
        <aside className="space-y-6 lg:col-span-1 hidden lg:block">
          {/* Activity Panel Skeleton */}
          <div className="rounded-xl border bg-white p-4 shadow-sm space-y-4">
            <Skeleton className="h-4 w-1/2 animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-full animate-pulse" />
                <Skeleton className="h-2 w-2/3 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Bookmarks Skeleton */}
          <div className="rounded-xl border bg-white p-4 shadow-sm space-y-4">
            <Skeleton className="h-4 w-1/3 animate-pulse" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-20 w-full rounded-lg animate-pulse" />
              <Skeleton className="h-20 w-full rounded-lg animate-pulse" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
