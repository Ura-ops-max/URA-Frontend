import ChatBot from '@/components/homepage/ChatBot';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FadeIn, Stagger, FadeItem } from '@/components/shared/Motion';
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
    desc: 'Your money is held safely and only released to the seller once you confirm your order full buyer protection.',
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
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <h1 className="mt-8 max-w-2xl text-balance text-4xl font-medium sm:text-5xl md:text-6xl lg:mt-16 xl:text-7xl">
                Buy and sell across <span className="text-amber-500">Nigeria</span> with ease.
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-lg text-slate-600">
                URA verifies who you&apos;re dealing with and protects your money until the deal is
                done. We make buying and selling across Nigeria easy and reliable.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Button asChild size="lg" variant="brand" className="px-8 text-base">
                  <Link to="/auth/login">
                    <span className="text-nowrap">Find a Vendor You Can Trust</span>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="brandSecondary" className="px-8 text-base">
                  <Link to="/auth/register">
                    <span className="text-nowrap">Start Selling on URA</span>
                  </Link>
                </Button>
              </div>
            </motion.div>
            <motion.img
              className="h-56 w-full flex-1 rounded-3xl object-cover sm:h-96 lg:h-max lg:max-h-135"
              src="/images/newurahero.jpeg"
              alt="Buyers and vendors trading on URA"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            />
          </div>
        </div>
      </section>

      {/* For Buyers / For Vendors */}
      <section className="px-6 pb-4">
        <Stagger className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
          <FadeItem className="flex flex-col rounded-3xl border border-slate-100 bg-white p-8 transition hover:shadow-lg hover:shadow-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-slate-900">For Buyers</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">
              Shop without the fear. Every vendor is verified, your money is secured until your order
              arrives, and our search tools find exactly what you need, where you need it.
            </p>
            <Button asChild size="lg" variant="brand" className="mt-6 self-start px-8 text-base">
              <Link to="/auth/login">
                <span className="text-nowrap">Find a Vendor You Can Trust</span>
              </Link>
            </Button>
          </FadeItem>

          <FadeItem className="flex flex-col rounded-3xl border border-slate-100 bg-white p-8 transition hover:shadow-lg hover:shadow-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <Store className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-slate-900">For Vendors</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">
              Sell without any hassle. Get paid on time, and reach buyers who are ready to buy.
            </p>
            <Button
              asChild
              size="lg"
              variant="brandSecondary"
              className="mt-6 self-start px-8 text-base"
            >
              <Link to="/auth/register">
                <span className="text-nowrap">Start Selling on URA</span>
              </Link>
            </Button>
          </FadeItem>
        </Stagger>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-widest text-amber-500">Why URA</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
              Everything you need to buy &amp; sell with confidence
            </h2>
            <p className="mt-4 text-slate-600">
              A marketplace built for local businesses secure, simple, and made for growth.
            </p>
          </FadeIn>

          <Stagger className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <FadeItem
                key={title}
                className="rounded-2xl border border-slate-100 bg-white p-6 transition hover:shadow-lg hover:shadow-slate-100"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
              </FadeItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-widest text-amber-500">How it works</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">Start in three simple steps</h2>
          </FadeIn>

          <Stagger className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <FadeItem key={title} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white">
                  <Icon className="h-7 w-7" />
                </div>
                <span className="mt-4 block text-xs font-black uppercase tracking-widest text-slate-300">
                  Step {i + 1}
                </span>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-500">{desc}</p>
              </FadeItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <FadeIn className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-linear-to-r from-amber-500 to-orange-500 px-8 py-14 text-center text-white md:py-20">
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
        </FadeIn>
      </section>

      <ChatBot />
    </main>
  );
}

export default Home;
