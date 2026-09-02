import ChatBot from '@/components/homepage/ChatBot';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FadeIn, Stagger, FadeItem } from '@/components/shared/Motion';
import { categoryColor } from '@/lib/category-colors';
import {
  ShieldCheck,
  Store,
  Search,
  Wallet,
  BadgeCheck,
  Truck,
  UserPlus,
  PackageCheck,
  Check,
  Sparkles,
  Shirt,
  Smartphone,
  Laptop,
  House,
  ShoppingBasket,
  HelpCircle,
} from 'lucide-react';

const BUYER_POINTS = ['Every vendor is verified', 'Money secured until delivery', 'AI-powered product search'];
const VENDOR_POINTS = ['Get paid on time', 'Reach buyers ready to buy', 'List your products in minutes'];

const CATEGORIES = [
  { icon: Shirt, name: 'Fashion' },
  { icon: Smartphone, name: 'Phones' },
  { icon: Laptop, name: 'Electronics' },
  { icon: Sparkles, name: 'Beauty & Care' },
  { icon: House, name: 'Home & Living' },
  { icon: ShoppingBasket, name: 'Groceries' },
];

const FAQS = [
  {
    q: 'How does escrow protect me?',
    a: "Your payment is held safely by URA and only released to the seller after you confirm your order arrived. If something goes wrong, your money is protected.",
  },
  {
    q: 'Do I need to fund a wallet before buying?',
    a: 'No. You can pay by bank transfer straight from any bank app at checkout, with no wallet top-up needed. Or pay from your URA wallet if you have a balance.',
  },
  {
    q: 'How much does delivery cost?',
    a: "Delivery is calculated live at checkout based on the seller's location and your destination. You can also choose pickup to skip delivery fees entirely.",
  },
  {
    q: 'How do I start selling?',
    a: 'Create an account, set up your business profile, and list your products. You can start receiving payments the same day.',
  },
];

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
      <section className="relative">
        {/* Decorative background glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />
        </div>

        <div className="pb-16 pt-12 md:pb-24 lg:pt-40">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 md:flex-row md:items-center md:gap-16">
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-700">
                <Sparkles className="h-3.5 w-3.5" />
                Escrow-protected · Verified vendors
              </span>

              <h1 className="mt-6 max-w-2xl text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl xl:text-7xl">
                Buy and sell across <span className="text-amber-500">Nigeria</span> with ease.
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-slate-600">
                URA verifies who you&apos;re dealing with and protects your money until the deal is
                done. We make buying and selling across Nigeria easy and reliable.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Button asChild size="lg" variant="brand" className="w-full sm:w-auto px-8 text-base">
                  <Link to="/auth/login">
                    <span className="text-nowrap">Find a Vendor You Can Trust</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="brandSecondary"
                  className="w-full sm:w-auto px-8 text-base"
                >
                  <Link to="/auth/register">
                    <span className="text-nowrap">Start Selling on URA</span>
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:justify-start">
                {['Money held in escrow', 'Every vendor verified', 'Nationwide delivery'].map(
                  (point) => (
                    <span
                      key={point}
                      className="flex items-center gap-1.5 text-sm font-medium text-slate-500"
                    >
                      <Check className="h-4 w-4 text-amber-500" />
                      {point}
                    </span>
                  ),
                )}
              </div>
            </motion.div>

            <motion.div
              className="flex-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            >
              <img
                className="h-56 w-full rounded-3xl object-cover shadow-2xl shadow-amber-500/10 ring-1 ring-slate-900/5 sm:h-96 lg:h-max lg:max-h-135"
                src="/images/newurahero.jpeg"
                alt="Buyers and vendors trading on URA"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* For Buyers / For Vendors */}
      <section className="px-6 pb-4">
        <Stagger className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
          <FadeItem className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500 transition group-hover:bg-amber-500 group-hover:text-white">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-xl font-bold text-slate-900">For Buyers</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Shop without the fear. Every vendor is verified, your money is secured until your order
              arrives, and our search tools find exactly what you need, where you need it.
            </p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {BUYER_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <Check className="h-3 w-3" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <Button asChild size="lg" variant="brand" className="mt-7 w-full sm:w-auto sm:self-start px-8 text-base">
              <Link to="/auth/login">
                <span className="text-nowrap">Find a Vendor You Can Trust</span>
              </Link>
            </Button>
          </FadeItem>

          <FadeItem className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500 transition group-hover:bg-amber-500 group-hover:text-white">
              <Store className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display text-xl font-bold text-slate-900">For Vendors</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Sell without any hassle. Get paid on time, and reach buyers who are ready to buy.
            </p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {VENDOR_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <Check className="h-3 w-3" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <Button
              asChild
              size="lg"
              variant="brandSecondary"
              className="mt-7 w-full sm:w-auto sm:self-start px-8 text-base"
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
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
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
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Start in three simple steps</h2>
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

      {/* Popular categories */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-widest text-amber-500">Explore</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Shop by category
            </h2>
            <p className="mt-4 text-slate-600">
              From fashion to phones, find trusted vendors across every category.
            </p>
          </FadeIn>

          <Stagger className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map(({ icon: Icon, name }) => {
              const c = categoryColor(name);
              return (
                <FadeItem key={name}>
                  <Link
                    to="/products"
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-100"
                  >
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-110 ${c.bg} ${c.text}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{name}</span>
                  </Link>
                </FadeItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <FadeIn className="text-center">
            <p className="text-xs font-black uppercase tracking-widest text-amber-500">
              Good to know
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Frequently asked questions
            </h2>
          </FadeIn>

          <Stagger className="mt-12 space-y-4">
            {FAQS.map(({ q, a }) => (
              <FadeItem
                key={q}
                className="rounded-2xl border border-slate-100 bg-white p-6 transition hover:shadow-lg hover:shadow-slate-100"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{q}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{a}</p>
                  </div>
                </div>
              </FadeItem>
            ))}
          </Stagger>

          <FadeIn className="mt-10 text-center">
            <p className="text-sm text-slate-500">
              Still have questions?{' '}
              <Link to="/contact" className="font-bold text-amber-600 hover:underline">
                Contact us
              </Link>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <FadeIn className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-linear-to-r from-amber-500 to-orange-500 px-8 py-14 text-center text-white md:py-20">
          {/* Decorative rings */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border-24 border-white/10" />
            <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          </div>
          <h2 className="relative font-display text-3xl font-bold tracking-tight md:text-4xl">Ready to grow your business?</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/90">
            Join thousands of buyers and sellers already trading securely on URA.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto bg-white px-8 text-base font-bold text-amber-600 hover:bg-white/90">
              <Link to="/auth/register">Get Started Free</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-white/60 bg-transparent px-8 text-base font-bold text-white hover:bg-white/10"
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
