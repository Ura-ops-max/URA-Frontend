// src/components/profile/ProfilePostsFeed.tsx
import React, { useEffect, useState } from 'react';
import PostCard from '@/components/dashboard/PostCard';

interface Post {
  _id: string;
  name: string;
  description: string;
  price: number;
  tags: string[];
  media: string[];
  business: {
    _id: string;
    businessName: string;
    profileImage: string;
    username: string;
    rating: number;
  };
}

interface Props {
  profile: any;
}

const ProfilePostsFeed: React.FC<Props> = ({ profile }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const res = await fetch('/mock-data/post.json');
        if (!res.ok) throw new Error('Failed to fetch posts');

        const json: Post[] = await res.json();

        setPosts(json);
      } catch (err) {
        console.error(err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [profile]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading posts...</div>;
  }

  if (posts.length === 0) {
    return <div className="text-center py-12 text-gray-500">No posts yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};

export default ProfilePostsFeed;
