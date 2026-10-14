// One storefront for a shop, used by BOTH the in-app page
// (/dashboard/profile/business/:id) and the public link (ura.com.ng/<slug>),
// so the two can't drift apart. Browsing is open to anyone; actions that need
// an account (follow, save, message, order) ask a signed-out visitor to sign in.
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Bookmark,
  ChevronRight,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Settings,
  Share2,
  ShoppingCart,
  Star,
  User,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { chatAPI } from '@/lib/chat-api';
import { formatNaira } from '@/lib/order-status';
import { generateAvatarUrl } from '@/utils/avatar-generator';
import { useAuthContext } from '@/context/auth-provider';
import { useCartContext } from '@/context/cart-provider';
import { useProfileActions } from '@/hooks/api/use-user-profile';
import { useToggleBookmark } from '@/hooks/api/use-feed';
import { PROTECTED_ROUTES } from '@/routes/common/routePaths';
import ProductsFeed from '@/components/feed/ProductsFeed';
import PostsFeed from '@/components/feed/PostFeed';
import ReviewsSection from '@/components/profile/ReviewSection';
import FollowList from '@/components/profile/FollowList';
import { BusinessContactInfo } from '@/components/profile/BusinessContactInfo';
import { UnfollowDialog } from '@/components/profile/UnfollowDialog';
import { AuthPromptModal } from '@/components/shared/AuthPromptModel';

type Tab = 'Products' | 'Posts' | 'Reviews' | 'About' | 'Followers';

export interface StorefrontRelated {
  isFollowing?: boolean;
  isBookmarked?: boolean;
  isOwner?: boolean;
  counts?: { products?: number; posts?: number; followers?: number };
}

interface Props {
  business: any;
  /** Shown as "Run by …" only; visitors don't get a link to the owner's profile. */
  owner?: { _id?: string; firstName?: string; lastName?: string } | null;
  related?: StorefrontRelated;
  /** Where a QR code was scanned (?loc=wuse2). Display only. */
  scanLocation?: string | null;
  /** Inside the app, phones have a bottom menu the cart bar must sit above. */
  inApp?: boolean;
}

const SEARCH_DELAY_MS = 300;

export default function BusinessStorefront({
  business,
  owner,
  related,
  scanLocation,
  inApp = false,
}: Props) {
  const navigate = useNavigate();
  const { isAuthenticated, user: me, related: myRelated } = useAuthContext();
  const businessId = String(business._id);

  // The server says whether the viewer owns the shop; fall back to the
  // signed-in user's own business list while that loads.
  const myBusinessIds = ((myRelated as any)?.businesses ?? []).map((b: any) => String(b?._id));
  const isOwner = Boolean(related?.isOwner) || myBusinessIds.includes(businessId);

  const [activeTab, setActiveTab] = useState<Tab>('Products');
  const tabs: Tab[] = isOwner
    ? ['Products', 'Posts', 'Reviews', 'About', 'Followers']
    : ['Products', 'Posts', 'Reviews', 'About'];

  // ── Search inside the shop (waits until typing pauses) ─────────────────
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim().slice(0, 60)), SEARCH_DELAY_MS);
    return () => clearTimeout(id);
  }, [searchInput]);

  // ── Follow / Save (optimistic) ─────────────────────────────────────────
  const [isFollowing, setIsFollowing] = useState(Boolean(related?.isFollowing));
  const [followers, setFollowers] = useState(related?.counts?.followers ?? 0);
  const [isSaved, setIsSaved] = useState(Boolean(related?.isBookmarked));
  const [showUnfollow, setShowUnfollow] = useState(false);
  useEffect(() => {
    setIsFollowing(Boolean(related?.isFollowing));
    setFollowers(related?.counts?.followers ?? 0);
    setIsSaved(Boolean(related?.isBookmarked));
  }, [related]);
  const { follow } = useProfileActions(businessId, true);
  const { mutate: toggleSave } = useToggleBookmark(businessId, 'Business');

  // ── Sign-in prompt for signed-out visitors ─────────────────────────────
  const [authAction, setAuthAction] = useState<string | null>(null);
  const requireAuth = (action: string) => setAuthAction(action);

  const onFollow = () => {
    if (!isAuthenticated) return requireAuth('follow');
    if (isFollowing) return setShowUnfollow(true);
    setIsFollowing(true);
    setFollowers((n) => n + 1);
    follow();
  };
  const confirmUnfollow = () => {
    setIsFollowing(false);
    setFollowers((n) => Math.max(0, n - 1));
    follow();
    setShowUnfollow(false);
  };
  const onSave = () => {
    if (!isAuthenticated) return requireAuth('save');
    setIsSaved((v) => !v);
    toggleSave();
  };

  const [startingChat, setStartingChat] = useState(false);
  const onMessage = async () => {
    if (!isAuthenticated || !me?._id) return requireAuth('message');
    setStartingChat(true);
    try {
      const { data } = await chatAPI.accessConversation({
        senderId: me._id,
        senderModel: 'User',
        receiverId: businessId,
        receiverModel: 'Business',
      } as any);
      navigate(`/dashboard/chat/${data.data._id}`);
    } catch (err) {
      console.error('Error starting chat:', err);
      toast.error('Could not open the chat. Please try again.');
    } finally {
      setStartingChat(false);
    }
  };

  // Share the public link when the shop has one.
  const shareUrl = business.slug
    ? `${window.location.origin}/${business.slug}`
    : window.location.href;
  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: business.businessName, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Shop link copied!');
      }
    } catch {
      /* share sheet closed */
    }
  };

  // ── Sticky "View cart" bar ─────────────────────────────────────────────
  const { cart } = useCartContext();
  const cartItems: any[] = isAuthenticated
    ? (cart?.items ?? []).filter((i: any) => i?.product)
    : [];
  const cartCount = cartItems.reduce((n, i) => n + (Number(i.quantity) || 0), 0);
  const cartTotal = cartItems.reduce(
    (n, i) => n + (Number(i.product?.price) || 0) * (Number(i.quantity) || 0),
    0,
  );

  const avatar = business.businessLogo || generateAvatarUrl(business.businessName || 'Business');
  const rating = Number(business.averageRating) || 0;
  const reviews = Number(business.totalReviews) || 0;
  const counts = related?.counts ?? {};

  const actionBtn =
    'flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60';

  return (
    <div className={cn('max-w-5xl mx-auto', cartCount > 0 ? 'pb-28' : 'pb-10')}>
      {/* ── Shop card ─────────────────────────────────────────────────── */}
      <header className="bg-white rounded-3xl shadow-sm ring-1 ring-black/5 overflow-hidden">
        <div className="relative h-28 md:h-52">
          {business.businessCover ? (
            <img src={business.businessCover} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-amber-400 to-orange-600" />
          )}
          <div className="absolute left-5 md:left-10 -bottom-9 md:-bottom-10">
            <img
              src={avatar}
              alt={business.businessName}
              className="w-18 h-18 md:w-24 md:h-24 rounded-full border-4 border-white object-cover shadow-xl bg-white"
            />
          </div>
        </div>

        <div className="pt-11 md:pt-12 pb-5 px-5 md:px-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 truncate">
                {business.businessName}
              </h1>
              {business.isVerified && <BadgeCheck className="h-5 w-5 shrink-0 text-sky-500" />}
            </div>
            {business.tagline && <p className="text-gray-500 mt-1">{business.tagline}</p>}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
              {/* Real rating only — hidden until the shop has been reviewed. */}
              {reviews > 0 && rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {rating.toFixed(1)} ({reviews} review{reviews === 1 ? '' : 's'})
                </span>
              )}
              <span>
                <b className="text-gray-800">{counts.products ?? 0}</b> product
                {(counts.products ?? 0) === 1 ? '' : 's'}
              </span>
              <span>
                <b className="text-gray-800">{followers}</b> follower{followers === 1 ? '' : 's'}
              </span>
              {/* Phones: address and phone live in the About tab so products show sooner. */}
              {business.address?.fullAddress && (
                <span className="hidden md:flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {business.address.fullAddress}
                </span>
              )}
              {business.contact?.phone && (
                <span className="hidden md:flex items-center gap-1">
                  <Phone className="h-4 w-4" /> {business.contact.phone}
                </span>
              )}
            </div>

            {owner?.firstName && (
              <p className="text-xs text-gray-400 mt-2">
                Run by {owner.firstName} {owner.lastName}
              </p>
            )}
            {scanLocation && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-600">
                <MapPin className="h-3 w-3" /> Scanned at {scanLocation}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {isOwner ? (
              <>
                <Link
                  to="/dashboard/settings/profile?page=business"
                  className={cn(actionBtn, 'bg-orange-500 text-white hover:bg-orange-600')}
                >
                  <Settings size={16} /> Manage
                </Link>
                <Link
                  to={`/dashboard/profile/user/${me?._id ?? ''}`}
                  className={cn(actionBtn, 'bg-gray-100 text-gray-700 hover:bg-gray-200')}
                >
                  <User size={16} /> My profile
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={onFollow}
                  className={cn(
                    actionBtn,
                    isFollowing
                      ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      : 'bg-orange-500 text-white hover:bg-orange-600',
                  )}
                >
                  {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button
                  onClick={onSave}
                  className={cn(
                    actionBtn,
                    'ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50',
                    isSaved && 'bg-orange-50 ring-orange-100',
                  )}
                >
                  <Bookmark
                    size={16}
                    className={isSaved ? 'fill-orange-500 text-orange-500' : 'text-gray-400'}
                  />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => void onMessage()}
                  disabled={startingChat}
                  className={cn(actionBtn, 'ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50')}
                >
                  <MessageCircle size={16} className="text-orange-500" />
                  {startingChat ? 'Opening…' : 'Message'}
                </button>
              </>
            )}
            <button
              onClick={() => void onShare()}
              aria-label="Share shop"
              className={cn(actionBtn, 'ring-1 ring-gray-200 text-gray-700 hover:bg-gray-50 px-3')}
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className="mt-5 flex gap-1 bg-white rounded-full p-1 ring-1 ring-black/5 w-fit max-w-full overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap',
              activeTab === tab ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {activeTab === 'Products' && (
          <>
            {/* One clear button only: a plain text input (not type="search",
                which adds the browser's own second ×). */}
            <div className="relative mb-4 max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                inputMode="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                maxLength={60}
                placeholder={`Search ${business.businessName}`}
                aria-label="Search this shop"
                className="w-full h-11 rounded-full bg-white pl-10 pr-10 text-sm ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-orange-300"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <ProductsFeed
              targetId={businessId}
              type="post"
              search={search}
              onRequireAuth={() => requireAuth('order')}
            />
          </>
        )}
        {activeTab === 'Posts' && (
          <PostsFeed
            targetId={businessId}
            type="post"
            onRequireAuth={() => requireAuth('interact with')}
          />
        )}
        {activeTab === 'Reviews' && <ReviewsSection itemId={businessId} itemModel="Business" />}
        {activeTab === 'About' && (
          <div className="bg-white rounded-2xl p-5 md:p-6 ring-1 ring-black/5 space-y-4 text-sm text-gray-700">
            <p className="whitespace-pre-line">{business.about || 'No description yet.'}</p>
            <BusinessContactInfo business={business} />
          </div>
        )}
        {activeTab === 'Followers' && isOwner && (
          <FollowList targetId={businessId} type="followers" currentUser={me} />
        )}
      </div>

      {/* ── Sticky "View cart" bar ────────────────────────────────────── */}
      {cartCount > 0 && (
        <div
          className={cn(
            'fixed inset-x-0 z-30 px-4 pb-4',
            inApp ? 'bottom-16 md:bottom-0' : 'bottom-0',
          )}
        >
          <Link
            to={PROTECTED_ROUTES.CART}
            className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl bg-orange-600 px-5 py-3.5 text-white shadow-xl shadow-orange-900/20 transition hover:bg-orange-700"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <ShoppingCart className="h-5 w-5" />
              {cartCount} item{cartCount === 1 ? '' : 's'} · {formatNaira(cartTotal)}
            </span>
            <span className="flex items-center gap-1 text-sm font-bold">
              View cart &amp; checkout <ChevronRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      )}

      <UnfollowDialog
        isOpen={showUnfollow}
        onClose={() => setShowUnfollow(false)}
        onConfirm={confirmUnfollow}
        displayName={business.businessName}
      />

      <AuthPromptModal
        isOpen={authAction !== null}
        onClose={() => setAuthAction(null)}
        actionName={`${authAction ?? 'continue'}${authAction === 'order' ? ' from ' : ' '}${business.businessName}`}
      />
    </div>
  );
}
