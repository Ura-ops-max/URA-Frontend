// "Google ready" bar for shop owners on the dashboard: whether their shop
// page can be found on Google, and plain next steps when it can't yet.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Search, X } from 'lucide-react';
import API from '@/lib/axios-client';
import { useAuthContext } from '@/context/auth-provider';
import { IconButton } from '@/components/ui/icon-button';

interface ShopReadiness {
  businessId: string;
  slug: string | null;
  url: string | null;
  ready: boolean;
  nextSteps: string[];
}

const HIDE_KEY = 'ura.googleReadyBar.hidden';

/** Where each next step is done. */
function stepLink(step: string): string {
  if (step.startsWith('Add a product')) return '/dashboard/post/create?type=product';
  return '/dashboard/settings/profile';
}

function readHidden(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(HIDE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export default function GoogleReadyBar() {
  const { user } = useAuthContext();
  const isOwner = Boolean(user?.isBusinessOwner);
  const [hidden, setHidden] = useState<string[]>(readHidden);
  const { data } = useQuery({
    queryKey: ['seo', 'readiness', 'mine'],
    queryFn: async (): Promise<ShopReadiness[]> => (await API.get('/seo/readiness/mine')).data?.shops ?? [],
    enabled: isOwner,
    staleTime: 5 * 60_000,
  });

  const shop = data?.[0];
  // Hide a "ready" bar after it was closed; a "not ready" bar comes back next visit.
  const key = shop ? `${shop.businessId}:${shop.ready ? 'ready' : 'todo'}` : '';
  if (!isOwner || !shop || hidden.includes(key)) return null;

  const close = () => {
    const next = [...hidden, key];
    setHidden(next);
    if (shop.ready) {
      try {
        window.localStorage.setItem(HIDE_KEY, JSON.stringify(next));
      } catch {
        // Storage blocked: hidden for this visit only.
      }
    }
  };

  if (shop.ready) {
    return (
      <div className="mb-3 flex items-center gap-2 rounded-2xl border border-green-100 bg-green-50 py-1 pl-3 text-sm text-green-800">
        <CheckCircle2 size={18} className="shrink-0" aria-hidden />
        <p className="min-w-0 flex-1">
          Google ready.{' '}
          {shop.url && (
            <a href={shop.url} target="_blank" rel="noopener noreferrer" className="font-bold underline">
              View your shop page
            </a>
          )}
        </p>
        <IconButton label="Close" onClick={close} className="text-green-700">
          <X size={16} aria-hidden />
        </IconButton>
      </div>
    );
  }

  return (
    <div className="mb-3 rounded-2xl border border-orange-100 bg-orange-50/70 p-3">
      <div className="flex items-start gap-2">
        <Search size={18} className="mt-0.5 shrink-0 text-orange-600" aria-hidden />
        <p className="min-w-0 flex-1 text-sm text-gray-800">
          <span className="font-bold">Not on Google yet.</span> Do one of these so shoppers can find your shop:
        </p>
        <IconButton label="Close" onClick={close} className="-mt-2 -mr-1 text-gray-500">
          <X size={16} aria-hidden />
        </IconButton>
      </div>
      <ul className="mt-2 flex flex-wrap gap-2">
        {shop.nextSteps.slice(0, 3).map((step) => (
          <li key={step}>
            <Link
              to={stepLink(step)}
              className="inline-flex min-h-11 items-center rounded-xl border border-orange-200 bg-white px-3 text-sm font-semibold text-orange-700"
            >
              {step}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
