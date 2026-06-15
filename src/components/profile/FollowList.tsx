import { Loader2, Search, Users } from 'lucide-react';
import { UserFollowCard } from './UserFollowCard';
import { Input } from '../ui/input';
import { useFollowData } from '@/hooks/api/use-user-profile';
import { useState } from 'react';
import type { UserType } from '@/types/api.types';

interface FollowListProps {
  targetId: string;
  type: 'followers' | 'following';
  currentUser: UserType | any;
}

export default function FollowList({ targetId, type, currentUser }: FollowListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: users, isLoading, error } = useFollowData(targetId, type);

  const filteredUsers =
    users?.filter((user: any) => {
      const searchStr = searchTerm.toLowerCase();
      return (
        user.firstName?.toLowerCase().includes(searchStr) ||
        user.lastName?.toLowerCase().includes(searchStr) ||
        user.username?.toLowerCase().includes(searchStr) ||
        user.businessName?.toLowerCase().includes(searchStr) // Check business name too
      );
    }) ?? [];

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-orange-500" />
      </div>
    );
  if (error) return <div className="text-center py-10 text-red-500">Error loading list.</div>;

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search ${type}...`}
          className="pl-11 bg-white border-gray-100 rounded-2xl h-12 focus:ring-orange-500"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
          <Users className="text-gray-300 mx-auto mb-4" size={32} />
          <p className="text-gray-500">No {type} found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map((user: any) => (
            <UserFollowCard key={user._id} user={user} isMe={currentUser._id === user._id} />
          ))}
        </div>
      )}
    </div>
  );
}
