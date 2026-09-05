import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden landing-grain" style={{ background: 'var(--bg)' }}>
      {/* Ambient glow — echoes the hero */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-3xl animate-glow-drift" style={{ background: 'var(--accent-glow-soft)' }} />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[300px] rounded-full blur-3xl animate-glow-drift" style={{ background: 'rgba(157,80,255,0.04)', animationDelay: '3.5s', animationDirection: 'reverse' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.75, ease: EASE }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-6 shadow-sm" style={{ borderColor: 'var(--accent-muted-fg)', background: 'var(--accent-muted)', color: 'var(--accent-muted-fg)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
            Free to start · No credit card
          </div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.02] tracking-[-0.04em] mb-5" style={{ fontFamily: "'Plus Jakarta Sans', system-ui", color: 'var(--text-primary)' }}>
            Your workspace{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, var(--accent) 0%, #9D50FF 100%)' }}>
              awaits.
            </span>
          </h2>

          {/* Subhead */}
          <p className="text-base sm:text-lg font-medium mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Join thousands of teams who replaced scattered tools with a single, beautiful workspace.
          </p>

          {/* CTA button */}
          <motion.button
            id="final-cta-button"
            onClick={() => navigate('/login')}
            className="group inline-flex items-center gap-2.5 px-8 py-4 text-white font-bold text-base rounded-2xl shadow-xl transition-all"
            style={{ background: 'var(--accent)', boxShadow: '0 8px 32px var(--accent-glow)' }}
            whileHover={{ scale: 1.04, boxShadow: '0 16px 48px var(--accent-glow)' }}
            whileTap={{ scale: 0.97 }}
          >
            Get Started for Free
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Fine print */}
          <p className="mt-4 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            No setup required · Instant access · Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
