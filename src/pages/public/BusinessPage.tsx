// Public business page — ura.com.ng/<slug>. Works whether or not the visitor
// is logged in. Browsing (products, posts, reviews, about) is open to anyone;
// actions that need an account (order, chat, follow, review) prompt sign-in
// instead of firing an API call while logged out.
import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { chatAPI } from '@/lib/chat-api';
import { BadgeCheck, MapPin, Phone, Star, ShoppingCart, ChevronRight } from 'lucide-react';
import { useAuthContext } from '@/context/auth-provider';
import { useCartContext } from '@/context/cart-provider';
import { PROTECTED_ROUTES } from '@/routes/common/routePaths';
import { formatNaira } from '@/lib/order-status';
import { usePublicBusiness } from '@/hooks/api/use-public-business';
import { generateAvatarUrl } from '@/utils/avatar-generator';
import ProductsFeed from '@/components/feed/ProductsFeed';
import PostsFeed from '@/components/feed/PostFeed';
import ReviewsSection from '@/components/profile/ReviewSection';
import { ProfileSkeleton } from '@/components/skeleton/ProfileSkelenton';
import { AuthPromptModal } from '@/components/shared/AuthPromptModel';

const TABS = ['Products', 'Posts', 'Reviews', 'About'] as const;
type Tab = (typeof TABS)[number];

export default function BusinessPage() {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const [searchParams] = useSearchParams();
  // Carries the anchor-location tag from a scanned QR code (?loc=wuse2) for
  // now — not yet logged anywhere; wiring that up is a follow-up.
  const scanLocation = searchParams.get('loc');

  const { isAuthenticated, user } = useAuthContext();
  const navigate = useNavigate();
  const [startingChat, setStartingChat] = useState(false);
  const { data, isLoading, isError } = usePublicBusiness(businessSlug);
  const [activeTab, setActiveTab] = useState<Tab>('Products');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authAction, setAuthAction] = useState('order');

  // Cart summary for the sticky "View cart" bar. Hooks must run before any
  // early return, so compute here. Skip lines whose product is missing.
  const { cart } = useCartContext();
  const cartItems: any[] = isAuthenticated ? (cart?.items ?? []).filter((i: any) => i?.product) : [];
  const cartCount = cartItems.reduce((n, i) => n + (Number(i.quantity) || 0), 0);
  const cartTotal = cartItems.reduce(
    (n, i) => n + (Number(i.product?.price) || 0) * (Number(i.quantity) || 0),
    0,
  );

  if (isLoading) return <ProfileSkeleton />;

  if (isError || !data?.business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-xl font-semibold">Business not found</h1>
        <p className="text-gray-500">This page doesn't exist, or the link may be out of date.</p>
        <Link to="/" className="text-orange-600 underline">
          Go to URA
        </Link>
      </div>
    );
  }

  const { business, owner } = data;
  const fallbackAvatar = generateAvatarUrl(business.businessName);
  const avatar = business.businessLogo || fallbackAvatar;

  const requireAuth = (action = 'order') => {
    setAuthAction(action);
    setShowAuthPrompt(true);
  };

  // Signed-in visitors: open (or create) a chat with this business.
  const handleMessage = async () => {
    if (!isAuthenticated || !user?._id) return requireAuth('message');
    setStartingChat(true);
    try {
      const { data: res } = await chatAPI.accessConversation({
        senderId: user._id,
        senderModel: 'User',
        receiverId: business._id as string,
        receiverModel: 'Business',
      } as any);
      navigate(`/dashboard/chat/${res.data._id}`);
    } catch (err) {
      console.error('Error starting chat:', err);
    } finally {
      setStartingChat(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#FFF9F6] pt-24 md:pt-28 px-4 lg:px-12 ${
        cartCount > 0 ? 'pb-32' : 'pb-16'
      }`}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-3xl shadow-sm ring-1 ring-black/5 overflow-hidden">
          <div className="relative h-40 md:h-52">
            {business.businessCover ? (
              <img src={business.businessCover} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="h-full w-full bg-linear-to-br from-amber-400 to-orange-600" />
            )}
            <div className="absolute left-6 md:left-10 -bottom-10">
              <img
                src={avatar}
                alt={business.businessName}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white object-cover shadow-xl bg-white"
              />
            </div>
          </div>

          <div className="pt-12 pb-6 px-6 md:px-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{business.businessName}</h1>
                {business.isVerified && <BadgeCheck className="h-5 w-5 text-sky-500" />}
              </div>
              {business.tagline && <p className="text-gray-500 mt-1">{business.tagline}</p>}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                {business.averageRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {business.averageRating.toFixed(1)} ({business.totalReviews} review
                    {business.totalReviews === 1 ? '' : 's'})
                  </span>
                )}
                {business.address?.fullAddress && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {business.address.fullAddress}
                  </span>
                )}
                {business.contact?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" /> {business.contact.phone}
                  </span>
                )}
              </div>
              {owner && <p className="text-xs text-gray-400 mt-2">Run by {owner.firstName} {owner.lastName}</p>}
              {/* Where the QR code was scanned (?loc=wuse2). Display only for now. */}
              {scanLocation && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-600">
                  <MapPin className="h-3 w-3" /> Scanned at {scanLocation}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleMessage}
                disabled={startingChat}
                className="rounded-full bg-orange-500 text-white px-5 py-2 text-sm font-medium hover:bg-orange-600 transition disabled:opacity-60"
              >
                {startingChat ? 'Opening chat…' : isAuthenticated ? 'Message' : 'Sign in to message'}
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 bg-white rounded-full p-1 ring-1 ring-black/5 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                activeTab === tab ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === 'Products' && (
            <ProductsFeed
              targetId={business._id as string}
              type="post"
              onRequireAuth={() => requireAuth('order')}
            />
          )}
          {activeTab === 'Posts' && (
            <PostsFeed
              targetId={business._id as string}
              type="post"
              onRequireAuth={() => requireAuth('interact with')}
            />
          )}
          {activeTab === 'Reviews' && <ReviewsSection itemId={business._id as string} itemModel="Business" />}
          {activeTab === 'About' && (
            <div className="bg-white rounded-2xl p-6 ring-1 ring-black/5 space-y-2 text-sm text-gray-700">
              <p>{business.about || 'No description yet.'}</p>
              {business.operatingHours?.length > 0 && (
                <div className="pt-3">
                  <h3 className="font-medium text-gray-900 mb-1">Hours</h3>
                  {business.operatingHours.map((h: any) => (
                    <div key={h.day} className="flex justify-between text-gray-500">
                      <span>{h.day}</span>
                      <span>{h.isClosed ? 'Closed' : `${h.open} – ${h.close}`}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky "View cart" bar — lets customers go straight to checkout from the shop page. */}
      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4">
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

      <AuthPromptModal
        isOpen={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        actionName={`${authAction}${authAction === 'order' ? ' from ' : ' '}${business.businessName}`}
      />
    </div>
  );
}
