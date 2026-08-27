import { useQuery } from '@tanstack/react-query';
import paylukAPI from '@/lib/payluk-axios';

export interface Bank {
  id: number;
  name: string;
  slug: string;
  code: string;
  supports_transfer: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
}

async function fetchBanks(): Promise<Bank[]> {
  const { data } = await paylukAPI.get('/payment/bank-list');
  // Payluk returns each bank as just { name, code } — it does NOT send
  // `active`/`supports_transfer`, so filtering on those wiped out every bank.
  // The bank-list endpoint already only returns transfer-capable banks, so we
  // just normalise the shape the UI expects.
  const list = (data?.data ?? []) as Array<{ name?: string; code?: string }>;
  return list
    .filter((b) => b?.name && b?.code)
    .map((b, i) => ({
      id: i,
      name: b.name as string,
      slug: (b.name as string).toLowerCase().replace(/\s+/g, '-'),
      code: b.code as string,
      supports_transfer: true,
      active: true,
      country: 'Nigeria',
      currency: 'NGN',
      type: 'nuban',
    }));
}

export function useBanks() {
  return useQuery({
    queryKey: ['payluk', 'banks'],
    queryFn: fetchBanks,
    staleTime: 1000 * 60 * 60, // 1 hour — bank list rarely changes
  });
}

export type BankCategory =
  | 'All'
  | 'Commercial'
  | 'Microfinance'
  | 'Mortgage'
  | 'Digital'
  | 'Finance';

export function getBankCategory(bank: Bank): BankCategory {
  const n = bank.name.toLowerCase();
  if (
    /\b(kuda|opay|palmpay|moniepoint|fairmoney|carbon|eyowo|gomoney|paga|pocket|zap|tenn)\b/.test(n)
  )
    return 'Digital';
  if (/microfinance|mfb\b| mfb | mfb$/.test(n)) return 'Microfinance';
  if (/mortgage/.test(n)) return 'Mortgage';
  if (/finance(?! bank)/.test(n)) return 'Finance';
  return 'Commercial';
}
