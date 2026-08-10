import React, { useEffect, useState } from 'react';
import { Building2, Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface MarketingNavbarProps {
  onSignIn: () => void;
}

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#testimonials', label: 'Customers' },
  { href: '#faq', label: 'FAQ' },
];

export const MarketingNavbar: React.FC<MarketingNavbarProps> = ({ onSignIn }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        'sticky top-0 z-40 border-b transition-all duration-300',
        scrolled
          ? 'border-slate-200 bg-white/85 backdrop-blur-lg shadow-card'
          : 'border-transparent bg-white/60 backdrop-blur-md',
      ].join(' ')}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        {/* Brand */}
        <a href="#top" className="flex items-center gap-2.5" aria-label="AI Smart Civic Services home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm shadow-primary-600/30">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-[15px] font-bold tracking-tight text-slate-900">
            AI Smart <span className="text-primary-600">Civic</span>
          </span>
        </a>

        {/* Desktop links (xl+ — below that they live in the mobile menu) */}
        <ul className="hidden items-center gap-1 xl:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop actions (kept visible from lg up; at lg–xl they fit once the links are in the menu) */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <Button variant="ghost" size="sm" onClick={onSignIn}>
            Sign in
          </Button>
          <Button size="sm" rightIcon={<ArrowRight className="h-4 w-4" />} onClick={onSignIn}>
            Get started
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 xl:hidden cursor-pointer"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="border-t border-slate-200 bg-white px-4 pb-6 pt-3 xl:hidden">
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Button variant="outline" onClick={() => { setMenuOpen(false); onSignIn(); }}>
              Sign in
            </Button>
            <Button rightIcon={<ArrowRight className="h-4 w-4" />} onClick={() => { setMenuOpen(false); onSignIn(); }}>
              Get started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
