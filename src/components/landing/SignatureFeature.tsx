import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1] as const;

// The 3 kanban columns in the cinematic demo
const DEMO_COLUMNS = [
  {
    id: 'todo',
    label: 'To Do',
    dotColor: 'bg-gray-400',
    headerBg: 'bg-gray-50 dark:bg-gray-900/60',
    tasks: [
      { title: 'Beta launch prep', tag: 'Launch', tagColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300', avatarColor: 'bg-orange-500', initials: 'BB' },
      { title: 'Performance audit', tag: 'Engineering', tagColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', avatarColor: 'bg-blue-500', initials: 'AA' },
    ],
  },
  {
    id: 'inprogress',
    label: 'In Progress',
    dotColor: 'bg-blue-500',
    headerBg: 'bg-blue-50/60 dark:bg-blue-950/20',
    tasks: [
      { title: 'API integration', tag: 'Engineering', tagColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', avatarColor: 'bg-teal-500', initials: 'DV' },
    ],
  },
  {
    id: 'done',
    label: 'Done',
    dotColor: 'bg-emerald-500',
    headerBg: 'bg-emerald-50/60 dark:bg-emerald-950/20',
    tasks: [
      { title: 'Design tokens', tag: 'Design', tagColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300', avatarColor: 'bg-purple-500', initials: 'CC' },
      { title: 'User research', tag: 'Research', tagColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', avatarColor: 'bg-blue-500', initials: 'AA' },
    ],
  },
];

// The card that drags across columns during scroll
const DRAGGING_CARD = {
  title: 'Design system components',
  tag: 'Design',
  tagColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  avatarColor: 'bg-purple-500',
  initials: 'CC',
};

export default function SignatureFeature() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  // Smooth spring for card motion
  const rawX = useTransform(scrollYProgress, [0.1, 0.75], [0, 1]);
  const springX = useSpring(rawX, { stiffness: 80, damping: 18 });

  // Card position: from "In Progress" column (center-ish) to "Done" column (right)
  // These translate values move the card across the board
  const cardX = useTransform(springX, [0, 1], ['0%', '105%']);
  const cardY = useTransform(springX, [0, 0.4, 1], [0, -18, 0]);
  const cardRotate = useTransform(springX, [0, 0.5, 1], [0, 3, 0]);
  const cardScale = useTransform(springX, [0, 0.15, 0.85, 1], [1, 1.05, 1.05, 1]);
  const cardShadow = useTransform(
    springX,
    [0, 0.2, 0.8, 1],
    [
      '0 2px 8px rgba(0,0,0,0.08)',
      '0 24px 48px rgba(37,99,235,0.25)',
      '0 24px 48px rgba(37,99,235,0.25)',
      '0 2px 8px rgba(0,0,0,0.08)',
    ]
  );

  // "Done" column glow appears when card lands
  const doneGlow = useTransform(springX, [0.7, 1], [0, 1]);

  // Label transitions
  const fromLabelOpacity = useTransform(springX, [0, 0.3], [1, 0]);
  const toLabelOpacity = useTransform(springX, [0.7, 1], [0, 1]);

  // Scroll progress label
  const progressPercent = useTransform(scrollYProgress, [0.1, 0.75], [0, 100]);

  return (
    // Responsive scrub scroll height
    <div ref={wrapperRef} className="relative h-[140vh] sm:h-[175vh]" id="signature-feature">
      {/* Sticky container */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col items-center justify-center" style={{ background: '#0D0B1A' }}>
        {/* Background texture */}
        <div className="absolute inset-0 landing-grain pointer-events-none" aria-hidden />
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[400px] rounded-full blur-3xl animate-glow-drift" style={{ background: 'rgba(109,94,245,0.10)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] rounded-full blur-3xl animate-glow-drift" style={{ background: 'rgba(157,80,255,0.07)', animationDelay: '3s', animationDirection: 'reverse' }} />
        </div>

        {/* Section header */}
        <motion.div
          className="relative z-10 text-center mb-10 px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <p className="text-xs uppercase tracking-[0.18em] font-semibold mb-3" style={{ color: 'var(--accent-bright)' }}>Signature Feature</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.06] tracking-[-0.03em] mb-3">
            Drag. Drop. Done.
          </h2>
          <p className="text-base text-gray-400 font-medium max-w-md mx-auto">
            Move tasks between columns with a single drag. Scroll to watch it happen.
          </p>
        </motion.div>

        {/* Kanban board mock */}
        <div className="relative z-10 w-full max-w-3xl px-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl shadow-black/60 overflow-hidden">
            {/* Board chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-gray-800">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <span className="text-xs text-gray-500 ml-2 font-mono">Stellar Product Launch · Kanban</span>
            </div>

            {/* Board columns */}
            <div className="p-4 grid grid-cols-3 gap-4 relative min-h-[280px]">
              {DEMO_COLUMNS.map((col, ci) => (
                <div key={col.id} className="flex flex-col gap-2">
                  {/* Column header */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{col.label}</span>
                    <span className="ml-auto text-[10px] text-gray-600 bg-gray-800 rounded-full px-1.5">{col.tasks.length + (ci === 1 ? 1 : 0)}</span>
                  </div>

                  {/* Done column glow */}
                  {ci === 2 && (
                    <motion.div
                      className="absolute inset-y-0 right-4 w-[calc(33%-8px)] bg-emerald-500/5 rounded-xl pointer-events-none border border-emerald-500/10"
                      style={{ opacity: doneGlow }}
                    />
                  )}

                  {/* Static tasks */}
                  {col.tasks.map((task, ti) => (
                    <div key={ti} className="bg-gray-800 rounded-xl border border-gray-700/60 p-2.5 select-none">
                      <div className="flex items-start justify-between mb-1.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium ${task.tagColor}`}>{task.tag}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-gray-200 mb-2 leading-tight">{task.title}</p>
                      <div className={`w-5 h-5 rounded-full ${task.avatarColor} flex items-center justify-center`}>
                        <span className="text-white font-bold" style={{ fontSize: 7 }}>{task.initials}</span>
                      </div>
                    </div>
                  ))}

                  {/* Placeholder slot in "In Progress" when card has left */}
                  {ci === 1 && (
                    <motion.div
                      className="rounded-xl border-2 border-dashed border-gray-700/50 p-2.5 min-h-[72px]"
                      style={{ opacity: rawX }}
                    />
                  )}

                  {/* Ghost card in "Done" when card arrives */}
                  {ci === 2 && (
                    <motion.div
                      className="bg-gray-800 rounded-xl border border-emerald-500/40 p-2.5 select-none"
                      style={{ opacity: doneGlow, scale: useTransform(springX, [0.7, 1], [0.95, 1]) }}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium ${DRAGGING_CARD.tagColor}`}>{DRAGGING_CARD.tag}</span>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="text-emerald-500 mt-0.5">
                          <circle cx="6" cy="6" r="5.5" stroke="currentColor"/>
                          <path d="M3.5 6L5.2 7.8L8.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="text-[11px] font-semibold text-gray-200 mb-2 leading-tight">{DRAGGING_CARD.title}</p>
                      <div className={`w-5 h-5 rounded-full ${DRAGGING_CARD.avatarColor} flex items-center justify-center`}>
                        <span className="text-white font-bold" style={{ fontSize: 7 }}>{DRAGGING_CARD.initials}</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}

              {/* The flying dragging card */}
              <motion.div
                className="absolute top-[44px] select-none pointer-events-none"
                style={{
                  left: 'calc(33.333% + 16px)',
                  width: 'calc(33.333% - 24px)',
                  x: cardX,
                  y: cardY,
                  rotate: cardRotate,
                  scale: cardScale,
                  boxShadow: cardShadow,
                  borderRadius: '12px',
                  zIndex: 20,
                  opacity: useTransform(springX, [0, 0.02, 0.98, 1], [0, 1, 1, 0]),
                }}
              >
                <div className="bg-gray-800 rounded-xl border-2 p-2.5 cursor-grabbing" style={{ borderColor: 'rgba(109,94,245,0.7)' }}>
                  <div className="flex items-start justify-between mb-1.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium ${DRAGGING_CARD.tagColor}`}>{DRAGGING_CARD.tag}</span>
                    <div className="flex flex-col gap-0.5 opacity-60">
                      <div className="flex gap-0.5">{[...Array(3)].map((_, i) => <div key={i} className="w-0.5 h-0.5 rounded-full bg-gray-400" />)}</div>
                      <div className="flex gap-0.5">{[...Array(3)].map((_, i) => <div key={i} className="w-0.5 h-0.5 rounded-full bg-gray-400" />)}</div>
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold text-gray-200 mb-2 leading-tight">{DRAGGING_CARD.title}</p>
                  <div className={`w-5 h-5 rounded-full ${DRAGGING_CARD.avatarColor} flex items-center justify-center`}>
                    <span className="text-white font-bold" style={{ fontSize: 7 }}>{DRAGGING_CARD.initials}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll progress label */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'var(--accent)', width: useTransform(scrollYProgress, [0, 1], ['0%', '100%']) }}
              />
            </div>
            <motion.span className="text-[11px] font-mono text-gray-600">
              Scroll to continue ↓
            </motion.span>
          </div>

          {/* Status labels */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <motion.span className="text-xs font-semibold text-gray-500" style={{ opacity: fromLabelOpacity }}>
              In Progress → dragging…
            </motion.span>
            <motion.span className="text-xs font-semibold text-emerald-400" style={{ opacity: toLabelOpacity }}>
              ✓ Moved to Done
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  );
}
