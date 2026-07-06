import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, HelpCircle, MessageCircle, Search } from 'lucide-react';

const FAQS = [
  {
    q: 'What is URA?',
    a: 'URA is a marketplace where you can discover businesses, buy and sell products, and pay securely — with buyer protection through escrow.',
  },
  {
    q: 'How do I create an account?',
    a: 'Click "Get Started", fill in your details, and verify your email. You can start browsing right away and set up a payment profile when you\'re ready to buy or sell.',
  },
  {
    q: 'How does payment work?',
    a: 'Payments are processed securely through our partner Payluk. You can pay instantly, or use Escrow so your funds are only released to the seller once your order is confirmed.',
  },
  {
    q: 'What is escrow and why should I use it?',
    a: 'Escrow holds your payment safely until you confirm you\'ve received your order as described. It protects both buyers and sellers from fraud.',
  },
  {
    q: 'How do I become a seller?',
    a: 'Go to Settings and choose "Convert to Business". You can then list products and receive payments directly to your wallet.',
  },
  {
    q: 'How do I fund my wallet?',
    a: 'Open your Wallet and click "Fund Wallet". A one-time virtual bank account is generated for you — transfer any amount and your balance updates once the transfer is confirmed.',
  },
  {
    q: 'Is my personal information safe?',
    a: 'Yes. We use encryption and never sell your data. See our Privacy Policy for full details on how we handle your information.',
  },
  {
    q: 'How do I contact support?',
    a: 'You can reach our team any time via the Contact page or by emailing info@ura.com.ng.',
  },
];

const FAQItem = ({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) => (
  <div
    className={`rounded-2xl border transition-all ${
      open ? 'border-amber-200 bg-amber-50/40 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'
    }`}
  >
    <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 p-5 text-left">
      <span className="text-base font-semibold text-slate-900">{q}</span>
      <span
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition ${
          open ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
        }`}
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </span>
    </button>
    <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
      <div className="overflow-hidden">
        <p className="px-5 pb-5 leading-relaxed text-slate-600">{a}</p>
      </div>
    </div>
  </div>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [query, setQuery] = useState('');

  const filtered = FAQS.filter(
    (f) => f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-slate-50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.12),transparent_55%)]" />
        <div className="relative mx-auto max-w-3xl px-6 py-16 text-center md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-500 shadow-sm ring-1 ring-slate-100">
            <HelpCircle className="h-3.5 w-3.5" /> Help Center
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            How can we help?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
            Everything you need to know about buying, selling, and paying on URA.
          </p>

          {/* Search */}
          <div className="relative mx-auto mt-8 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions…"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
        </div>
      </section>

      {/* List */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((item) => {
              const realIndex = FAQS.indexOf(item);
              return (
                <FAQItem
                  key={item.q}
                  q={item.q}
                  a={item.a}
                  open={openIndex === realIndex}
                  onToggle={() => setOpenIndex(openIndex === realIndex ? null : realIndex)}
                />
              );
            })}
          </div>
        ) : (
          <p className="py-10 text-center text-slate-400">No questions match “{query}”.</p>
        )}

        {/* CTA */}
        <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl bg-slate-900 p-8 text-center text-white sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold">Still have questions?</p>
              <p className="text-sm text-slate-300">Our team is here to help you out.</p>
            </div>
          </div>
          <Link
            to="/contact"
            className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-amber-600"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </main>
  );
};

export default FAQ;
