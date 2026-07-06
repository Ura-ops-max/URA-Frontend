import ChatBot from '@/components/homepage/ChatBot';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Store,
  Search,
  Wallet,
  BadgeCheck,
  Truck,
  UserPlus,
  PackageCheck,
} from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Secure Escrow Payments',
    desc: 'Your money is held safely and only released to the seller once you confirm your order — full buyer protection.',
  },
  {
    icon: Search,
    title: 'Discover Local Businesses',
    desc: 'Find trusted vendors and products near you with smart, AI-powered search across the marketplace.',
  },
  {
    icon: Store,
    title: 'Sell in Minutes',
    desc: 'Turn your account into a business, list products, and start receiving payments the same day.',
  },
  {
    icon: Wallet,
    title: 'Instant Wallet Funding',
    desc: 'Fund your wallet with a one-time virtual account and pay for anything on the platform instantly.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified & Trusted',
    desc: 'Business verification and transaction history help you buy and sell with confidence.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    desc: 'Connect with sellers who deliver quickly, right within your community.',
  },
];

const STEPS = [
  { icon: UserPlus, title: 'Create your account', desc: 'Sign up in seconds and verify your email to get started.' },
  { icon: Search, title: 'Discover & shop', desc: 'Browse businesses and products, and add what you love to your cart.' },
  { icon: PackageCheck, title: 'Pay securely & receive', desc: 'Pay with escrow or instantly, and confirm when your order arrives.' },
];

function Home() {
  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section>
        <div className="pb-16 pt-12 md:pb-24 lg:pt-44">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 md:flex-row md:gap-24">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="mt-8 max-w-2xl text-balance text-4xl font-medium sm:text-5xl md:text-6xl lg:mt-16 xl:text-7xl">
                <span className="text-amber-500">Ura</span>, Scale your local Business
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-lg text-slate-600">
                Connect, showcase, and grow your business in Nigeria&apos;s vibrant marketplace community.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Button asChild size="lg" variant="brand" className="px-8 text-base">
                  <Link to="/auth/login">
                    <span className="text-nowrap">Explore Business</span>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="brandSecondary" className="px-14 text-base">
                  <Link to="/auth/register">
                    <span className="text-nowrap">Join Now</span>
                  </Link>
                </Button>
              </div>
            </div>
            <img
              className="h-56 w-full flex-1 object-cover sm:h-96 lg:h-max lg:object-contain"
              src="/heroImg.svg"
              alt="URA marketplace"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-widest text-amber-500">Why URA</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
              Everything you need to buy &amp; sell with confidence
            </h2>
            <p className="mt-4 text-slate-600">
              A marketplace built for local businesses — secure, simple, and made for growth.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-100 bg-white p-6 transition hover:shadow-lg hover:shadow-slate-100"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-widest text-amber-500">How it works</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">Start in three simple steps</h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white">
                  <Icon className="h-7 w-7" />
                </div>
                <span className="mt-4 block text-xs font-black uppercase tracking-widest text-slate-300">
                  Step {i + 1}
                </span>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-linear-to-r from-amber-500 to-orange-500 px-8 py-14 text-center text-white md:py-20">
          <h2 className="text-3xl font-bold md:text-4xl">Ready to grow your business?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/90">
            Join thousands of buyers and sellers already trading securely on URA.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-white px-8 text-base font-bold text-amber-600 hover:bg-white/90">
              <Link to="/auth/register">Get Started Free</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/60 bg-transparent px-8 text-base font-bold text-white hover:bg-white/10"
            >
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      <ChatBot />
    </main>
  );
}

export default Home;
