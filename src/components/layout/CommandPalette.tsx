import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setCommandPaletteOpen } from '@/lib/redux/slices/uiSlice';
import { setActiveProject } from '@/lib/redux/slices/projectSlice';
import { useNavigate } from 'react-router-dom';
import { Search, Folder, CheckSquare, Briefcase } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export const CommandPalette = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isOpen = useAppSelector((state) => state.ui.commandPaletteOpen);
  
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Data sources
  const workspaces = useAppSelector(state => Object.values(state.workspaces.entities));
  const projects = useAppSelector(state => Object.values(state.projects.entities));
  const tasks = useAppSelector(state => Object.values(state.tasks.entities));

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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" className="overflow-hidden p-0 bg-transparent shadow-none" >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col max-h-[80vh]">
        <div className="flex items-center px-4 border-b border-gray-100 dark:border-gray-800">
          <Search className="text-gray-400 mr-3" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-none focus:ring-0 text-lg py-4 text-gray-900 dark:text-white placeholder-gray-400"
            placeholder="Search tasks, projects, or commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="text-xs text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">ESC</div>
        </div>

        <div className="overflow-y-auto p-2">
          {query.length > 0 ? (
            <>
              {filteredProjects.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">Projects</div>
                  {filteredProjects.map(p => p && (
                    <button 
                      key={p.id}
                      onClick={() => navigateToProject(p.workspaceId, p.id)}
                      className="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Folder size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {filteredTasks.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">Tasks</div>
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
                        className="w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <CheckSquare size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{t.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredProjects.length === 0 && filteredTasks.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No results found for "{query}"
                </div>
              )}
            </>
          ) : (
            <div className="p-4 text-sm text-gray-500 text-center">
              Start typing to search across your workspace...
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
