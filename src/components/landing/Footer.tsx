import React from 'react';
import { motion } from 'motion/react';
import { Briefcase, Github, Twitter, Linkedin } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

const COLUMNS = [
  {
    title: 'Product',
    links: ['Features', 'Changelog', 'Roadmap', 'Status', 'Pricing'],
  },
  {
    title: 'Company',
    links: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'API Reference', 'Community', 'Templates', 'Support'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'],
  },
];

export default function Footer() {
  return (
    <footer style={{ background: 'var(--surface-raised)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand col */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                <Briefcase size={13} className="text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', system-ui", color: 'var(--text-primary)' }}>
                Workspace<span style={{ color: 'var(--accent)' }}>.</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed mb-5 max-w-[180px]" style={{ color: 'var(--text-muted)' }}>
              The workspace for teams who care about how they work.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-2">
              {[
                { Icon: Github, href: '#', label: 'GitHub' },
                { Icon: Twitter, href: '#', label: 'Twitter' },
                { Icon: Linkedin, href: '#', label: 'LinkedIn' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] mb-4" style={{ color: 'var(--text-primary)' }}>
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs font-medium transition-colors hover:text-[var(--text-primary)]" style={{ color: 'var(--text-muted)' }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Workspace Manager. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Built with</span>
            <span className="text-xs text-rose-500 mx-0.5">♥</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>using React + TypeScript + Tailwind</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
