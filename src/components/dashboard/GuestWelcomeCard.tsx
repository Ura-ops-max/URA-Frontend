// Shown in place of the profile card when a visitor isn't signed in.
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, Store } from 'lucide-react';
import { rememberReturnTo } from '@/lib/return-to';

export default function GuestWelcomeCard() {
  const navigate = useNavigate();
  const go = (path: string) => {
    rememberReturnTo(window.location.pathname + window.location.search);
    navigate(path);
  };

  return (
    <div className="rounded-[24px] border border-white/40 bg-white/60 p-6 text-center shadow-sm backdrop-blur-xl">
      <h3 className="text-lg font-black text-gray-900">Welcome to URA</h3>
      <p className="mt-1 text-sm text-gray-500">
        Look around freely. Sign in when you&apos;re ready to buy, chat or post.
      </p>
      <ul className="mt-4 space-y-2 text-left text-xs font-medium text-gray-600">
        <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-orange-500" /> Money held in escrow</li>
        <li className="flex items-center gap-2"><Store className="h-4 w-4 text-orange-500" /> Verified local vendors</li>
        <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-orange-500" /> Delivery to your door</li>
      </ul>
      <button
        onClick={() => go('/auth/register')}
        className="mt-5 w-full rounded-2xl bg-[#FF6B35] py-3 text-sm font-bold text-white shadow-lg shadow-[#FF6B35]/20 hover:bg-[#e85a20]"
      >
        Create account
      </button>
      <button
        onClick={() => go('/auth/login')}
        className="mt-2 w-full rounded-2xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-800 hover:bg-gray-50"
      >
        Sign in
      </button>
    </div>
  );
}
