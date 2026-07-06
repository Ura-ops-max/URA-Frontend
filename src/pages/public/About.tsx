import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, ShoppingBag, TrendingUp, ShieldCheck } from 'lucide-react';
import { FadeIn, Stagger, FadeItem } from '@/components/shared/Motion';

const AboutPage = () => {
  return (
    <main className="overflow-hidden bg-white dark:bg-slate-950">
      {/* --- Hero Section --- */}
      <section className="relative pb-16 pt-12 md:pb-24 lg:pt-32">
        <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
          <FadeIn className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-medium tracking-tight">
              More than a <span className="text-amber-500">Marketplace</span>. It's a Community.
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              URA is Nigeria's premier hybrid social-commerce platform. We are bridging the gap
              between social interaction and local commerce, giving every Nigerian business the
              tools to be seen, heard, and patronized.
            </p>
            <div className="mt-8 flex justify-center lg:justify-start gap-4">
              <Button asChild size="lg" variant="brand" className="px-8">
                <Link to="/auth/register">Start Selling</Link>
              </Button>
            </div>
          </FadeIn>
          <div className="flex-1 w-full flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl rotate-3 border-8 border-white dark:border-slate-900">
              <img
                src="/images/hero-image.jpg"
                alt="Nigerian Business Owner"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- Mission & Vision --- */}
      <section className="bg-slate-50 dark:bg-slate-900 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-green-600">Our Mission</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg italic">
                "To empower the 40 million+ MSMEs in Nigeria by providing a digital ecosystem where
                social networking drives economic growth."
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-amber-500">Why URA?</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                In a market as vibrant as Nigeria, commerce is social. We don't just buy; we chat,
                we refer, and we build relationships. URA brings that "market-day" energy online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Core Pillars --- */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">
              Built for the <span className="text-green-600">Naija</span> Way
            </h2>
          </div>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <ShoppingBag className="text-amber-500" />,
                title: 'Social Commerce',
                desc: 'Interact with sellers and buyers in real-time.',
              },
              {
                icon: <Users className="text-green-600" />,
                title: 'Community First',
                desc: 'Build a following for your brand across Nigeria.',
              },
              {
                icon: <ShieldCheck className="text-blue-500" />,
                title: 'Verified Trust',
                desc: 'Safe transactions and verified local business logs.',
              },
              {
                icon: <TrendingUp className="text-purple-500" />,
                title: 'Growth Tools',
                desc: 'Scale from a local street shop to a national brand.',
              },
            ].map((pillar, idx) => (
              <FadeItem
                key={idx}
                className="p-8 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all"
              >
                <div className="mb-4">{pillar.icon}</div>
                <h3 className="font-bold mb-2">{pillar.title}</h3>
                <p className="text-sm text-slate-500">{pillar.desc}</p>
              </FadeItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* --- Call to Action --- */}
      <section className="pb-24 px-6">
        <FadeIn className="max-w-5xl mx-auto bg-green-600 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to join the future of Nigerian Commerce?
            </h2>
            <p className="text-green-50 mb-10 max-w-2xl mx-auto text-lg opacity-90">
              Whether you're an artisan in Kano, a fashionista in Lagos, or a techie in Enugu, URA
              is your home.
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-white text-green-600 hover:bg-amber-50 rounded-full px-12 font-bold"
            >
              <Link to="/auth/register">Create Your Free Account</Link>
            </Button>
          </div>
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500 rounded-full blur-3xl" />
          </div>
        </FadeIn>
      </section>
    </main>
  );
};

export default AboutPage;
