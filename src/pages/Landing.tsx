import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { toggleTheme } from '@/lib/redux/slices/uiSlice';
import LandingNav from '@/components/landing/LandingNav';
import Hero from '@/components/landing/Hero';
import TrustStrip from '@/components/landing/TrustStrip';
import ProblemReframe from '@/components/landing/ProblemReframe';
import CapabilityShowcase from '@/components/landing/CapabilityShowcase';
import BentoGrid from '@/components/landing/BentoGrid';
import SignatureFeature from '@/components/landing/SignatureFeature';
import TrustSignals from '@/components/landing/TrustSignals';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

export default function Landing() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const activeWorkspaceId = useAppSelector((state) => state.workspaces.activeWorkspaceId);

  // Single source of truth: Redux theme (synced to localStorage by AppLayout effect on navigation)
  const theme = useAppSelector((state) => state.ui.theme);
  const dark = theme === 'dark';

  // Keep DOM in sync while on the landing page (AppLayout isn't mounted here)
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('wm-theme', theme);
  }, [dark, theme]);

  const handleGetStarted = () => {
    if (isAuthenticated && activeWorkspaceId) {
      navigate(`/w/${activeWorkspaceId}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div
      className="relative overflow-x-hidden"
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <noscript>
        <style>{`.animate-marquee, .animate-float-a, .animate-float-b, .animate-float-c, .animate-glow-drift { animation: none !important; }`}</style>
      </noscript>

      <LandingNav dark={dark} onToggleDark={() => dispatch(toggleTheme())} />

      <main>
        <Hero onGetStarted={handleGetStarted} />
        <TrustStrip />
        <ProblemReframe />
        <CapabilityShowcase />
        <BentoGrid />
        <SignatureFeature />
        <TrustSignals />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
