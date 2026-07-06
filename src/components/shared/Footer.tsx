import { Link } from 'react-router-dom';
import { Youtube, Github, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socials = [
    { icon: Youtube, href: 'https://www.youtube.com', label: 'YouTube' },
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Twitter, href: 'https://x.com', label: 'X' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  ];

  const columns = [
    {
      title: 'Company',
      links: [
        { label: 'Home', to: '/' },
        { label: 'About', to: '/about' },
        { label: 'Contact', to: '/contact' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'FAQ', to: '/faq' },
        { label: 'Contact Support', to: '/contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Service', to: '/terms' },
        { label: 'Privacy Policy', to: '/privacy' },
      ],
    },
  ];

  return (
    <footer id="contact" className="mt-24 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 font-black text-white">
                U
              </div>
              <span className="text-xl font-bold text-white">URA</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Discover businesses, buy and sell products, and pay securely with buyer protection.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition hover:bg-amber-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-slate-400 transition hover:text-amber-400">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-sm text-slate-500 md:flex-row">
          <p>&copy; {currentYear} URA. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/terms" className="transition hover:text-amber-400">
              Terms
            </Link>
            <Link to="/privacy" className="transition hover:text-amber-400">
              Privacy
            </Link>
            <Link to="/faq" className="transition hover:text-amber-400">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
