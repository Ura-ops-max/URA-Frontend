import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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

const FAQItem = ({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) => (
  <div className="border-b border-slate-100">
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 py-5 text-left"
    >
      <span className="text-base font-semibold text-slate-900">{q}</span>
      <ChevronDown
        className={`h-5 w-5 flex-shrink-0 text-amber-500 transition-transform ${open ? 'rotate-180' : ''}`}
      />
    </button>
    <div className={`overflow-hidden transition-all ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}>
      <p className="leading-relaxed text-slate-600">{a}</p>
    </div>
  </div>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p className="text-xs font-black uppercase tracking-widest text-amber-500">Help Center</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-slate-600">
          Everything you need to know about buying, selling, and paying on URA.
        </p>

        <div className="mt-10">
          {FAQS.map((item, i) => (
            <FAQItem
              key={i}
              q={item.q}
              a={item.a}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

        <p className="mt-12 rounded-2xl bg-amber-50 p-6 text-sm text-slate-600">
          Still have questions?{' '}
          <a href="/contact" className="font-semibold text-amber-600 hover:underline">
            Contact our team
          </a>{' '}
          and we&apos;ll be happy to help.
        </p>
      </section>
    </main>
  );
};

export default FAQ;
