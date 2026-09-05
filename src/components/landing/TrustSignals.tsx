import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Keyboard, Moon, Sun, WifiOff, Zap, Smartphone } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

const SIGNALS = [
  {
    id: 'keyboard',
    Icon: Keyboard,
    title: 'Keyboard-first',
    stat: '⌘K',
    desc: 'Every action, accessible by keyboard. Launch the command palette from anywhere.',
    accent: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    demo: 'keyboard',
  },
  {
    id: 'darkmode',
    Icon: Moon,
    title: 'Dark mode',
    stat: 'System-aware',
    desc: 'Adapts to your OS preference automatically. Designed pixel-by-pixel, not inverted.',
    accent: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    demo: 'darkmode',
  },
  {
    id: 'offline',
    Icon: WifiOff,
    title: 'Works offline',
    stat: 'Always available',
    desc: 'Full read access and queued writes when your connection drops. No disruptions.',
    accent: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-950/20',
    demo: 'offline',
  },
  {
    id: 'fast',
    Icon: Zap,
    title: 'Fast by default',
    stat: '<50ms',
    desc: 'Optimistic updates mean the UI responds before the server does. It just feels instant.',
    accent: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    demo: 'fast',
  },
  {
    id: 'responsive',
    Icon: Smartphone,
    title: 'Fully responsive',
    stat: 'Any device',
    desc: 'Designed mobile-first. The full workspace experience, from pocket to ultrawide.',
    accent: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    demo: 'responsive',
  },
];

function KeyboardDemo() {
  const [active, setActive] = useState(false);
  return (
    <button
      className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      onClick={() => { setActive(true); setTimeout(() => setActive(false), 1200); }}
    >
      {active ? (
        <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-blue-600 dark:text-blue-400">Command palette open ✓</motion.span>
      ) : (
        <>
          <kbd className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-1.5 py-0.5 font-mono text-[10px]">⌘</kbd>
          <kbd className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-1.5 py-0.5 font-mono text-[10px]">K</kbd>
          <span>— Try it</span>
        </>
      )}
    </button>
  );
}

function DarkModeDemo() {
  const [preview, setPreview] = useState(false);
  return (
    <motion.div
      className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer"
      onHoverStart={() => setPreview(true)}
      onHoverEnd={() => setPreview(false)}
      onClick={() => setPreview((p) => !p)}
      animate={{ backgroundColor: preview ? '#111827' : '#f9fafb' }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: preview ? '#1f2937' : '#ffffff' }}>
        {preview ? <Moon size={11} className="text-violet-400" /> : <Sun size={11} className="text-amber-500" />}
        <span className="text-[10px] font-semibold" style={{ color: preview ? '#a78bfa' : '#6b7280' }}>
          {preview ? 'Dark mode' : 'Light mode'} · hover to switch
        </span>
      </div>
      <div className="px-3 py-2.5 flex flex-col gap-1.5">
        <div className="h-2 w-24 rounded-full" style={{ backgroundColor: preview ? '#374151' : '#e5e7eb' }} />
        <div className="h-1.5 w-16 rounded-full" style={{ backgroundColor: preview ? '#374151' : '#e5e7eb' }} />
        <div className="h-1.5 w-20 rounded-full" style={{ backgroundColor: preview ? '#374151' : '#e5e7eb' }} />
      </div>
    </motion.div>
  );
}

function OfflineDemo() {
  const [connected, setConnected] = useState(true);
  return (
    <button
      className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-700 transition-all cursor-pointer"
      onClick={() => { setConnected((c) => !c); }}
    >
      <div className={`w-2 h-2 rounded-full transition-colors ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
      <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">
        {connected ? 'Online · click to simulate offline' : 'Offline mode · data cached'}
      </span>
      <WifiOff size={12} className={`ml-auto transition-colors ${connected ? 'text-gray-300 dark:text-gray-700' : 'text-sky-500'}`} />
    </button>
  );
}

function FastDemo() {
  const [firing, setFiring] = useState(false);
  return (
    <button
      className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-xl text-xs font-semibold text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-950/40 transition-colors"
      onClick={() => { setFiring(true); setTimeout(() => setFiring(false), 600); }}
    >
      {firing ? (
        <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-emerald-600 dark:text-emerald-400">Saved in 31ms ✓</motion.span>
      ) : (
        <><Zap size={12} className="fill-yellow-500 text-yellow-500" /> Click to simulate save</>
      )}
    </button>
  );
}

function ResponsiveDemo() {
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop');
  return (
    <div className="mt-3 flex gap-2">
      {(['desktop', 'mobile'] as const).map((v) => (
        <button
          key={v}
          onClick={() => setView(v)}
          className={`flex-1 py-2 rounded-xl text-[11px] font-semibold transition-all ${view === v ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          {v === 'desktop' ? '🖥 Desktop' : '📱 Mobile'}
        </button>
      ))}
    </div>
  );
}

const DEMOS: Record<string, React.FC> = {
  keyboard: KeyboardDemo,
  darkmode: DarkModeDemo,
  offline: OfflineDemo,
  fast: FastDemo,
  responsive: ResponsiveDemo,
};

export default function TrustSignals() {
  return (
    <section className="py-16 sm:py-24" style={{ background: 'var(--surface-raised)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: EASE }}
        >
          <p className="text-xs uppercase tracking-[0.18em] font-semibold mb-3" style={{ color: 'var(--accent)' }}>Craft & Quality</p>
          <h2 className="text-4xl sm:text-5xl font-black leading-[1.06] tracking-[-0.03em]" style={{ fontFamily: "'Plus Jakarta Sans', system-ui", color: 'var(--text-primary)' }}>
            Details that matter.
          </h2>
        </motion.div>

        {/* Signal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {SIGNALS.map((signal, i) => {
            const Demo = DEMOS[signal.demo];
            return (
              <motion.div
                key={signal.id}
                className="rounded-2xl border p-5 flex flex-col"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }}
                whileHover={{ y: -2 }}
              >
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${signal.bg} mb-3`}>
                  <signal.Icon size={15} className={signal.accent} />
                </div>
                <p className="text-xl font-black tracking-tight mb-0.5" style={{ color: 'var(--text-primary)' }}>{signal.stat}</p>
                <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>{signal.title}</h3>
                <p className="text-xs leading-relaxed flex-1" style={{ color: 'var(--text-secondary)' }}>{signal.desc}</p>
                <Demo />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
