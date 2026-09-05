import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1] as const;

// Fragmented "before" cards
const BEFORE_CARDS = [
  { label: 'Slack', color: 'bg-violet-500', icon: '💬', angle: -12, tx: -120, ty: -60 },
  { label: 'Jira', color: 'bg-blue-500', icon: '📋', angle: 8, tx: 80, ty: -80 },
  { label: 'Notion', color: 'bg-gray-700', icon: '📝', angle: -5, tx: -80, ty: 60 },
  { label: 'Sheets', color: 'bg-emerald-500', icon: '📊', angle: 15, tx: 120, ty: 40 },
  { label: 'Email', color: 'bg-rose-500', icon: '📧', angle: -8, tx: -40, ty: -100 },
  { label: 'Figma', color: 'bg-pink-500', icon: '🎨', angle: 6, tx: 60, ty: 80 },
];

function FragmentedCard({ label, color, icon, angle, tx, ty, progress }: {
  label: string; color: string; icon: string; angle: number; tx: number; ty: number; progress: any;
}) {
  const x = useTransform(progress, [0, 0.6], [tx, 0]);
  const y = useTransform(progress, [0, 0.6], [ty, 0]);
  const rotate = useTransform(progress, [0, 0.6], [angle, 0]);
  const opacity = useTransform(progress, [0, 0.25, 0.55, 0.7], [0, 1, 1, 0]);
  const scale = useTransform(progress, [0, 0.3, 0.6], [0.7, 1, 0.9]);

  return (
    <motion.div
      className={`absolute flex flex-col items-center justify-center w-16 h-16 rounded-2xl ${color} shadow-lg cursor-default`}
      style={{ x, y, rotate, opacity, scale }}
    >
      <span className="text-2xl mb-0.5">{icon}</span>
      <span className="text-white text-[9px] font-bold">{label}</span>
    </motion.div>
  );
}

export default function ProblemReframe() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const unifiedOpacity = useTransform(scrollYProgress, [0.55, 0.75], [0, 1]);
  const unifiedScale = useTransform(scrollYProgress, [0.55, 0.75], [0.88, 1]);
  const unifiedY = useTransform(scrollYProgress, [0.55, 0.75], [24, 0]);

  const textY = useTransform(scrollYProgress, [0, 0.5], [30, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text */}
          <motion.div className="flex-1 max-w-lg" style={{ y: textY, opacity: textOpacity }}>
            <p className="text-xs uppercase tracking-[0.18em] font-semibold mb-3" style={{ color: 'var(--accent)' }}>
              The Problem
            </p>
            <h2 className="text-4xl sm:text-5xl font-black leading-[1.06] tracking-[-0.03em] mb-6" style={{ fontFamily: "'Plus Jakarta Sans', system-ui", color: 'var(--text-primary)' }}>
              Scattered tools.<br />
              <span style={{ color: 'var(--text-secondary)' }}>Scattered work.</span>
            </h2>
            <p className="text-lg leading-relaxed mb-6 font-medium" style={{ color: 'var(--text-secondary)' }}>
              Switching between Slack, Jira, Notion, and email isn't a workflow — it's chaos with extra steps. Your context disappears between tabs.
            </p>
            <div className="h-px w-12 mb-6" style={{ background: 'var(--accent)', opacity: 0.4 }} />
            <p className="text-lg leading-relaxed font-semibold" style={{ color: 'var(--text-primary)' }}>
              Workspace Manager replaces the chaos with a single source of truth — where your tasks, conversations, and timelines live together.
            </p>
          </motion.div>

          {/* Visual: fragmentation → unification */}
          <div className="flex-1 flex items-center justify-center relative h-[340px] sm:h-[400px] w-full max-w-[480px]">
            {/* Fragmented cards */}
            <div className="relative flex items-center justify-center w-full h-full">
              {BEFORE_CARDS.map((card) => (
                <FragmentedCard key={card.label} {...card} progress={scrollYProgress} />
              ))}

              {/* Unified "after" card */}
              <motion.div
                className="absolute z-10 w-64 rounded-2xl border shadow-2xl overflow-hidden"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', opacity: unifiedOpacity, scale: unifiedScale, y: unifiedY }}
              >
                {/* Header */}
                <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
                  <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                    <span className="text-white text-[9px] font-bold">W</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Workspace Manager</span>
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                {/* Mini task list */}
                {[
                  { title: 'Design tokens', status: 'done', color: 'bg-emerald-500' },
                  { title: 'API integration', status: 'in progress', color: 'bg-blue-500' },
                  { title: 'Launch prep', status: 'todo', color: 'bg-gray-400 dark:bg-gray-500' },
                  { title: 'User research', status: 'done', color: 'bg-emerald-500' },
                ].map((task, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.color}`} />
                    <span className={`text-xs font-medium flex-1 ${task.status === 'done' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                      {task.title}
                    </span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                      task.status === 'done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      task.status === 'in progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))}
                <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    {['bg-blue-500', 'bg-orange-500', 'bg-purple-500'].map((c, i) => (
                      <div key={i} className={`w-5 h-5 rounded-full ${c} border-2 border-white dark:border-gray-900`} />
                    ))}
                  </div>
                  <span className="text-[9px] text-gray-400 ml-1">3 collaborating</span>
                  <span className="ml-auto text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">● Live</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
