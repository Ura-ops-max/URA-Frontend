import { Link } from 'react-router-dom';
import { Youtube, Github, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="bg-orange-500 mt-24 p-8 md:p-24 flex flex-col md:flex-row justify-between items-center gap-8 text-black font-semibold text-lg"
    >
      <p>&copy; {currentYear} Ura. All rights reserved.</p>

      <div className="flex gap-6">
        <Link
          to="https://www.youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-orange-200 transition-colors"
        >
          <Youtube />
        </Link>

        <Link
          to="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-orange-200 transition-colors"
        >
          <Github />
        </Link>

        <Link
          to="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-orange-200 transition-colors"
        >
          <Twitter />
        </Link>

        <Link
          to="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-orange-200 transition-colors"
        >
          <Instagram />
        </Link>

        <Link
          to="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-orange-200 transition-colors"
        >
          <Facebook />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
