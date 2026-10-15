// One storefront for a shop, used by BOTH the in-app page
// (/dashboard/profile/business/:id) and the public link (ura.com.ng/<slug>),
// so the two can't drift apart. Browsing is open to anyone; actions that need
// an account (follow, save, message, order) ask a signed-out visitor to sign in.
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Bookmark,
  Boxes,
  ChevronRight,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Settings,
  Share2,
  ShoppingCart,
  Star,
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
  const productCount = counts.products ?? 0;
  const today = todayStatus(business.operatingHours);
  const phone: string | undefined = business.contact?.phone;
  const address: string | undefined = business.address?.fullAddress;

  const iconBtn =
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gray-600 ring-1 ring-gray-200 transition hover:bg-gray-50 hover:text-gray-900 active:scale-95 disabled:opacity-60';

  // ── Actions (shared by the phone header and the desktop card) ───────────
  const actions = isOwner ? (
    <div className="flex gap-2">
      <Link
        to="/dashboard/settings/profile?page=business"
        className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-black"
      >
        <Settings size={16} /> Manage shop
      </Link>
      <Link
        to="/dashboard/inventory"
        title="Inventory"
        aria-label="Inventory"
        className={iconBtn}
      >
        <Boxes size={17} />
      </Link>
      <button onClick={() => void onShare()} title="Share shop" aria-label="Share shop" className={iconBtn}>
        <Share2 size={17} />
      </button>
    </div>
  ) : (
    <div className="flex gap-2">
      <button
        onClick={onFollow}
        className={cn(
          'flex h-10 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition active:scale-[0.98]',
          isFollowing
            ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            : 'bg-orange-500 text-white shadow-sm shadow-orange-500/30 hover:bg-orange-600',
        )}
      >
        {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
        {isFollowing ? 'Following' : 'Follow'}
      </button>
      <button
        onClick={() => void onMessage()}
        disabled={startingChat}
        title="Message"
        aria-label="Message the shop"
        className={iconBtn}
      >
        {startingChat ? <Loader2 size={17} className="animate-spin" /> : <MessageCircle size={17} />}
      </button>
      <button
        onClick={onSave}
        title={isSaved ? 'Saved' : 'Save'}
        aria-label={isSaved ? 'Remove from saved' : 'Save shop'}
        aria-pressed={isSaved}
        className={cn(iconBtn, isSaved && 'bg-orange-50 ring-orange-200 text-orange-600')}
      >
        <Bookmark size={17} className={isSaved ? 'fill-orange-500' : ''} />
      </button>
      <button onClick={() => void onShare()} title="Share shop" aria-label="Share shop" className={iconBtn}>
        <Share2 size={17} />
      </button>
    </div>
  );

  const statusPill = today && (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        today.open ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', today.open ? 'bg-emerald-500' : 'bg-gray-400')} />
      {today.label}
    </span>
  );

  const ratingLine =
    reviews > 0 && rating > 0 ? (
      <button
        onClick={() => setActiveTab('Reviews')}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
      >
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        <b className="font-semibold text-gray-900">{rating.toFixed(1)}</b>
        <span className="text-gray-400">({reviews})</span>
      </button>
    ) : (
      <span className="text-sm text-gray-400">No reviews yet</span>
    );

  return (
    <div className={cn('mx-auto max-w-7xl', cartCount > 0 ? 'pb-28' : 'pb-12')}>
      {/* ── Cover ─────────────────────────────────────────────────────── */}
      <div className="relative h-32 overflow-hidden rounded-3xl sm:h-44 lg:h-56">
        {business.businessCover ? (
          <img src={business.businessCover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-amber-400 via-orange-500 to-orange-600">
            <div aria-hidden className="absolute -right-10 -top-16 h-56 w-56 rounded-full border-24 border-white/10" />
            <div aria-hidden className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
        {scanLocation && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-orange-600 backdrop-blur">
            <MapPin className="h-3 w-3" /> Scanned at {scanLocation}
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8">
        {/* ── Shop card (sticky on desktop) ──────────────────────────── */}
        <aside className={cn('lg:sticky lg:self-start', inApp ? 'lg:top-20' : 'lg:top-24')}>
          <div className="relative -mt-10 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5 lg:-mt-16">
            <div className="flex items-end gap-3 lg:block">
              <img
                src={avatar}
                alt={business.businessName}
                className="-mt-12 h-20 w-20 shrink-0 rounded-2xl border-4 border-white bg-white object-cover shadow-lg lg:-mt-16 lg:h-24 lg:w-24"
              />
              <div className="min-w-0 pb-1 lg:mt-3 lg:pb-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="truncate text-lg font-bold tracking-tight text-gray-900 lg:text-xl">
                    {business.businessName}
                  </h1>
                  {business.isVerified && <BadgeCheck className="h-5 w-5 shrink-0 text-sky-500" />}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {ratingLine}
                  {business.category && (
                    <span className="text-sm text-gray-400">{business.category}</span>
                  )}
                </div>
              </div>
            </div>

            {business.tagline && (
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{business.tagline}</p>
            )}

            {/* Stats */}
            <dl className="mt-4 grid grid-cols-3 divide-x divide-gray-100 rounded-2xl bg-gray-50 py-2.5 text-center">
              <Stat label="Products" value={productCount} onClick={() => setActiveTab('Products')} />
              <Stat label="Followers" value={followers} />
              <Stat label="Posts" value={counts.posts ?? 0} onClick={() => setActiveTab('Posts')} />
            </dl>

            <div className="mt-4">{actions}</div>

            {/* Quick facts — desktop only; phones get these in the About tab. */}
            <div className="mt-5 hidden space-y-3 border-t border-gray-100 pt-4 text-sm lg:block">
              {statusPill}
              {address && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2.5 text-gray-600 hover:text-gray-900"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <span className="line-clamp-2">{address}</span>
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-2.5 text-gray-600 hover:text-gray-900">
                  <Phone className="h-4 w-4 shrink-0 text-gray-400" /> {phone}
                </a>
              )}
              <button
                onClick={() => setActiveTab('About')}
                className="text-xs font-semibold text-orange-600 hover:underline"
              >
                Hours &amp; more info
              </button>
              {owner?.firstName && (
                <p className="text-xs text-gray-400">
                  Run by {owner.firstName} {owner.lastName}
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* ── Main ───────────────────────────────────────────────────── */}
        <main className="min-w-0 lg:pt-5">
          {/* Toolbar: tabs + shop search, stays on screen while scrolling */}
          {/* Parks just below the app header (64px) or the public nav bar. */}
          <div
            className={cn(
              'sticky z-20 -mx-4 px-4 py-3 backdrop-blur-md lg:mx-0 lg:px-0',
              inApp ? 'top-16 bg-[#FAFAFB]/85' : 'top-[4.5rem] bg-[#FFF9F6]/90 lg:top-20',
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <nav
                className="flex w-full gap-1 overflow-x-auto rounded-2xl bg-white p-1 ring-1 ring-black/5 sm:w-auto"
                aria-label="Shop sections"
              >
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    aria-current={activeTab === tab ? 'page' : undefined}
                    className={cn(
                      'flex-1 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition sm:flex-none',
                      activeTab === tab
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                    )}
                  >
                    {tab}
                    {tab === 'Products' && productCount > 0 && (
                      <span
                        className={cn(
                          'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                          activeTab === tab ? 'bg-white/20' : 'bg-gray-100 text-gray-500',
                        )}
                      >
                        {productCount}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              {activeTab === 'Products' && (
                // One clear button only: a plain text input (not type="search",
                // which adds the browser's own second ×).
                <div className="relative w-full sm:w-72">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    inputMode="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    maxLength={60}
                    placeholder={`Search ${business.businessName}`}
                    aria-label="Search this shop"
                    className="h-11 w-full rounded-2xl bg-white pl-10 pr-10 text-sm ring-1 ring-gray-200 outline-none transition focus:ring-2 focus:ring-orange-300"
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
              )}
            </div>
          </div>

          <div className="mt-2">
            {activeTab === 'Products' && (
              <ProductsFeed
                targetId={businessId}
                type="post"
                search={search}
                onRequireAuth={() => requireAuth('order')}
                gridClassName="lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              />
            )}
            {activeTab === 'Posts' && (
              <div className="mx-auto max-w-2xl">
                <PostsFeed
                  targetId={businessId}
                  type="post"
                  onRequireAuth={() => requireAuth('interact with')}
                />
              </div>
            )}
            {activeTab === 'Reviews' && (
              <div className="mx-auto max-w-3xl">
                <ReviewsSection itemId={businessId} itemModel="Business" />
              </div>
            )}
            {activeTab === 'About' && (
              <div className="grid gap-4 md:grid-cols-2">
                <section className="rounded-3xl bg-white p-5 ring-1 ring-black/5 md:p-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">About</h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                    {business.about || 'No description yet.'}
                  </p>
                  {owner?.firstName && (
                    <p className="mt-4 text-xs text-gray-400">
                      Run by {owner.firstName} {owner.lastName}
                    </p>
                  )}
                </section>
                <section className="rounded-3xl bg-white p-5 ring-1 ring-black/5 md:p-6">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                      Contact &amp; hours
                    </h2>
                    {statusPill}
                  </div>
                  <div className="mt-3">
                    <BusinessContactInfo business={business} />
                  </div>
                </section>
              </div>
            )}
            {activeTab === 'Followers' && isOwner && (
              <div className="mx-auto max-w-2xl">
                <FollowList targetId={businessId} type="followers" currentUser={me} />
              </div>
            )}
          </div>
        </main>
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
            className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl bg-gray-900 px-5 py-3.5 text-white shadow-2xl shadow-black/20 transition hover:bg-black"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold">
              <span className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold">
                  {cartCount}
                </span>
              </span>
              {formatNaira(cartTotal)}
            </span>
            <span className="flex items-center gap-1 text-sm font-bold text-orange-300">
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

function Stat({ label, value, onClick }: { label: string; value: number; onClick?: () => void }) {
  const body = (
    <>
      <dd className="text-base font-bold tabular-nums text-gray-900">{value.toLocaleString()}</dd>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</dt>
    </>
  );
  return onClick ? (
    <button onClick={onClick} className="flex flex-col-reverse items-center rounded-lg transition hover:bg-white">
      {body}
    </button>
  ) : (
    <div className="flex flex-col-reverse items-center">{body}</div>
  );
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** "Open today 09:00 – 18:00" / "Closed today", or null when hours aren't set. */
function todayStatus(hours: any[] | undefined): { open: boolean; label: string } | null {
  if (!Array.isArray(hours) || hours.length === 0) return null;
  const today = hours.find((h) => h?.day === DAYS[new Date().getDay()]);
  if (!today) return null;
  if (today.isClosed || today.open === 'Closed' || !today.open) {
    return { open: false, label: 'Closed today' };
  }
  return { open: true, label: `Open today ${today.open}${today.close ? ` – ${today.close}` : ''}` };
}
