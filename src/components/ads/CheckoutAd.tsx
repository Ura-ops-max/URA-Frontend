import { useEffect, useState } from 'react';
import API from '@/lib/axios-client';

interface AdData {
  format: 'html';
  html: string;
  destination?: string;
}

/**
 * A single 300x250 sponsored ad shown on checkout screens. The ad HTML comes
 * from ura-rmn via our backend and is rendered inside a locked (sandboxed)
 * iframe so it can never touch the page. Renders nothing when there is no ad,
 * so checkout looks and works exactly the same without it.
 *
 * The ad is cached per shop for 60s on the client, so moving between checkout
 * steps reuses the same ad instead of asking the server again.
 */

const cache = new Map<string, { ad: AdData | null; until: number }>();

export default function CheckoutAd({
  businessId,
  compact = false,
}: {
  businessId?: string;
  compact?: boolean;
}) {
  const [ad, setAd] = useState<AdData | null>(null);

  useEffect(() => {
    if (!businessId) {
      setAd(null);
      return;
    }

    const cached = cache.get(businessId);
    if (cached && cached.until > Date.now()) {
      setAd(cached.ad);
      return;
    }

    let active = true;
    API.get('/ads/checkout', { params: { businessId } })
      .then(({ data }) => {
        const next: AdData | null = data?.ad?.format === 'html' ? data.ad : null;
        cache.set(businessId, { ad: next, until: Date.now() + 60_000 });
        if (active) setAd(next);
      })
      .catch(() => {
        if (active) setAd(null);
      });

    return () => {
      active = false;
    };
  }, [businessId]);

  if (!ad || ad.format !== 'html') return null;

  return (
    <div className={`flex justify-center ${compact ? 'mt-3' : 'mt-4'}`}>
      <iframe
        title="Sponsored"
        srcDoc={ad.html}
        sandbox="allow-popups allow-popups-to-escape-sandbox"
        width={300}
        height={250}
        scrolling="no"
        className="rounded-xl border border-gray-100"
        style={{ width: 300, height: 250, border: 'none' }}
      />
    </div>
  );
}
