import { useState } from 'react';
import { Bookmark, Heart, MessageCircle, Share2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuth from '@/hooks/api/use-auth';

interface PostCardProps {
  post: {
    _id: string;
    name: string;
    description: string;
    price: number;
    media?: string[];
    tags?: string[];
    business: {
      _id: string;
      businessName: string;
      profileImage?: string;
      rating?: number;
      username?: string;
    };
  };
  onRequireAuth?: () => void;
}

export default function PostCard({ post, onRequireAuth }: PostCardProps) {
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);

  const requireAuth = () => {
    if (!isAuthenticated && onRequireAuth) {
      return onRequireAuth();
    }
  };

  const toggleLike = () => {
    if (!isAuthenticated) return requireAuth();
    setLiked(!liked);
  };

  return (
    <div
      className="
        bg-white rounded-3xl shadow-sm shadow-gray-100/70 ring-1 ring-black/5 border border-gray-100
        overflow-hidden transition-all duration-300
        hover:shadow-lg hover:shadow-gray-200/60 animate-fadeIn
      "
    >
      {/* HEADER */}
      <div className="flex items-center gap-3 p-4">
        <img
          src={post.business.profileImage || '/images/default-avatar.png'}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
        />

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{post.business.businessName}</h3>
          <p className="text-xs text-gray-500">@{post.business.username ?? 'username'}</p>

          {/* Rating */}
          <div className="flex items-center text-yellow-500 text-xs mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < (post.business.rating ?? 4) ? 'fill-yellow-500' : ''}
              />
            ))}
          </div>
        </div>

        {/* Follow Button */}
        <button
          onClick={requireAuth}
          className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-full hover:bg-gray-700 transition"
        >
          Follow
        </button>
      </div>

      {/* MEDIA (GRID) */}
      {/* MEDIA (GRID) */}
      {post.media && post.media.length > 0 && (
        <div
          className="grid gap-2 p-4"
          style={{
            gridTemplateColumns:
              post.media.length === 1 ? '1fr' : post.media.length === 2 ? '1fr 1fr' : '2fr 1fr',
          }}
        >
          {/* First image (always present) */}
          <img
            src={post.media[0]}
            className={`rounded-xl w-full object-cover transition ${
              post.media.length === 1 ? 'h-[260px]' : 'h-[260px]'
            }`}
          />

          {/* For 2+ images, render the rest in a column */}
          {post.media.length > 1 && (
            <div className="flex flex-col gap-2">
              {post.media.slice(1, 3).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  className={`rounded-xl w-full object-cover transition ${
                    post?.media?.length === 2 ? 'h-[260px]' : 'h-[125px]'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONTENT */}
      <div className="px-4">
        <h2 className="text-lg font-semibold">{post.name}</h2>
        <p className="text-orange-500 font-bold text-xl">₦{post.price.toLocaleString()}</p>

        <p className="text-gray-500 mt-1 line-clamp-2">{post.description}</p>

        {/* TAGS */}
        <div className="flex flex-wrap gap-2 mt-3">
          {post.tags?.map((tag) => (
            <span
              key={tag}
              className="bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full hover:bg-orange-100 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-between px-4 py-4 mt-2 border-t">
        <div className="flex items-center gap-5">
          <button onClick={toggleLike} className="flex items-center gap-1">
            <Heart
              className={`w-5 h-5 ${liked ? 'fill-red-500 stroke-red-500' : 'stroke-gray-600'}`}
            />
          </button>

          <button onClick={requireAuth}>
            <MessageCircle className="w-5 h-5 stroke-gray-600" />
          </button>

          <button onClick={requireAuth}>
            <Share2 className="w-5 h-5 stroke-gray-600" />
          </button>
        </div>

        <button onClick={requireAuth}>
          <Bookmark className="w-5 h-5 stroke-gray-600" />
        </button>
      </div>

      {/* FOOTER */}
      <div className="px-4 pb-4">
        <Link
          to={`/business/${post.business._id}`}
          className="
            block w-full text-center bg-gray-900 text-white py-2.5 rounded-xl
            hover:bg-black transition
          "
        >
          View Business
        </Link>
      </div>
    </div>
  );
}
