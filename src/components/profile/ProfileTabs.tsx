import React from 'react';

type Props = {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
  isBusiness?: boolean;
};

const ProfileTabs: React.FC<Props> = ({ tabs, active, onChange, isBusiness }) => {
  // STRICT FILTER LOGIC
  const availableTabs = tabs.filter((tab) => {
    if (tab === 'Feeds') return !isBusiness; // Feeds: Users only
    if (tab === 'Following') return !isBusiness; // Following: Users only
    if (tab === 'Products') return isBusiness; // Products: Business only
    if (tab === 'Reviews') return isBusiness; // Reviews: Business only

    // Posts, About, Followers: Both
    return true;
  });

  return (
    <div className="mt-2 border-b border-gray-100 bg-white sticky top-0 z-10">
      <nav className="flex gap-6 lg:gap-12 px-6 overflow-x-auto no-scrollbar whitespace-nowrap">
        {availableTabs.map((t) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`py-3 relative transition-colors flex-shrink-0 text-sm ${
              active === t
                ? 'text-orange-500 font-bold'
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`}
          >
            {t}
            {active === t && (
              <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-orange-500 rounded-full" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileTabs;
