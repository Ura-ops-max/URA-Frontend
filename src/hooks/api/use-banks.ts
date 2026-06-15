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
  return (data?.data ?? []).filter((b: Bank) => b.active && b.supports_transfer);
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
