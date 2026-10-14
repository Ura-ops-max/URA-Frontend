// Public business page — ura.com.ng/<slug>. Works whether or not the visitor
// is logged in. The shop itself is the shared BusinessStorefront (same as the
// in-app business page).
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { usePublicBusiness } from '@/hooks/api/use-public-business';
import { ProfileSkeleton } from '@/components/skeleton/ProfileSkelenton';
import BusinessStorefront from '@/components/profile/BusinessStorefront';

export default function BusinessPage() {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const [searchParams] = useSearchParams();
  // Anchor-location tag from a scanned QR code (?loc=wuse2). Display only for now.
  const scanLocation = searchParams.get('loc');
  const { data, isLoading, isError } = usePublicBusiness(businessSlug);

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

  return (
    <div className="min-h-screen bg-[#FFF9F6] pt-24 md:pt-28 px-4 lg:px-12">
      <BusinessStorefront
        business={data.business}
        owner={data.owner}
        related={data.related}
        scanLocation={scanLocation}
      />
    </div>
  );
}
