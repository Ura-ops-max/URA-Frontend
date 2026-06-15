import { Settings } from 'lucide-react';

export const SettingsHome = () => {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 space-y-4 animate-in fade-in duration-500">
      <div className="p-6 bg-gray-50 rounded-full">
        <Settings size={48} className="opacity-20" />
      </div>
      <p className="font-medium">Select a setting to view details</p>
    </div>
  );
};
