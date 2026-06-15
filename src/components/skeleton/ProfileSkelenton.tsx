import { Skeleton } from '@/components/ui/skeleton';

export const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#FFF9F6] pt-6 pb-10 px-4 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* 1. HEADER SKELETON */}
        <div className="w-full bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-sm">
          {/* Cover Photo Area */}
          <Skeleton className="h-48 lg:h-64 w-full rounded-none" />

          <div className="px-8 pb-8 flex flex-col lg:flex-row items-end lg:items-center gap-6 -mt-12 lg:-mt-16 relative z-10">
            {/* Avatar */}
            <Skeleton className="h-32 w-32 lg:h-40 lg:w-40 rounded-[35px] border-8 border-white shadow-sm" />

            {/* Name & Stats Area */}
            <div className="flex-1 space-y-3 mb-2">
              <Skeleton className="h-8 w-48" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Skeleton className="h-12 w-32 rounded-2xl" />
              <Skeleton className="h-12 w-12 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* 2. GRID CONTENT */}
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3 items-start">
          {/* LEFT SIDEBAR SKELETON */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-[25px] p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
              <div className="space-y-4 pt-4 border-t border-gray-50">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT SKELETON */}
          <main className="lg:col-span-2 space-y-6">
            {/* Tabs Placeholder */}
            <div className="flex gap-6 border-b border-gray-100 pb-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-lg" />
              ))}
            </div>

            {/* Feed Content Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-[24px] border border-gray-50 space-y-3"
                >
                  <Skeleton className="h-40 w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
