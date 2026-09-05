import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckSquare, Square, Calendar, List, Kanban, ChevronRight, Circle, AlertCircle, Clock } from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

const MOCK_TASKS = [
  { id: 't1', title: 'Define MVP feature set', column: 'todo', priority: 'high', tag: 'Strategy', tagColor: 'bg-violet-100 text-violet-700', assignee: { initials: 'AA', color: '#6D5EF5' }, due: 'Sep 12' },
  { id: 't2', title: 'Design system components', column: 'inprogress', priority: 'high', tag: 'Design', tagColor: 'bg-pink-100 text-pink-700', assignee: { initials: 'BB', color: '#FF7A59' }, due: 'Sep 9' },
  { id: 't3', title: 'User research interviews', column: 'done', priority: 'high', tag: 'Research', tagColor: 'bg-amber-100 text-amber-700', assignee: { initials: 'CC', color: '#9D50FF' }, due: 'Sep 1' },
  { id: 't4', title: 'API integration spec', column: 'inprogress', priority: 'med', tag: 'Engineering', tagColor: 'bg-emerald-100 text-emerald-700', assignee: { initials: 'DV', color: '#10B981' }, due: 'Sep 18' },
  { id: 't5', title: 'Performance audit', column: 'todo', priority: 'low', tag: 'Engineering', tagColor: 'bg-emerald-100 text-emerald-700', assignee: { initials: 'AA', color: '#6D5EF5' }, due: 'Sep 22' },
  { id: 't6', title: 'Beta launch preparation', column: 'todo', priority: 'high', tag: 'Launch', tagColor: 'bg-rose-100 text-rose-700', assignee: { initials: 'BB', color: '#FF7A59' }, due: 'Sep 28' },
  { id: 't7', title: 'Write documentation', column: 'done', priority: 'med', tag: 'Docs', tagColor: 'bg-sky-100 text-sky-700', assignee: { initials: 'CC', color: '#9D50FF' }, due: 'Sep 3' },
];

const COLUMNS_META = [
  { id: 'todo', label: 'To Do', color: 'bg-gray-400' },
  { id: 'inprogress', label: 'In Progress', dotStyle: { background: 'var(--accent)' } as React.CSSProperties },
  { id: 'done', label: 'Done', color: 'bg-emerald-500' },
];

const PRIORITY_ICON = {
  high: <AlertCircle size={12} className="text-rose-500" />,
  med: <Clock size={12} className="text-amber-500" />,
  low: <Circle size={12} style={{ color: 'var(--text-muted)' }} />,
};

function TaskCard({ task }: { task: typeof MOCK_TASKS[0] }) {
  return (
    <motion.div
      className="rounded-xl p-3 transition-all cursor-pointer"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      whileHover={{ y: -1, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'var(--accent-glow)' }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium ${task.tagColor}`}>{task.tag}</span>
        <span>{PRIORITY_ICON[task.priority as keyof typeof PRIORITY_ICON]}</span>
      </div>
      <p className="text-xs font-semibold mb-2.5 leading-tight" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
      <div className="flex items-center justify-between">
        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: task.assignee.color }}>
          <span className="text-white font-bold" style={{ fontSize: 7 }}>{task.assignee.initials}</span>
        </div>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{task.due}</span>
      </div>
    </motion.div>
  );
}

function KanbanView() {
  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-2">
      {COLUMNS_META.map((col) => {
        const colTasks = MOCK_TASKS.filter(t => t.column === col.id);
        return (
          <div key={col.id} className="flex-shrink-0 w-56 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${col.color || ''}`}
                style={col.dotStyle}
              />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{col.label}</span>
              <span className="ml-auto text-xs rounded-full px-2 py-0.5" style={{ color: 'var(--text-muted)', background: 'var(--surface-raised)' }}>{colTasks.length}</span>
            </div>
            {colTasks.map(task => <TaskCard key={task.id} task={task} />)}
            <button className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
              + Add task
            </button>
          </div>
        );
      })}
    </div>
  );
}

function ListView() {
  const [checked, setChecked] = useState<Set<string>>(new Set(['t3', 't7']));
  return (
    <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border)' }}>
      {MOCK_TASKS.map(task => {
        const done = checked.has(task.id);
        return (
          <div key={task.id} className="flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors group cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
            <button
              onClick={() => setChecked(s => { const n = new Set(s); done ? n.delete(task.id) : n.add(task.id); return n; })}
              className="flex-shrink-0 transition-colors"
              style={{ color: done ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              {done ? <CheckSquare size={15} /> : <Square size={15} />}
            </button>
            <span className={`flex-1 text-xs font-medium ${done ? 'line-through' : ''}`} style={{ color: done ? 'var(--text-muted)' : 'var(--text-primary)' }}>{task.title}</span>
            <span className={`hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium ${task.tagColor}`}>{task.tag}</span>
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: task.assignee.color }}>
              <span className="text-white font-bold" style={{ fontSize: 7 }}>{task.assignee.initials}</span>
            </div>
            <span className="text-[10px] flex-shrink-0 hidden sm:block" style={{ color: 'var(--text-muted)' }}>{task.due}</span>
            <ChevronRight size={13} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }} />
          </div>
        );
      })}
    </div>
  );
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEK_TASKS: Record<number, typeof MOCK_TASKS[0][]> = { 1: [MOCK_TASKS[1]], 3: [MOCK_TASKS[3]], 4: [MOCK_TASKS[0]], 6: [MOCK_TASKS[5]] };

function CalendarView() {
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>September 2026</span>
        <div className="flex gap-1">
          {['‹', '›'].map(c => (
            <button key={c} className="w-6 h-6 rounded-md transition-colors text-xs flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>{c}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(d => <div key={d} className="text-center text-[10px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 flex-1">
        {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
          const tasks = WEEK_TASKS[day % 7] || [];
          const isToday = day === 6;
          return (
            <div
              key={day}
              className="rounded-lg p-1 min-h-[44px] cursor-pointer transition-colors"
              style={isToday ? { background: 'var(--accent-muted)', outline: '1px solid var(--accent)', outlineOffset: '-1px' } : {}}
            >
              <span
                className="text-[10px] font-semibold block text-center mb-0.5 w-5 h-5 rounded-full flex items-center justify-center mx-auto"
                style={isToday ? { background: 'var(--accent)', color: '#fff' } : { color: 'var(--text-secondary)' }}
              >
                {day}
              </span>
              {tasks.slice(0, 1).map((t, i) => (
                <div key={i} className={`text-[9px] font-medium px-1 py-0.5 rounded text-white truncate ${t.column === 'done' ? 'bg-emerald-500' : t.column === 'inprogress' ? '' : 'bg-gray-400'}`} style={t.column === 'inprogress' ? { background: 'var(--accent)' } : {}}>
                  {t.title.split(' ').slice(0, 2).join(' ')}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskDetailView() {
  const task = MOCK_TASKS[1];
  const [checked, setChecked] = useState([true, true, false, false, false]);
  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full overflow-auto">
      <div className="hidden lg:flex flex-col gap-1 w-44 flex-shrink-0 pr-4" style={{ borderRight: '1px solid var(--border)' }}>
        {MOCK_TASKS.slice(0, 5).map((t, i) => (
          <div key={t.id} className="px-2 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors" style={i === 1 ? { background: 'var(--accent-muted)', color: 'var(--accent-muted-fg)' } : { color: 'var(--text-secondary)' }}>
            {t.title}
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${task.tagColor}`}>{task.tag}</span>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>·</span>
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{task.due}</span>
          <span className="ml-auto flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: task.assignee.color }}>
              <span className="text-white font-bold" style={{ fontSize: 6 }}>{task.assignee.initials}</span>
            </div>
            Design system
          </span>
        </div>
        <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{task.title}</h3>
        <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
          Design and implement the full component library including buttons, inputs, cards, badges, and typography system. Ensure dark mode parity.
        </p>
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Subtasks ({checked.filter(Boolean).length}/{checked.length})</p>
          {['Button variants & states', 'Input & form components', 'Card component', 'Badge & tag system', 'Typography tokens'].map((sub, i) => (
            <div key={i} className="flex items-center gap-2.5 py-1.5 cursor-pointer group" onClick={() => setChecked(c => { const n = [...c]; n[i] = !n[i]; return n; })}>
              <div className="w-4 h-4 rounded-[4px] border-2 transition-all flex items-center justify-center flex-shrink-0" style={checked[i] ? { background: 'var(--accent)', borderColor: 'var(--accent)' } : { borderColor: 'var(--border)' }}>
                {checked[i] && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span className={`text-xs font-medium ${checked[i] ? 'line-through' : ''}`} style={{ color: checked[i] ? 'var(--text-muted)' : 'var(--text-primary)' }}>{sub}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-raised)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--accent)' }}
              initial={{ width: 0 }}
              animate={{ width: `${(checked.filter(Boolean).length / checked.length) * 100}%` }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </div>
          <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{Math.round((checked.filter(Boolean).length / checked.length) * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'kanban', label: 'Kanban', Icon: Kanban, View: KanbanView },
  { id: 'list', label: 'List', Icon: List, View: ListView },
  { id: 'calendar', label: 'Calendar', Icon: Calendar, View: CalendarView },
  { id: 'detail', label: 'Task Detail', Icon: CheckSquare, View: TaskDetailView },
];

export default function CapabilityShowcase() {
  const [active, setActive] = useState('kanban');
  const ActiveView = TABS.find(t => t.id === active)?.View || KanbanView;

  return (
    <section id="showcase" className="py-20 lg:py-28" style={{ background: 'var(--surface-raised)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: EASE }}
        >
          <p className="text-xs uppercase tracking-[0.18em] font-semibold mb-3" style={{ color: 'var(--accent)' }}>Live Product Demo</p>
          <h2 className="text-4xl sm:text-5xl font-black leading-[1.06] tracking-[-0.03em] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', system-ui", color: 'var(--text-primary)' }}>
            Every view. One workspace.
          </h2>
          <p className="text-lg max-w-xl mx-auto font-medium" style={{ color: 'var(--text-secondary)' }}>
            Switch between Kanban, List, Calendar, and Task Detail — all on the same data.
          </p>
        </motion.div>

        <motion.div
          className="rounded-2xl overflow-hidden shadow-xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.10)' }}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 mx-3 rounded-lg h-5 flex items-center px-2.5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Stellar Product Launch · Q3 2026</span>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex items-center px-3 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                id={`showcase-tab-${id}`}
                onClick={() => setActive(id)}
                className="relative flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors"
                style={{ color: active === id ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                <Icon size={13} />
                {label}
                {active === id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                    style={{ background: 'var(--accent)' }}
                    layoutId="active-tab-indicator"
                    transition={{ duration: 0.3, ease: EASE }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* View area */}
          <div className="p-4 min-h-[360px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 12, scale: 0.99 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -12, scale: 0.99 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="h-full"
              >
                <ActiveView />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
