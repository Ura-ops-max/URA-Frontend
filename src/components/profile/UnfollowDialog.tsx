
import { UserCheck } from "lucide-react";

interface UnfollowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  displayName: string;
}

export const UnfollowDialog = ({ isOpen, onClose, onConfirm, displayName }: UnfollowDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <UserCheck size={28} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-black text-gray-900">Unfollow {displayName}?</h3>
        <p className="text-gray-500 text-sm mt-2">
          Are you sure you want to stop seeing their updates?
        </p>
        <div className="flex flex-col gap-3 mt-8">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 shadow-lg shadow-red-100 transition-colors"
          >
            Yes, Unfollow
          </button>
          <button 
            onClick={onClose} 
            className="w-full py-4 text-gray-500 font-bold hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};