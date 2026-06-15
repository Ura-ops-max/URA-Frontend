import { useEffect, useState } from 'react';
import PostCard from './PostCard';
import { getAllPosts } from '@/services/mock/post.ts';

export default function PostFeed({ onRequireAuth }: { onRequireAuth?: () => void }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPosts().then((data: any) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading posts…</div>;
  }

  return (
    <div className="grid gap-6">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} onRequireAuth={onRequireAuth} />
      ))}
    </div>
  );
}
