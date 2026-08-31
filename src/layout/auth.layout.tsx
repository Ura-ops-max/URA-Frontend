import { Outlet, Link } from 'react-router-dom';
import { ShieldCheck, BadgeCheck, Truck } from 'lucide-react';

const FEATURES = [
  { icon: BadgeCheck, text: 'Verified vendors you can trust' },
  { icon: ShieldCheck, text: 'Escrow-protected payments' },
  { icon: Truck, text: 'Fast delivery across Nigeria' },
];

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* LEFT: on-brand hero panel (desktop only) */}
      <div className="relative hidden w-[45%] overflow-hidden bg-linear-to-br from-amber-500 to-orange-600 lg:flex lg:flex-col lg:justify-between p-12">
        {/* Decorative accents */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[28px] border-white/10" />
          <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-10 bottom-24 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        </div>

        {/* Logo */}
        <Link to="/" className="relative z-10 inline-flex">
          <img src="/images/ura-footer.png" alt="URA" className="h-9 w-auto" />
        </Link>

        {/* Headline + features */}
        <div className="relative z-10">
          <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight text-white">
            Buy &amp; sell securely across Nigeria.
          </h1>
          <p className="mt-4 max-w-md text-lg font-medium leading-relaxed text-white/85">
            Join a marketplace built on trust — verified sellers, protected payments, and delivery
            to your door.
          </p>

          <ul className="mt-8 space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/95">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer note */}
        <p className="relative z-10 text-xs font-medium text-white/70">
          © {new Date().getFullYear()} URA · Nigeria's trusted marketplace
        </p>
      </div>

      {/* RIGHT: form */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 py-12 lg:w-[55%] lg:px-20">
        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-right-8 duration-700">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
