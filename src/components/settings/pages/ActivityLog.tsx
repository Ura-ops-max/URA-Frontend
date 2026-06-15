// src/components/settings/ActivityLog.tsx
import { MessageSquare, Heart, UserPlus, ShoppingBag, PlusCircle, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const ActivityLog = ({ activities }: { activities: any[] }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare size={16} className="text-blue-500" />;
      case 'like':
        return <Heart size={16} className="text-red-500" />;
      case 'signup':
        return <UserPlus size={16} className="text-green-500" />;
      case 'order':
        return <ShoppingBag size={16} className="text-orange-500" />;
      case 'post':
        return <PlusCircle size={16} className="text-purple-500" />;
      default:
        return <Activity size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
        <p className="text-sm text-gray-500">A history of your actions across the platform.</p>
      </div>

      <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-100 before:via-gray-100 before:to-transparent">
        {activities.map((activity) => (
          <div key={activity._id} className="relative flex items-start gap-4 group">
            {/* Icon Bubble */}
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-gray-100 shadow-sm z-10 group-hover:border-orange-200 transition-colors">
              {getIcon(activity.actionType)}
            </div>

            {/* Content */}
            <div className="flex flex-col pt-1">
              <p className="text-sm text-gray-700">
                <span className="font-bold text-gray-900">You</span>{' '}
                {activity.actionType === 'signup'
                  ? 'joined the community'
                  : `performed a ${activity.actionType}`}
                {activity.contentPreview && (
                  <span className="text-gray-500 italic">: "{activity.contentPreview}"</span>
                )}
              </p>
              <time className="text-[11px] font-medium text-gray-400 mt-1 uppercase tracking-wider">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </time>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
