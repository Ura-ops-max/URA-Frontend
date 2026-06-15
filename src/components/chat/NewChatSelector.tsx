import { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { X, Search, User, Briefcase, MessageCircle } from 'lucide-react';
import { chatAPI } from '@/lib/chat-api';
import { useFollowData } from '@/hooks/api/use-user-profile'; // Path to your existing hook
import { useAuthContext } from '@/context/auth-provider';
import { generateAvatarUrl } from '@/utils/avatar-generator';

const NewChatSelector = () => {
  const navigate = useNavigate();
  const { user, related } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState('');

  const { activeTab } = useOutletContext<{ activeTab: 'PERSONAL' | 'BUSINESS' }>();
  // 1. Fetch both lists using your existing hooks
  // activeProfileId is the ID of the current tab (User or Business)
  const activeProfileId = user?._id;
  const senderId = activeTab == 'PERSONAL' ? user?._id : related?.business_id;

  const { data: followers, isLoading: loadingFollowers } = useFollowData(
    activeProfileId!,
    'followers',
  );
  const { data: following, isLoading: loadingFollowing } = useFollowData(
    activeProfileId!,
    'following',
  );

  // 2. Merge and Deduplicate the lists
  const combinedConnections = useMemo(() => {
    const list = [...(followers || []), ...(following || [])];
    // Remove duplicates based on _id (since someone might follow you AND you follow them)
    return Array.from(new Map(list.map((item) => [item._id, item])).values());
  }, [followers, following]);

  // 3. Filter based on Search
  const filteredList = combinedConnections.filter((person) =>
    `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleStartChat = async (person: any) => {
    if (!activeProfileId) return;

    // Prepare the payload to match your backend's req.body
    const payload = {
      senderId: senderId!,
      senderModel: (activeTab === 'PERSONAL' ? 'User' : 'Business') as 'User' | 'Business',
      receiverId: person._id,
      receiverModel: (person.isBusiness ? 'Business' : 'User') as 'User' | 'Business',
    };

    try {
      const { data } = await chatAPI.accessConversation(payload);
      navigate(`/dashboard/chat/${data.data._id}`);
    } catch (err) {
      console.error('Error starting chat:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden">
      {/* HEADER */}
      <header className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/chat')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"
          >
            <X size={20} className="text-gray-500" />
          </button>
          <h2 className="font-bold text-lg dark:text-white">New Message</h2>
        </div>
      </header>

      {/* SEARCH */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search followers or following..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
          />
        </div>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 custom-scrollbar">
        {loadingFollowers || loadingFollowing ? (
          <div className="space-y-4 p-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 bg-gray-100 dark:bg-slate-800 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : filteredList.length > 0 ? (
          <div className="space-y-1">
            <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Suggested Connections
            </p>
            {filteredList.map((person) => (
              <button
                key={person._id}
                onClick={() => handleStartChat(person)}
                className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all group text-left"
              >
                <div className="relative">
                  <img
                    src={
                      person.avatar || generateAvatarUrl(`${person.firstName} ${person.lastName}`)
                    }
                    className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-slate-800"
                    alt=""
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-slate-900 rounded-full shadow-sm">
                    {person.isBusiness ? (
                      <Briefcase size={10} className="text-indigo-500" />
                    ) : (
                      <User size={10} className="text-gray-500" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {person.firstName} {person.lastName}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-slate-500 truncate">
                    @{person.username || 'user'}
                  </p>
                </div>
                <MessageCircle
                  className="text-gray-300 group-hover:text-indigo-500 transition-colors"
                  size={18}
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <User size={48} className="text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No connections found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewChatSelector;
