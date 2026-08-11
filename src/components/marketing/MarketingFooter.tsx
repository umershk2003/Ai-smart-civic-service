import React from 'react';
import { Building2, Twitter, Linkedin, Github, Mail } from 'lucide-react';

const LINK_GROUPS = [
  {
    title: 'Product',
    links: ['Features', 'Integrations', 'Changelog', 'Roadmap'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Blog', 'Press kit', 'Contact'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'API reference', 'Security', 'Status', 'Community'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'SLA Terms', 'Data Processing'],
  },
];

export const MarketingFooter: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2">
            <a href="#top" className="flex items-center gap-2.5" aria-label="AI Smart Civic Services home">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm shadow-primary-600/30">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-[15px] font-bold tracking-tight text-white">
                AI Smart <span className="text-primary-400">Civic</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              The AI-powered civic operations platform connecting citizens, municipal teams, and
              intelligent technology.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[
                { icon: Twitter, label: 'AI Smart Civic on Twitter' },
                { icon: Linkedin, label: 'AI Smart Civic on LinkedIn' },
                { icon: Github, label: 'AI Smart Civic on GitHub' },
                { icon: Mail, label: 'Email AI Smart Civic' },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#top"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-white"
                >
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {LINK_GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#top"
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {year} AI Smart Civic. All municipal data encrypted & logged.
          </p>
          <p className="text-xs text-slate-500">
            Built for citizens, teams, and the communities they serve.
          </p>
        </div>
      </div>
    </footer>
  );
};
