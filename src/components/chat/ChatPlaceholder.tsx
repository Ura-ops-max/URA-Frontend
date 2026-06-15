import { MessageSquare } from 'lucide-react';

const ChatPlaceholder = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/30 dark:bg-transparent">
    <div className="w-20 h-20 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-indigo-500">
      <MessageSquare size={32} />
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Messages</h3>
    <p className="text-sm text-gray-500 dark:text-slate-400 max-w-xs text-center mt-2">
      Select a conversation from the sidebar or start a new one to begin chatting.
    </p>
  </div>
);

export default ChatPlaceholder;
