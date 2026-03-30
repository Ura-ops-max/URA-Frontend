
import { Bell, MessageCircle, Heart, Star, ShoppingBag } from 'lucide-react';
import { useNotificationContext } from '@/context/notification-provider';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = ({ onClose }: { onClose: () => void }) => {
  const { notifications, markAsRead, unreadCount } = useNotificationContext();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'MESSAGE': return <MessageCircle size={16} className="text-blue-500" />;
      case 'SOCIAL': return <Heart size={16} className="text-red-500" />;
      case 'REVIEW': return <Star size={16} className="text-yellow-500" />;
      case 'ORDER': return <ShoppingBag size={16} className="text-green-500" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
      <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
        <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
        {unreadCount > 0 && (
          <span className="text-[10px] bg-[#FF6B35] text-white px-2 py-0.5 rounded-full font-bold">
            {unreadCount} New
          </span>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length > 0 ? (
          notifications.map((notif: any) => (
            <div 
              key={notif._id}
              onClick={() => {
                markAsRead(notif._id);
                if(notif.relatedId) navigate(`/dashboard/chat/${notif.relatedId}`);
                onClose();
              }}
              className={`p-4 flex gap-3 border-b dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
            >
              <div className="mt-1">{getIcon(notif.type)}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold dark:text-white">{notif.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{notif.message}</p>
                <span className="text-[10px] text-slate-400 mt-2 block italic">
                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                </span>
              </div>
              {!notif.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
            </div>
          ))
        ) : (
          <div className="p-10 text-center flex flex-col items-center gap-2">
            <Bell size={32} className="text-slate-200" />
            <p className="text-sm text-slate-400">All caught up!</p>
          </div>
        )}
      </div>

      <button 
        onClick={() => { navigate('/dashboard/notifications'); onClose(); }}
        className="w-full p-3 text-center text-sm font-bold text-[#FF6B35] hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border-t dark:border-slate-800"
      >
        View All Notifications
      </button>
    </div>
  );
};

export default NotificationDropdown;