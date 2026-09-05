import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

// ── Mock kanban data ──────────────────────────────────────────────────
const COLUMNS = [
  {
    id: 'todo',
    label: 'To Do',
    color: 'bg-gray-400',
    tasks: [
      { id: 't1', title: 'Define MVP scope', tag: 'Strategy', tagColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300', priority: 'high', initials: 'AA', avatarBg: '#6D5EF5', due: 'Sep 12' },
      { id: 't2', title: 'API integration spec', tag: 'Engineering', tagColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', priority: 'med', initials: 'BB', avatarBg: '#FF7A59', due: 'Sep 18' },
    ],
  },
  {
    id: 'inprogress',
    label: 'In Progress',
    color: 'bg-[var(--accent)]',
    tasks: [
      { id: 't3', title: 'Design system tokens', tag: 'Design', tagColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300', priority: 'high', initials: 'CC', avatarBg: '#9D50FF', due: 'Sep 9' },
      { id: 't4', title: 'Performance audit', tag: 'Engineering', tagColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', priority: 'med', initials: 'DV', avatarBg: '#10B981', due: 'Sep 14' },
    ],
  },
  {
    id: 'done',
    label: 'Done',
    color: 'bg-emerald-500',
    tasks: [
      { id: 't5', title: 'User research interviews', tag: 'Research', tagColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', priority: 'high', initials: 'AA', avatarBg: '#6D5EF5', due: 'Sep 1' },
      { id: 't6', title: 'Brand identity guidelines', tag: 'Design', tagColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300', priority: 'low', initials: 'BB', avatarBg: '#FF7A59', due: 'Sep 3' },
    ],
  },
];

const PRIORITY_ICONS = {
  high: <AlertCircle size={10} className="text-rose-500" />,
  med: <Clock size={10} className="text-amber-500" />,
  low: <Circle size={10} className="text-gray-400" />,
};

function MiniTaskCard({
  task,
  floatClass,
  dimmed = false,
}: {
  task: (typeof COLUMNS)[0]['tasks'][0];
  floatClass: string;
  dimmed?: boolean;
}) {
  return (
    <motion.div
      className={`relative rounded-xl border p-3 shadow-sm hover:shadow-md transition-shadow cursor-default select-none ${floatClass} ${dimmed ? 'opacity-40' : ''}`}
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      whileHover={dimmed ? {} : { y: -2, boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)' }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium ${task.tagColor}`}>
          {task.tag}
        </span>
        <span className="flex items-center gap-1">{PRIORITY_ICONS[task.priority as keyof typeof PRIORITY_ICONS]}</span>
      </div>
      <p className="text-xs font-semibold leading-tight mb-2.5" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
      <div className="flex items-center justify-between">
        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: task.avatarBg }}>
          <span className="text-white font-bold" style={{ fontSize: 7 }}>{task.initials}</span>
        </div>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{task.due}</span>
      </div>
    </motion.div>
  );
}

function HeroVisual() {
  return (
    <div className="relative w-full max-w-[580px] aspect-[4/3] select-none pointer-events-none">
      {/* Ambient glow blobs */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl animate-glow-drift" style={{ background: 'var(--accent-glow)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-3xl animate-glow-drift" style={{ background: 'rgba(157, 80, 255, 0.12)', animationDelay: '3s', animationDirection: 'reverse' }} />
      </div>

      {/* App window chrome */}
      <div
        className="relative h-full rounded-2xl border shadow-2xl overflow-hidden"
        style={{ background: 'var(--surface-raised)', borderColor: 'var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.18)' }}
      >
        {/* Window titlebar */}
        <div className="flex items-center gap-1.5 px-3 py-2.5 border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <div className="flex-1 mx-3">
            <div className="rounded-md h-4 flex items-center px-2" style={{ background: 'var(--surface-raised)' }}>
              <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>workspace.app/stellar-launch</span>
            </div>
          </div>
        </div>

        {/* Sidebar strip */}
        <div className="absolute left-0 top-9 bottom-0 w-8 border-r flex flex-col items-center pt-3 gap-3" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-[4px]`} style={{ background: i === 0 ? 'var(--accent)' : 'var(--border)' }} />
          ))}
        </div>

        {/* Kanban board */}
        <div className="absolute left-8 top-9 right-0 bottom-0 p-3 overflow-hidden">
          {/* Project header */}
          <div className="flex items-center gap-2 mb-3 pl-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--accent)' }} />
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-primary)' }}>Stellar Product Launch</span>
            <div className="ml-auto flex items-center gap-1">
              {['#6D5EF5', '#FF7A59', '#9D50FF'].map((c, i) => (
                <div key={i} className="w-4 h-4 rounded-full border-2" style={{ background: c, borderColor: 'var(--surface)', marginLeft: i > 0 ? -6 : 0 }} />
              ))}
            </div>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-3 gap-2.5 h-full pb-4">
            {COLUMNS.map((col, ci) => (
              <div key={col.id} className="flex flex-col gap-2">
                {/* Column header */}
                <div className="flex items-center gap-1.5 px-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${col.color}`} />
                  <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{col.label}</span>
                  <span className="ml-auto text-[9px] font-medium rounded-full px-1.5" style={{ color: 'var(--text-muted)', background: 'var(--surface-raised)' }}>{col.tasks.length}</span>
                </div>
                {/* Cards */}
                <div className="flex flex-col gap-2">
                  {col.tasks.map((task, ti) => {
                    const floats = ['animate-float-a', 'animate-float-b', 'animate-float-c'];
                    return (
                      <MiniTaskCard
                        key={task.id}
                        task={task}
                        floatClass={floats[(ci * 2 + ti) % 3]}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating "dragging" card overlay */}
        <motion.div
          className="absolute z-10 w-[30%]"
          style={{ top: '42%', left: '30%' }}
          animate={{ x: [0, 32, 32], y: [0, -12, -12], rotate: [0, 2, 2], scale: [1, 1.04, 1.04] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut', times: [0, 0.3, 1] }}
        >
          <div className="rounded-xl border-2 shadow-xl p-2.5 cursor-grabbing" style={{ background: 'var(--surface)', borderColor: 'var(--accent)', boxShadow: '0 12px 32px var(--accent-glow)' }}>
            <div className="flex items-start justify-between mb-1.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">Design</span>
              <AlertCircle size={10} className="text-rose-500 mt-0.5" />
            </div>
            <p className="text-[10px] font-semibold leading-tight mb-2" style={{ color: 'var(--text-primary)' }}>Design system tokens</p>
            <div className="flex items-center justify-between">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#9D50FF' }}>
                <span className="text-white font-bold" style={{ fontSize: 7 }}>CC</span>
              </div>
              <CheckCircle2 size={11} className="text-emerald-500" />
            </div>
          </div>
        </motion.div>

        {/* Grain overlay */}
        <div className="absolute inset-0 landing-grain pointer-events-none rounded-2xl" />
      </div>
    </div>
  );
}

// ── Hero section ─────────────────────────────────────────────────────
export default function Hero({ onGetStarted }: { onGetStarted: () => void }) {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
  };
  const item = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
  };

  return (
    <section
      ref={containerRef}
      id="product"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24 landing-grain"
      style={{ background: 'var(--bg)' }}
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-3xl animate-glow-drift"
          style={{ background: 'var(--accent-glow-soft)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[400px] rounded-full blur-3xl animate-glow-drift"
          style={{ background: 'rgba(157, 80, 255, 0.05)', animationDelay: '4s', animationDirection: 'reverse' }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text side */}
          <motion.div
            className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0"
            variants={stagger}
            initial="hidden"
            animate="show"
            style={{ y, opacity }}
          >
            {/* Badge */}
            <motion.div variants={item} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-6 shadow-sm" style={{ borderColor: 'var(--accent-muted-fg)', background: 'var(--accent-muted)', color: 'var(--accent-muted-fg)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
              Now in public beta · Free to start
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={item}
              className="text-[2.75rem] sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-black leading-[1.04] tracking-[-0.03em] mb-5"
              style={{ fontFamily: "'Plus Jakarta Sans', system-ui", color: 'var(--text-primary)' }}
            >
              Your team's work,{' '}
              <span className="relative inline-block">
                <span
                  className="relative z-10 text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, var(--accent) 0%, #9D50FF 100%)' }}
                >
                  beautifully
                </span>
                <span
                  className="absolute inset-x-0 bottom-1 h-3 rounded-sm -z-[1]"
                  style={{ background: 'var(--accent-muted)' }}
                  aria-hidden
                />
              </span>{' '}
              organized.
            </motion.h1>

            {/* Subhead */}
            <motion.p
              variants={item}
              className="text-lg leading-relaxed mb-8 max-w-md mx-auto lg:mx-0 font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Kanban boards, lists, calendars, and team collaboration — one workspace that moves as fast as your ideas.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <motion.button
                id="hero-get-started"
                onClick={onGetStarted}
                className="group flex items-center gap-2 px-6 py-3.5 text-white font-semibold rounded-xl transition-colors text-sm"
                style={{ background: 'var(--accent)', boxShadow: '0 4px 16px var(--accent-glow)' }}
                whileHover={{ scale: 1.03, boxShadow: '0 8px 32px var(--accent-glow)' }}
                whileTap={{ scale: 0.97 }}
              >
                Get Started — it's free
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
              <motion.button
                id="hero-see-demo"
                className="group flex items-center gap-2 px-5 py-3.5 font-semibold text-sm rounded-xl transition-all"
                style={{ color: 'var(--text-secondary)', border: '1.5px solid var(--border)' }}
                whileHover={{ scale: 1.02, background: 'var(--surface-raised)', color: 'var(--text-primary)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play size={14} style={{ color: 'var(--accent)', fill: 'var(--accent)' }} />
                See it in action
              </motion.button>
            </motion.div>

            {/* Social proof micro-line */}
            <motion.div variants={item} className="mt-6 flex items-center justify-center lg:justify-start gap-3">
              <div className="flex -space-x-2">
                {['#6D5EF5', '#FF7A59', '#9D50FF', '#10B981'].map((c, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2" style={{ background: c, borderColor: 'var(--bg)' }} />
                ))}
              </div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Loved by <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>2,400+</span> teams worldwide
              </p>
            </motion.div>
          </motion.div>

          {/* Visual side */}
          <motion.div
            className="flex-1 flex justify-center lg:justify-end w-full max-w-[580px] mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.3, ease: EASE }}
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        style={{ color: 'var(--text-muted)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
      >
        <span className="text-[10px] uppercase tracking-widest font-semibold">Scroll</span>
        <motion.div
          className="w-px h-8"
          style={{ background: 'linear-gradient(to bottom, var(--text-muted), transparent)' }}
          animate={{ scaleY: [0.5, 1, 0.5], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}
