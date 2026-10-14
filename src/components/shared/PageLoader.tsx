import { Loader2 } from 'lucide-react';

/** Shown for the moment a page's code is loading (pages load on demand). */
export default function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label="Loading">
      <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
    </div>
  );
}
