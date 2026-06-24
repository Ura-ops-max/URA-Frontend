import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Heart, MessageCircle, ArrowRight, Home } from 'lucide-react';
import { getSinglePostQueryFn } from '@/lib/api';
import { tokenStorage } from '@/lib/token-storage';
import { generateAvatarUrl } from '@/utils/avatar-generator';

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['single-post', id],
    queryFn: () => getSinglePostQueryFn(id!),
    enabled: !!id,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFB]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FAFAFB] px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Post not found</h1>
        <p className="text-gray-500">This post may have been removed or the link is incorrect.</p>
        <Link to="/" className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-3 text-sm font-bold text-white hover:bg-[#e85a20]">
          <Home className="h-4 w-4" /> Go to URA
        </Link>
      </div>
    );
  }

  const p = post as any;
  const author = p.author ?? {};
  const name =
    p.displayName ||
    author.businessName ||
    `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim() ||
    author.username ||
    'User';
  const avatar = p.displayAvatar || author.profilePicture || author.businessLogo || generateAvatarUrl(name);
  const media: string[] = Array.isArray(p.media) ? p.media : [];
  const product = p.productDetails;
  const isLoggedIn = !!tokenStorage.getToken();

  return (
    <div className="min-h-screen bg-[#FAFAFB] px-4 py-8">
      <div className="mx-auto w-full max-w-xl">
        <article className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          {/* Author */}
          <div className="flex items-center gap-3 p-4">
            <img src={avatar} alt={name} className="h-11 w-11 rounded-full object-cover border" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900">{name}</p>
              {author.username && <p className="truncate text-xs text-gray-400">@{author.username}</p>}
            </div>
          </div>

          {/* Caption */}
          {p.caption && <p className="px-4 pb-3 text-[15px] leading-relaxed text-gray-800">{p.caption}</p>}

          {/* Media */}
          {media.length > 0 && (
            <div className={`grid gap-0.5 ${media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {media.slice(0, 4).map((url, i) => (
                <img key={i} src={url} alt="" className="max-h-[480px] w-full object-cover" />
              ))}
            </div>
          )}

          {/* Product details */}
          {product && (
            <div className="m-4 rounded-2xl bg-orange-50 p-4">
              <p className="text-sm font-bold text-gray-900">{product.name}</p>
              {product.price != null && (
                <p className="mt-1 text-lg font-black text-orange-600">₦{Number(product.price).toLocaleString()}</p>
              )}
              {product.description && (
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">{product.description}</p>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-5 border-t border-gray-50 p-4 text-gray-400">
            <span className="flex items-center gap-1.5 text-sm">
              <Heart className="h-4 w-4" /> {p.likesCount ?? p.likes?.length ?? 0}
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              <MessageCircle className="h-4 w-4" /> {p.commentsCount ?? 0}
            </span>
          </div>
        </article>

        {/* CTA */}
        <Link
          to={isLoggedIn ? '/dashboard' : '/auth/login'}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF6B35] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#e85a20]"
        >
          {isLoggedIn ? 'Open in URA' : 'Sign in to like, comment & shop'}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default PostDetail;
