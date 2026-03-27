import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@/context/auth-provider';
import PersonalInfoForm from '../form/PersonalInfoForm';
import BusinessInfoForm from '../form/BusinessInfoForm';
import BusinessWarningModal from '../ui/BusinessWarningModal'; // Adjust path
import { cn } from '@/lib/utils';
import { Briefcase, User, ShieldAlert } from 'lucide-react';

export const ProfileSettings = () => {
  const { user } = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Modal State
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  
  const pageParam = searchParams.get('page');
  const activeTab = pageParam === 'business' ? 'business' : 'profile';

  const handleTabChange = (tab: 'profile' | 'business') => {
    setSearchParams({ page: tab });
  };

  const renderBusinessTab = () => {
    if (!user?.isBusinessOwner) {
      return (
        <div className="p-8 text-center animate-fadeIn flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mb-6 rotate-3">
            <ShieldAlert className="text-orange-500" size={40} />
          </div>
          
          <h3 className="text-2xl font-black text-gray-900 mb-2">Unlock Business Tools</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8 leading-relaxed">
            Boost your presence! Convert to a business account to list products, track sales, and reach more customers.
          </p>
          
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {/* TRIGGER THE MODAL HERE */}
            <button 
              onClick={() => setShowBusinessModal(true)}
              className="flex items-center justify-center gap-2 bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 active:scale-[0.98] transition-all"
            >
              <Briefcase size={18} />
              Setup Business Profile
            </button>
            
            <button 
              onClick={() => handleTabChange('profile')}
              className="text-gray-500 text-sm font-bold hover:text-gray-700 py-2"
            >
              Maybe Later
            </button>
          </div>
        </div>
      );
    }
    return <BusinessInfoForm />;
  };

  return (
    <div className="space-y-6">
      {/* TABS */}
      <div className="flex items-center gap-1 p-1.5 bg-gray-100/80 rounded-2xl w-fit">
        <button
          onClick={() => handleTabChange('profile')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'profile' ? "bg-white text-orange-600 shadow-sm" : "text-gray-500"
          )}
        >
          <User size={16} />
          Personal
        </button>
        <button
          onClick={() => handleTabChange('business')}
          className={cn(
            "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'business' ? "bg-white text-orange-600 shadow-sm" : "text-gray-500"
          )}
        >
          <Briefcase size={16} />
          Business
        </button>
      </div>

      {/* CONTENT */}
      <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm shadow-gray-200/50">
        {activeTab === 'profile' ? <PersonalInfoForm /> : renderBusinessTab()}
      </div>

      {/* MODAL OVERLAY */}
      {showBusinessModal && (
        <BusinessWarningModal onClose={() => setShowBusinessModal(false)} />
      )}
    </div>
  );
};