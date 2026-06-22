import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const SUPPORT_EMAIL = 'support@ura.com.ng';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }

    // Compose the message into the user's email client addressed to support.
    const subject = form.subject.trim() || `New enquiry from ${form.name}`;
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    toast.success('Opening your email app to send the message…');
  };

  return (
    <main className="overflow-hidden bg-white dark:bg-slate-950">
      {/* --- Hero --- */}
      <section className="pb-10 pt-12 md:pt-28 text-center px-6">
        <h1 className="text-4xl md:text-6xl font-medium tracking-tight">
          Get in <span className="text-amber-500">Touch</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Have a question, partnership idea, or need a hand? We'd love to hear from you. Reach out
          and our team will get back to you shortly.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* --- Contact info --- */}
          <div className="lg:col-span-2 space-y-6">
            <ContactCard
              icon={<Mail className="h-5 w-5" />}
              title="Email us"
              lines={[SUPPORT_EMAIL]}
              href={`mailto:${SUPPORT_EMAIL}`}
            />
            <ContactCard
              icon={<Phone className="h-5 w-5" />}
              title="Call us"
              lines={['+234 800 000 0000']}
              href="tel:+2348000000000"
            />
            <ContactCard
              icon={<MapPin className="h-5 w-5" />}
              title="Visit us"
              lines={['Lagos, Nigeria']}
            />
          </div>

          {/* --- Contact form --- */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-6 sm:p-8 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>
              <Field
                label="Subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="What's this about?"
              />
              <div className="space-y-1.5">
                <label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell us how we can help…"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
                />
              </div>
              <Button type="submit" size="lg" variant="brand" className="w-full gap-2">
                <Send className="h-4 w-4" /> Send message
              </Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

const ContactCard = ({
  icon,
  title,
  lines,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
  href?: string;
}) => {
  const content = (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition hover:shadow-md">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
        {lines.map((line) => (
          <p key={line} className="text-sm text-slate-500 dark:text-slate-400">
            {line}
          </p>
        ))}
      </div>
    </div>
  );

  return href ? <a href={href}>{content}</a> : content;
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
    <label htmlFor={name} className="text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
    />
  </div>
);

export default ContactPage;
