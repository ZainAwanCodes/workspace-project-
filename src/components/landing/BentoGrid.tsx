import React, { useRef, useState, useCallback, MouseEvent } from 'react';
import { motion } from 'motion/react';
import { Keyboard, Moon, Wifi, Zap, LayoutGrid, Users, Filter, CheckSquare } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

// ── Bento card data ───────────────────────────────────────────────────
const CARDS = [
  {
    id: 'kanban',
    span: 'col-span-2 row-span-1',
    Icon: LayoutGrid,
    accent: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    title: 'Kanban Boards',
    description: 'Drag tasks between columns. Visualize flow, spot blockers, ship faster.',
    preview: 'kanban',
  },
  {
    id: 'darkmode',
    span: 'col-span-1 row-span-1',
    Icon: Moon,
    accent: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/20',
    title: 'Dark Mode Done Right',
    description: 'First-class dark mode. Every pixel considered.',
    preview: 'darkmode',
  },
  {
    id: 'keyboard',
    span: 'col-span-1 row-span-1',
    Icon: Keyboard,
    accent: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    title: 'Keyboard-First',
    description: 'Launch anything with ⌘K. Navigate without the mouse.',
    preview: 'keyboard',
  },
  {
    id: 'filters',
    span: 'col-span-1 row-span-2',
    Icon: Filter,
    accent: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    title: 'Smart Filters',
    description: 'Slice your board by assignee, priority, tag, or date in seconds.',
    preview: 'filters',
  },
  {
    id: 'realtime',
    span: 'col-span-1 row-span-1',
    Icon: Wifi,
    accent: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-50 dark:bg-sky-950/20',
    title: 'Real-time Updates',
    description: "See teammates' edits instantly. No refresh needed.",
    preview: 'realtime',
  },
  {
    id: 'tasks',
    span: 'col-span-1 row-span-1',
    Icon: CheckSquare,
    accent: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/20',
    title: 'Rich Task Details',
    description: 'Subtasks, attachments, comments, priority — all in one panel.',
    preview: 'tasks',
  },
  {
    id: 'team',
    span: 'col-span-2 row-span-1',
    Icon: Users,
    accent: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    title: 'Team Collaboration',
    description: 'Roles, permissions, and a shared activity feed keep everyone aligned.',
    preview: 'team',
  },
  {
    id: 'fast',
    span: 'col-span-1 row-span-1',
    Icon: Zap,
    accent: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    title: 'Fast by Default',
    description: 'Instant load, optimistic updates, snappy everywhere.',
    preview: 'fast',
  },
];

// ── Tiny preview components per card ─────────────────────────────────
function KanbanPreview() {
  return (
    <div className="flex gap-2 mt-3 overflow-hidden">
      {[
        { label: 'To Do', tasks: ['Define scope', 'Performance'], color: 'bg-gray-300 dark:bg-gray-600' },
        { label: 'In Progress', tasks: ['Design tokens'], color: 'bg-blue-400' },
        { label: 'Done', tasks: ['Research', 'Branding'], color: 'bg-emerald-400' },
      ].map((col) => (
        <div key={col.label} className="flex-1 flex flex-col gap-1.5">
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${col.color}`} />
            <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-400">{col.label}</span>
          </div>
          {col.tasks.map((t) => (
            <div key={t} className="bg-white dark:bg-gray-800 rounded-md px-2 py-1.5 text-[10px] font-medium text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200/80 dark:border-gray-700/50">
              {t}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function DarkModePreview() {
  const [isDark, setIsDark] = useState(false);
  return (
    <div className="mt-3 cursor-pointer" onClick={() => setIsDark((d) => !d)}>
      <motion.div
        className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
        animate={{ backgroundColor: isDark ? '#111827' : '#ffffff' }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <div className="flex items-center gap-1 px-2 py-1.5" style={{ backgroundColor: isDark ? '#1f2937' : '#f9fafb' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[9px] ml-1 font-medium" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Hover to toggle</span>
        </div>
        <div className="px-3 py-2">
          <div className="h-2 w-24 rounded mb-1.5" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
          <div className="h-1.5 w-16 rounded" style={{ backgroundColor: isDark ? '#374151' : '#e5e7eb' }} />
        </div>
      </motion.div>
    </div>
  );
}

function KeyboardPreview() {
  return (
    <div className="mt-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-2 px-2.5 py-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700/50 shadow-sm">
        <span className="text-[10px] text-gray-400 flex-1">Search tasks, commands…</span>
        <div className="flex gap-1">
          <kbd className="text-[8px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md font-mono font-semibold border border-gray-200 dark:border-gray-600">⌘</kbd>
          <kbd className="text-[8px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md font-mono font-semibold border border-gray-200 dark:border-gray-600">K</kbd>
        </div>
      </div>
      {['New task', 'Switch workspace', 'Toggle dark mode'].map((cmd, i) => (
        <div key={cmd} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-medium`} style={i === 0 ? { background: 'var(--accent)', color: '#fff' } : { color: 'var(--text-secondary)' }}>
          <span>›</span>{cmd}
        </div>
      ))}
    </div>
  );
}

function FiltersPreview() {
  const [active, setActive] = useState<string[]>(['High']);
  const filters = ['High', 'Med', 'Alice', 'Design', 'This week'];
  return (
    <div className="mt-3 flex flex-col gap-2">
      <p className="text-[9px] text-gray-400 dark:text-gray-600 font-semibold uppercase tracking-wider">Filter by</p>
      <div className="flex flex-wrap gap-1.5">
        {filters.map((f) => {
          const on = active.includes(f);
          return (
            <button key={f} onClick={() => setActive((a) => on ? a.filter((x) => x !== f) : [...a, f])}
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all`}
              style={on ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--surface-raised)', color: 'var(--text-secondary)' }}>
              {f}
            </button>
          );
        })}
      </div>
      <div className="mt-1 flex flex-col gap-1">
        {['Design tokens', 'User research'].map((t) => (
          <div key={t} className="flex items-center gap-2 px-2 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700/50">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RealtimePreview() {
  return (
    <div className="mt-3 flex flex-col gap-1.5">
      {[
        { initials: 'AA', color: 'bg-blue-500', action: 'moved "API spec" to Done', time: 'just now' },
        { initials: 'BB', color: 'bg-orange-500', action: 'added 2 subtasks', time: '1m ago' },
        { initials: 'CC', color: 'bg-purple-500', action: 'commented on "Design"', time: '3m ago' },
      ].map((item, i) => (
        <motion.div
          key={i}
          className="flex items-center gap-2 text-[10px]"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15, duration: 0.4, ease: EASE }}
        >
          <div className={`w-5 h-5 rounded-full ${item.color} flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-bold" style={{ fontSize: 6 }}>{item.initials}</span>
          </div>
          <span className="text-gray-600 dark:text-gray-400 flex-1 leading-tight">{item.action}</span>
          <span className="text-gray-400 dark:text-gray-600">{item.time}</span>
        </motion.div>
      ))}
    </div>
  );
}

function TasksPreview() {
  const [checks, setChecks] = useState([true, true, false]);
  return (
    <div className="mt-3 flex flex-col gap-2">
      <p className="text-[9px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider">Subtasks · {checks.filter(Boolean).length}/{checks.length}</p>
      {['Design mockups', 'Write tests', 'Ship to staging'].map((sub, i) => (
        <div key={sub} className="flex items-center gap-2 cursor-pointer group" onClick={() => setChecks((c) => { const n = [...c]; n[i] = !n[i]; return n; })}>
          <div className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-all ${checks[i] ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'}`}>
            {checks[i] && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <span className={`text-[11px] font-medium transition-colors ${checks[i] ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>{sub}</span>
        </div>
      ))}
    </div>
  );
}

function TeamPreview() {
  const MEMBERS = [
    { initials: 'AA', color: 'bg-blue-500', name: 'Alice', role: 'Admin' },
    { initials: 'BB', color: 'bg-orange-500', name: 'Bob', role: 'Editor' },
    { initials: 'CC', color: 'bg-purple-500', name: 'Charlie', role: 'Viewer' },
    { initials: 'DV', color: 'bg-teal-500', name: 'Diana', role: 'Editor' },
  ];
  return (
    <div className="mt-3 flex items-center gap-4">
      <div className="flex -space-x-2">
        {MEMBERS.map((m) => (
          <div key={m.name} title={`${m.name} · ${m.role}`} className={`w-7 h-7 rounded-full ${m.color} border-2 border-white dark:border-gray-950 flex items-center justify-center cursor-pointer hover:scale-110 hover:z-10 transition-transform`}>
            <span className="text-white font-bold" style={{ fontSize: 8 }}>{m.initials}</span>
          </div>
        ))}
        <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-950 flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400 font-bold" style={{ fontSize: 8 }}>+5</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        {MEMBERS.slice(0, 2).map((m) => (
          <div key={m.name} className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">{m.name}</span>
            <span className="text-[9px] text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 rounded-full px-1.5 py-0.5">{m.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FastPreview() {
  return (
    <div className="mt-3 flex items-end gap-3">
      {[
        { label: 'Load', value: '48ms', bar: 0.15, color: 'bg-emerald-500' },
        { label: 'FCP', value: '0.6s', bar: 0.25, color: 'bg-blue-500' },
        { label: 'TTI', value: '0.9s', bar: 0.35, color: 'bg-violet-500' },
      ].map((stat) => (
        <div key={stat.label} className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-xs font-black text-gray-900 dark:text-white">{stat.value}</span>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-10 flex items-end overflow-hidden">
            <motion.div
              className={`w-full rounded-full ${stat.color}`}
              initial={{ height: 0 }}
              whileInView={{ height: `${stat.bar * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
            />
          </div>
          <span className="text-[9px] text-gray-400 dark:text-gray-600 font-semibold uppercase">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

const PREVIEWS: Record<string, React.FC> = {
  kanban: KanbanPreview,
  darkmode: DarkModePreview,
  keyboard: KeyboardPreview,
  filters: FiltersPreview,
  realtime: RealtimePreview,
  tasks: TasksPreview,
  team: TeamPreview,
  fast: FastPreview,
};

// ── Card component ────────────────────────────────────────────────────
function BentoCard({ card, index }: { card: typeof CARDS[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, opacity: 0 });

  const onMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSpotlight({ x, y, opacity: 1 });
  }, []);

  const onMouseLeave = useCallback(() => {
    setSpotlight((s) => ({ ...s, opacity: 0 }));
  }, []);

  const PreviewComponent = PREVIEWS[card.preview];

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${card.span} rounded-2xl p-5 overflow-hidden cursor-default group`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: EASE }}
      whileHover={{ y: -3, boxShadow: '0 12px 40px -8px rgba(0,0,0,0.10), 0 0 0 1px var(--border)' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Cursor spotlight */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 120px at ${spotlight.x}% ${spotlight.y}%, var(--accent-glow-soft), transparent 70%)`,
          opacity: spotlight.opacity,
        }}
      />

      {/* Icon */}
      <motion.div
        className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${card.bg} mb-3`}
        whileHover={{ scale: 1.12, rotate: -6 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      >
        <card.Icon size={17} className={card.accent} />
      </motion.div>

      <h3 className="text-sm font-bold mb-1 leading-tight" style={{ color: 'var(--text-primary)' }}>{card.title}</h3>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{card.description}</p>

      {/* Mini preview */}
      <div className="overflow-hidden">
        <PreviewComponent />
      </div>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────
export default function BentoGrid() {
  return (
    <section id="features" className="py-16 sm:py-24" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: EASE }}
        >
          <p className="text-xs uppercase tracking-[0.18em] font-semibold mb-3" style={{ color: 'var(--accent)' }}>Everything you need</p>
          <h2 className="text-4xl sm:text-5xl font-black leading-[1.06] tracking-[-0.03em]" style={{ fontFamily: "'Plus Jakarta Sans', system-ui", color: 'var(--text-primary)' }}>
            Built for how teams<br className="hidden sm:block" /> actually work.
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
          {CARDS.map((card, i) => (
            <div key={card.id} className={card.span}>
              <BentoCard card={{ ...card, span: 'col-span-1' }} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
