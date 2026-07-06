import type { ReactNode } from 'react';

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

/** Shared layout for Terms & Privacy content pages. */
const LegalPage = ({ title, updated, intro, sections }: LegalPageProps) => {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p className="text-xs font-black uppercase tracking-widest text-amber-500">Legal</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-slate-400">Last updated: {updated}</p>
        <p className="mt-6 text-lg leading-relaxed text-slate-600">{intro}</p>

        <div className="mt-12 space-y-10">
          {sections.map((s, i) => (
            <div key={i}>
              <h2 className="text-xl font-bold text-slate-900">
                {i + 1}. {s.heading}
              </h2>
              <div className="mt-3 space-y-3 leading-relaxed text-slate-600">{s.body}</div>
            </div>
          ))}
        </div>

        <p className="mt-14 rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
          Questions about this document? Reach us any time at{' '}
          <a href="mailto:info@ura.com.ng" className="font-semibold text-amber-600 hover:underline">
            info@ura.com.ng
          </a>
          .
        </p>
      </section>
    </main>
  );
};

export default LegalPage;
