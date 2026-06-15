// src/components/ui/FullPageSpinner.tsx

import { Loader2 } from 'lucide-react'; // Assuming you use lucide-react icons

export const FullPageSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50/70 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        {/* Loader Icon: Tailwind's animate-spin class handles the rotation */}
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />

        <p className="mt-3 text-sm font-medium text-gray-700">Loading...</p>
      </div>
    </div>
  );
};
