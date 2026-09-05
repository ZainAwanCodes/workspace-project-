import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Sun, Moon, Menu, X } from 'lucide-react';
import { useAppSelector } from '@/lib/redux/hooks';

const NAV_LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'Features', href: '#features' },
  { label: 'Showcase', href: '#showcase' },
  { label: 'Docs', href: '#docs' },
];

interface LandingNavProps {
  dark: boolean;
  onToggleDark: () => void;
}

export default function LandingNav({ dark, onToggleDark }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const activeWorkspaceId = useAppSelector((state) => state.workspaces.activeWorkspaceId);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCTA = () => {
    if (isAuthenticated && activeWorkspaceId) navigate(`/w/${activeWorkspaceId}`);
    else navigate('/login');
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'shadow-sm' : ''
      }`}
      style={
        scrolled
          ? { background: 'var(--surface-overlay)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }
          : { background: 'transparent' }
      }
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group select-none">
            <motion.div
              className="w-8 h-8 rounded-[9px] flex items-center justify-center shadow-md"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 12px var(--accent-glow)' }}
              whileHover={{ scale: 1.1, rotate: -6 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            >
              <Layers className="text-white" size={15} />
            </motion.div>
            <span
              className="font-bold text-[15px] tracking-tight leading-none"
              style={{ fontFamily: "'Plus Jakarta Sans', system-ui", color: 'var(--text-primary)' }}
            >
              Workspace<span style={{ color: 'var(--accent)' }}>.</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                className="relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-150 group"
                style={{ color: 'var(--text-secondary)' }}
                whileHover={{ y: -1 }}
                transition={{ type: 'spring', stiffness: 600, damping: 25 }}
              >
                {link.label}
                <span
                  className="absolute bottom-1.5 left-3.5 right-3.5 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
              </motion.a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Theme toggle */}
            <motion.button
              id="landing-theme-toggle"
              onClick={onToggleDark}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              whileHover={{ scale: 1.08, background: 'var(--surface-raised)' }}
              whileTap={{ scale: 0.92 }}
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                {dark ? (
                  <motion.span
                    key="sun"
                    initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    <Sun size={17} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="moon"
                    initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    <Moon size={17} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {isAuthenticated ? (
              <motion.button
                id="landing-go-to-app"
                onClick={handleCTA}
                className="hidden md:flex items-center gap-1 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                style={{ background: 'var(--accent)', boxShadow: '0 2px 8px var(--accent-glow)' }}
                whileHover={{ scale: 1.03, boxShadow: '0 6px 24px var(--accent-glow)' }}
                whileTap={{ scale: 0.97 }}
              >
                Go to App →
              </motion.button>
            ) : (
              <>
                <motion.button
                  id="landing-signin"
                  onClick={() => navigate('/login')}
                  className="hidden md:flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  whileHover={{ scale: 1.02, background: 'var(--surface-raised)', color: 'var(--text-primary)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign in
                </motion.button>
                <motion.button
                  id="landing-get-started-nav"
                  onClick={() => navigate('/login')}
                  className="hidden md:flex items-center px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors"
                  style={{ background: 'var(--accent)', boxShadow: '0 2px 8px var(--accent-glow)' }}
                  whileHover={{ scale: 1.03, boxShadow: '0 6px 24px var(--accent-glow)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  Get Started
                </motion.button>
              </>
            )}

            {/* Mobile hamburger */}
            <motion.button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setMobileOpen((o) => !o)}
              whileTap={{ scale: 0.92 }}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X size={18} />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu size={18} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden"
            style={{ background: 'var(--surface-overlay)', backdropFilter: 'blur(16px)', borderTop: '1px solid var(--border)' }}
          >
            <div className="px-4 pt-3 pb-5 space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 mt-3 flex flex-col gap-2" style={{ borderTop: '1px solid var(--border)' }}>
                {isAuthenticated ? (
                  <button
                    onClick={() => { handleCTA(); setMobileOpen(false); }}
                    className="w-full py-2.5 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    style={{ background: 'var(--accent)' }}
                  >
                    <span>Go to App</span>
                    <span>→</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { navigate('/login'); setMobileOpen(false); }}
                      className="w-full text-center py-2.5 text-sm font-medium rounded-lg transition-colors"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Sign in
                    </button>
                    <button
                      onClick={() => { navigate('/login'); setMobileOpen(false); }}
                      className="w-full py-2.5 text-white text-sm font-semibold rounded-lg transition-colors"
                      style={{ background: 'var(--accent)' }}
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
