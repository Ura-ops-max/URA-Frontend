import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { LogIn, Trash2, CheckCircle2, Heart, Send, Star, Circle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ActivityPanelProps {
  activities: any[];
  isError: boolean;
  onClearAll?: () => void;
}

const ActivityPanel: React.FC<ActivityPanelProps> = ({ activities, isError, onClearAll }) => {
  // Icon mapping based on your backend 'action' keys
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LIKE':
        return <Heart size={12} className="text-rose-500 fill-rose-500" />;
      case 'POST_PUBLISH':
        return <Send size={12} className="text-blue-500" />;
      case 'REVIEW_CREATE':
        return <Star size={12} className="text-amber-500 fill-amber-500" />;
      case 'LOGIN':
        return <LogIn size={12} className="text-emerald-500" />;
      default:
        return <Circle size={12} className="text-slate-400" />;
    }
  };

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-[11px] font-black uppercase tracking-widest text-rose-500 opacity-80">
          Sync Error
        </p>
      </div>
    );
  }

  // Logic: Show top 6, enable scroll within a fixed height
  const hasMoreThanSix = activities.length > 6;
  const displayActivities = activities.slice(0, 6);

  return (
    <div className="flex flex-col max-h-[280px] w-full">
      {/* 1. Header Section */}
      <div className="flex items-center justify-between px-3 py-2 mb-2 shrink-0">
        <h3 className="font-bold text-[16px] tracking-tight text-slate-900">Recent Activity</h3>
        {activities.length > 0 && (
          <button
            onClick={onClearAll}
            className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all"
          >
            <Trash2 size={12} className="group-hover:rotate-12 transition-transform" />
            Clear
          </button>
        )}
      </div>

      {/* 2. Scrollable Content Area */}
      {/* We apply 'scrollbar-base' and 'scrollbar-slim' from your index.css */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-1 scrollbar-base scrollbar-main">
        {activities.length === 0 ? (
          <div className="py-14 flex flex-col items-center justify-center opacity-30">
            <CheckCircle2 strokeWidth={1.2} size={32} className="mb-2 text-slate-400" />
            <p className="text-[11px] font-bold uppercase tracking-widest">History is clear</p>
          </div>
        ) : (
          displayActivities.map((act) => (
            <div
              key={act._id}
              className="group flex items-start gap-4 p-3 rounded-[22px] transition-all duration-300 hover:bg-white/70 active:scale-[0.98]"
            >
              {/* Icon Bubble */}
              <div className="relative shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-white shadow-sm ring-1 ring-slate-200/50 transition-transform group-hover:scale-110">
                  {getActionIcon(act.action)}
                </div>
              </div>

              {/* Text Context */}
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] leading-snug text-slate-700 font-medium">
                  {act.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-semibold text-slate-400 lowercase italic">
                    {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. View All Footer */}
      {hasMoreThanSix && (
        <div className="pt-3 shrink-0">
          <Link
            to="/dashboard/settings/activities"
            className="w-full py-3.5 rounded-[20px] border border-dashed border-slate-200 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/60 hover:text-[#f97316] hover:border-[#f97316]/40 transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
          >
            View all activity
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default ActivityPanel;
