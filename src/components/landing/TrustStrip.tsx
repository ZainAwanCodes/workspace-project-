import React from 'react';
import { motion } from 'motion/react';

const LOGOS = [
  { name: 'Acme Corp', style: 'font-black tracking-tighter' },
  { name: 'Quantum', style: 'font-light tracking-[0.2em] uppercase text-[11px]' },
  { name: 'Stellar', style: 'font-bold italic' },
  { name: 'Nova Labs', style: 'font-semibold tracking-tight' },
  { name: 'Apex Studio', style: 'font-extrabold tracking-[-0.04em]' },
  { name: 'Vertex', style: 'font-medium tracking-[0.1em] uppercase text-[11px]' },
  { name: 'Meridian', style: 'font-bold tracking-tight' },
  { name: 'Crest', style: 'font-black tracking-[-0.02em]' },
];

export default function TrustStrip() {
  const doubled = [...LOGOS, ...LOGOS];

  return (
    <motion.section
      className="py-10 sm:py-12 overflow-hidden"
      style={{ background: 'var(--surface-raised)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="text-center text-xs uppercase tracking-[0.18em] font-semibold mb-6" style={{ color: 'var(--text-muted)' }}>
        Trusted by teams at
      </p>

      <div
        className="relative"
        style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)' }}
      >
        {/* Marquee track */}
        <div className="flex gap-0 animate-marquee hover:[animation-play-state:paused]">
          {doubled.map((logo, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex items-center justify-center w-40 opacity-30 hover:opacity-80 transition-opacity duration-300 cursor-default group"
            >
              <span
                className={`text-base ${logo.style} transition-colors duration-300`}
                style={{ color: 'var(--text-muted)' }}
              >
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
