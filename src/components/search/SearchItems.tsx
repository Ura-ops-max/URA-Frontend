
import { Star, MapPin, Package, CheckCircle, Clock } from 'lucide-react';
import { generateAvatarUrl } from '@/utils/avatar-generator';


// BUSINESS ITEM
export const BusinessItem = ({ biz, onClick }: any) => {
  // Use actual data from your controller's .populate('reviews') logic
  const rating = biz.averageRating || 0;
  const reviewCount = biz.reviewCount || 0;

  return (
    <div
      onClick={onClick}
      className="flex items-start p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="relative flex-shrink-0">
        <img
          src={biz.businessLogo || generateAvatarUrl(biz.businessName)}
          alt={biz.businessName}
          className="w-16 h-16 rounded-lg object-cover mr-4 bg-gray-100 border border-gray-50"
        />
        {/* Verification badge if the business is verified */}
        {biz.isVerified && (
          <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
            <CheckCircle size={14} className="text-blue-500 fill-blue-50" />
          </div>
        )}
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 truncate pr-2">
            {biz.businessName}
          </h3>
          {/* Status Badge */}
          {biz.isOpen ? (
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Clock size={10} /> OPEN
            </span>
          ) : (
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Clock size={10} /> CLOSED
            </span>
          )}
        </div>

        <div className="flex items-center text-sm text-gray-500 my-1">
          <div className="flex items-center bg-orange-50 px-1.5 py-0.5 rounded mr-2">
            <Star className={`w-3 h-3 mr-1 ${rating > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`} />
            <span className="text-xs font-bold text-orange-700">{rating > 0 ? rating.toFixed(1) : 'No rating'}</span>
          </div>
          <span className="text-xs text-gray-400">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-3 h-3 mr-1 text-gray-400" />
          <span className="line-clamp-1 text-xs">
            {biz.address?.fullAddress ? `${biz.address.fullAddress}` : "Location not set"}
          </span>
        </div>
      </div>
    </div>
  );
};

// USER ITEM
export const UserItem = ({ user, onClick }: any) => (
  <div
    onClick={() => onClick(`@${user.username}`, `/profile/${user.username}`)}
    className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group"
  >
    <div className="relative">
      <img
        src={user.profilePicture || generateAvatarUrl(`${user.firstName} ${user.lastName}`)}
        className="w-12 h-12 rounded-full object-cover mr-4 bg-gray-100 border-2 border-transparent group-hover:border-orange-200"
      />
      {user.isBusinessOwner && (
        <div className="absolute -bottom-1 right-3 bg-orange-500 rounded-full p-0.5 border-2 border-white">
          <CheckCircle size={10} className="text-white fill-orange-500" />
        </div>
      )}
    </div>
    <div className="flex-grow">
      <p className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
        {user.firstName} {user.lastName}
      </p>
      <p className="text-xs text-gray-500 font-medium">
        @{user.username}
      </p>
    </div>
    {user.isBusinessOwner && (
      <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-lg">
        BUSINESS
      </span>
    )}
  </div>
);

// PRODUCT ITEM
// PRODUCT ITEM
export const ProductItem = ({ prod, onClick }: any) => (
  <div 
    onClick={onClick} 
    className="flex items-center p-4 border-b hover:bg-gray-50 cursor-pointer group transition-colors"
  >
    <img 
      src={prod.media?.[0] || '/default-product.png'} 
      className="w-16 h-16 rounded-lg object-cover mr-4 bg-gray-100 border border-gray-50 transition-transform group-active:scale-95" 
      alt={prod.name}
    />
    <div className="flex-grow min-w-0"> {/* min-w-0 allows the title to truncate properly */}
      <h3 className="font-bold text-gray-800 truncate group-hover:text-orange-600 transition-colors">
        {prod.name}
      </h3>
      <p className="text-orange-600 font-semibold text-sm">
        ₦{prod.price?.toLocaleString()}
      </p>
      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
        {prod.business?.businessName || 'Store'}
      </p>
    </div>
    <Package className="w-5 h-5 text-gray-300 group-hover:text-orange-400 transition-colors shrink-0 ml-2" />
  </div>
);

// Helper to call your existing avatar function
const getAvatar = (post: any) => {
  if (post.authorType === 'Business') {
    return post.author?.businessLogo || generateAvatarUrl(post.author?.businessName || "Business");
  }
  return post.author?.profilePicture || generateAvatarUrl(`${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || post.author?.username);
};

// POST ITEM
export const PostItem = ({ post, onClick }: any) => {
  const authorName = post.authorType === 'Business' 
    ? post.author?.businessName 
    : `@${post.author?.username || 'User'}`;

  return (
    <div 
      onClick={() => onClick(post.caption, `/post/${post._id}`)} 
      className="p-4 border-b hover:bg-gray-50 cursor-pointer group transition-colors"
    >
      <div className="flex items-center mb-2">
        <div className="w-8 h-8 rounded-full mr-2 overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
          <img 
            src={getAvatar(post)} 
            alt={authorName} 
            className="w-full h-full object-cover" 
          />
        </div>
        <span className="text-sm font-bold text-gray-800 group-hover:text-orange-600 transition-colors truncate">
          {authorName}
        </span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-2">
        {post.caption}
      </p>

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag: string) => (
            <span key={tag} className="text-[10px] text-orange-500 font-bold bg-orange-50 px-1.5 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};