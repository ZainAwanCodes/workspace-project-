import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { setShortcutsModalOpen } from '@/lib/redux/slices/uiSlice';
import { Keyboard, Command, Sparkles } from 'lucide-react';

interface ShortcutGroup {
  category: string;
  items: {
    keys: string[];
    description: string;
  }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    category: 'Navigation & Views',
    items: [
      { keys: ['1'], description: 'Switch to Kanban Board view' },
      { keys: ['2'], description: 'Switch to List view' },
      { keys: ['3'], description: 'Switch to Calendar view' },
      { keys: ['⌘', 'K'], description: 'Open Command Palette / Search' },
    ],
  },
  {
    category: 'Task Actions',
    items: [
      { keys: ['C'], description: 'Quickly create new task' },
      { keys: ['Ctrl', 'Z'], description: 'Undo last action (with restore)' },
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo previously undone action' },
      { keys: ['Ctrl', 'Enter'], description: 'Submit comment or form' },
      { keys: ['@'], description: 'Trigger teammate @mention autocomplete' },
    ],
  },
  {
    category: 'General & Dialogs',
    items: [
      { keys: ['?'], description: 'Open Keyboard Shortcuts cheat sheet' },
      { keys: ['Esc'], description: 'Close active modal, drawer, or dropdown' },
    ],
  },
];

export const KeyboardShortcutsModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(state => state.ui.shortcutsModalOpen);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => dispatch(setShortcutsModalOpen(false))}
      title="Keyboard Shortcuts Cheat Sheet"
      size="md"
    >
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
          <Sparkles size={15} className="text-blue-500 flex-shrink-0" />
          <span>Press these hotkeys anywhere in the app (when not typing in an input).</span>
        </div>

        {SHORTCUT_GROUPS.map((group) => (
          <div key={group.category} className="space-y-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {group.category}
            </h4>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800/80 bg-white dark:bg-gray-950 overflow-hidden">
              {group.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3.5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors text-xs"
                >
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {item.description}
                  </span>
                  <div className="flex items-center space-x-1">
                    {item.keys.map((k, kIdx) => (
                      <kbd
                        key={kIdx}
                        className="min-w-[22px] px-2 py-1 text-center text-[11px] font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-xs"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
