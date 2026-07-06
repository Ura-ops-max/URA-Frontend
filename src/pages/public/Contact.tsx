import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/shared/Motion';

const SUPPORT_EMAIL = 'info@ura.com.ng';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }
    const subject = form.subject.trim() || `New enquiry from ${form.name}`;
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    toast.success('Opening your email app to send the message…');
  };

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-slate-50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.12),transparent_55%)]" />
        <FadeIn className="relative mx-auto max-w-3xl px-6 py-16 text-center md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-500 shadow-sm ring-1 ring-slate-100">
            <MessageSquare className="h-3.5 w-3.5" /> Contact
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Get in <span className="text-amber-500">Touch</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
            Have a question, partnership idea, or need a hand? We&apos;d love to hear from you, our team
            usually replies within a few hours.
          </p>
        </FadeIn>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Info panel */}
          <FadeIn className="lg:col-span-2">
            <div className="flex h-full flex-col justify-between rounded-3xl bg-slate-900 p-8 text-white">
              <div>
                <h2 className="text-2xl font-bold">Contact information</h2>
                <p className="mt-2 text-sm text-slate-300">Reach us through any of these channels.</p>

                <div className="mt-8 space-y-6">
                  <InfoRow icon={<Mail className="h-5 w-5" />} label="Email" value={SUPPORT_EMAIL} href={`mailto:${SUPPORT_EMAIL}`} />
                  <InfoRow icon={<Phone className="h-5 w-5" />} label="Phone" value="+234 815 234 5755" href="tel:+2348152345755" />
                  <InfoRow icon={<MapPin className="h-5 w-5" />} label="Office" value="Abuja, Nigeria" />
                  <InfoRow icon={<Clock className="h-5 w-5" />} label="Hours" value="Mon – Sat, 9am – 6pm" />
                </div>
              </div>

              <div className="mt-10 rounded-2xl bg-white/5 p-4 text-sm text-slate-300 ring-1 ring-white/10">
                Prefer live chat? Use the chat bubble on our homepage and we&apos;ll jump right in.
              </div>
            </div>
          </FadeIn>

          {/* Form */}
          <FadeIn className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Name" name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
                <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
              </div>
              <Field label="Subject" name="subject" value={form.subject} onChange={handleChange} placeholder="What's this about?" />
              <div className="space-y-1.5">
                <label htmlFor="message" className="text-sm font-medium text-slate-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Tell us how we can help…"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/20"
                />
              </div>
              <Button type="submit" size="lg" variant="brand" className="w-full gap-2">
                <Send className="h-4 w-4" /> Send message
              </Button>
            </form>
          </FadeIn>
        </div>
      </section>
    </main>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) => {
  const content = (
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block transition hover:opacity-80">
      {content}
    </a>
  ) : (
    content
  );
};

const Field = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) => (
  <div className="space-y-1.5">
    <label htmlFor={name} className="text-sm font-medium text-slate-700">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/20"
    />
  </div>
);

export default ContactPage;
