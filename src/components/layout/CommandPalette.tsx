import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setCommandPaletteOpen } from '@/lib/redux/slices/uiSlice';
import { setActiveProject } from '@/lib/redux/slices/projectSlice';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Folder, 
  CheckSquare, 
  Briefcase, 
  Plus, 
  RotateCcw, 
  RotateCw, 
  Keyboard, 
  Layout, 
  List, 
  Calendar, 
  Settings,
  Sparkles
} from 'lucide-react';
import { 
  setActiveViewMode, 
  setShortcutsModalOpen 
} from '@/lib/redux/slices/uiSlice';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { Modal } from '../ui/Modal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export const CommandPalette = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isOpen = useAppSelector((state) => state.ui.commandPaletteOpen);
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Data sources
  const workspaces = useAppSelector(state => Object.values(state.workspaces.entities));
  const projects = useAppSelector(state => Object.values(state.projects.entities));
  const tasks = useAppSelector(state => Object.values(state.tasks.entities));
  const activeProjectId = useAppSelector(state => state.projects.activeProjectId);

  useKeyboardShortcuts([
    {
      combo: { key: 'k', metaKey: true },
      callback: () => dispatch(setCommandPaletteOpen(true)),
    },
    {
      combo: { key: 'k', ctrlKey: true },
      callback: () => dispatch(setCommandPaletteOpen(true)),
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const handleClose = () => dispatch(setCommandPaletteOpen(false));

  const filteredProjects = projects.filter(p => p && p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  const filteredTasks = tasks.filter(t => t && t.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5);

  const navigateToProject = (workspaceId: string, projectId: string) => {
    dispatch(setActiveProject(projectId));
    navigate(`/w/${workspaceId}/p/${projectId}`);
    handleClose();
  };

  const quickActions = [
    {
      id: 'kanban',
      title: 'Switch to Board View',
      shortcut: '1',
      icon: <Layout size={16} className="text-blue-500" />,
      action: () => {
        dispatch(setActiveViewMode('kanban'));
        handleClose();
      }
    },
    {
      id: 'list',
      title: 'Switch to List View',
      shortcut: '2',
      icon: <List size={16} className="text-emerald-500" />,
      action: () => {
        dispatch(setActiveViewMode('list'));
        handleClose();
      }
    },
    {
      id: 'calendar',
      title: 'Switch to Calendar View',
      shortcut: '3',
      icon: <Calendar size={16} className="text-purple-500" />,
      action: () => {
        dispatch(setActiveViewMode('calendar'));
        handleClose();
      }
    },
    {
      id: 'shortcuts',
      title: 'Keyboard Shortcuts Cheat Sheet',
      shortcut: '?',
      icon: <Keyboard size={16} className="text-amber-500" />,
      action: () => {
        handleClose();
        setTimeout(() => dispatch(setShortcutsModalOpen(true)), 100);
      }
    },
    {
      id: 'undo',
      title: 'Undo Last Action',
      shortcut: '⌘Z',
      icon: <RotateCcw size={16} className="text-gray-400" />,
      disabled: !canUndo,
      action: () => {
        undo();
        handleClose();
      }
    },
    {
      id: 'redo',
      title: 'Redo Action',
      shortcut: '⌘⇧Z',
      icon: <RotateCw size={16} className="text-gray-400" />,
      disabled: !canRedo,
      action: () => {
        redo();
        handleClose();
      }
    }
  ];

  const filteredActions = quickActions.filter(a => 
    !query || a.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" className="overflow-hidden p-0 bg-transparent shadow-none">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col max-h-[80vh]">
        <div className="flex items-center px-4 border-b border-gray-100 dark:border-gray-800">
          <Search className="text-gray-400 mr-3" size={18} />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-none focus:ring-0 text-base py-3.5 text-gray-900 dark:text-white placeholder-gray-400"
            placeholder="Search tasks, projects, or commands (e.g. board, undo, shortcuts)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="text-[10px] text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">ESC</div>
        </div>

        <div className="overflow-y-auto p-2 divide-y divide-gray-100 dark:divide-gray-800/80">
          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div className="py-2">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1.5 flex items-center space-x-1">
                <Sparkles size={11} className="text-purple-500" />
                <span>Commands & Actions</span>
              </div>
              {filteredActions.map(act => (
                <button
                  key={act.id}
                  disabled={act.disabled}
                  onClick={act.action}
                  className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                  <div className="flex items-center space-x-3">
                    {act.icon}
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{act.title}</span>
                  </div>
                  {act.shortcut && (
                    <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 rounded border border-gray-200 dark:border-gray-700">
                      {act.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div className="py-2">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1.5">Projects</div>
              {filteredProjects.map(p => p && (
                <button 
                  key={p.id}
                  onClick={() => navigateToProject(p.workspaceId, p.id)}
                  className="w-full text-left px-3 py-2 rounded-xl flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors"
                >
                  <Folder size={15} className="text-blue-500" />
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{p.name}</span>
                </button>
              ))}
            </div>
          )}
          
          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div className="py-2">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1.5">Tasks</div>
              {filteredTasks.map(t => {
                if (!t) return null;
                const project = projects.find(p => p?.id === t.projectId);
                
                return (
                  <button 
                    key={t.id}
                    onClick={() => {
                      if (project) {
                        navigateToProject(project.workspaceId, project.id);
                      }
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors"
                  >
                    <CheckSquare size={15} className="text-emerald-500" />
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{t.title}</span>
                  </button>
                );
              })}
            </div>
          )}

          {query.length > 0 && filteredProjects.length === 0 && filteredTasks.length === 0 && filteredActions.length === 0 && (
            <div className="p-8 text-center text-xs text-gray-400">
              No results found for "{query}"
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
