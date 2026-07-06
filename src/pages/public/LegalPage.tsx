import { type ReactNode, useEffect, useState } from 'react';
import { ArrowUp, Mail, ShieldCheck } from 'lucide-react';

interface Section {
  heading: string;
  body: ReactNode;
}

interface LegalPageProps {
  title: string;
  updated: string;
  intro: string;
  sections: Section[];
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Shared, modern layout for Terms & Privacy content pages. */
const LegalPage = ({ title, updated, intro, sections }: LegalPageProps) => {
  const [active, setActive] = useState<string>('');
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );
    sections.forEach((s) => {
      const el = document.getElementById(slug(s.heading));
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-slate-50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_55%)]" />
        <div className="relative mx-auto max-w-5xl px-6 py-16 md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-500 shadow-sm ring-1 ring-slate-100">
            <ShieldCheck className="h-3.5 w-3.5" /> Legal
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">{intro}</p>
          <p className="mt-6 text-sm text-slate-400">Last updated: {updated}</p>
        </div>
      </section>

      {/* Body + sticky TOC */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-14">
          {/* TOC */}
          <aside className="mb-10 hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">On this page</p>
              <nav className="mt-4 space-y-1 border-l border-slate-100">
                {sections.map((s) => {
                  const id = slug(s.heading);
                  const isActive = active === id;
                  return (
                    <a
                      key={id}
                      href={`#${id}`}
                      className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm transition ${
                        isActive
                          ? 'border-amber-500 font-semibold text-amber-600'
                          : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                      }`}
                    >
                      {s.heading}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="space-y-12">
            {sections.map((s, i) => (
              <div key={i} id={slug(s.heading)} className="scroll-mt-28">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-sm font-black text-amber-500">
                    {i + 1}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">{s.heading}</h2>
                </div>
                <div className="mt-3 space-y-3 pl-11 leading-relaxed text-slate-600">{s.body}</div>
              </div>
            ))}

            <div className="mt-14 flex flex-col items-start gap-4 rounded-2xl bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white">
                  <Mail className="h-5 w-5" />
                </div>
                <p className="text-sm text-slate-600">Questions about this document?</p>
              </div>
              <a
                href="mailto:info@ura.com.ng"
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Contact us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Back to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg transition hover:bg-amber-600"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </main>
  );
};

export default LegalPage;
