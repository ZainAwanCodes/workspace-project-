import React, { useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { toggleTheme } from '@/lib/redux/slices/uiSlice';
import { updatePreferences } from '@/lib/redux/slices/notificationSlice';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { clearState } from '@/lib/redux/middleware/persistenceMiddleware';
import { 
  Download, 
  Upload, 
  Trash2, 
  Moon, 
  Sun, 
  AlertCircle, 
  Bell, 
  UserCheck, 
  AtSign, 
  Clock, 
  Radio, 
  Volume2 
} from 'lucide-react';

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppSettingsModal = ({ isOpen, onClose }: AppSettingsModalProps) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.ui.theme);
  const preferences = useAppSelector(state => state.notifications.preferences);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [importError, setImportError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleTogglePreference = (key: keyof typeof preferences) => {
    dispatch(updatePreferences({ [key]: !preferences[key] }));
  };

  const handleExport = () => {
    try {
      const state = localStorage.getItem('workspace_manager_state');
      if (!state) {
        alert('No data to export.');
        return;
      }
      
      const blob = new Blob([state], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workspace_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export data', e);
      alert('Failed to export data.');
    }
  };

  const handleImportClick = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        // Basic validation
        const parsed = JSON.parse(json);
        if (!parsed || !parsed.workspaces || !parsed.projects || !parsed.tasks) {
          throw new Error('Invalid backup file format');
        }
        
        localStorage.setItem('workspace_manager_state', json);
        window.location.reload();
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse JSON file.');
      }
    };
    reader.onerror = () => setImportError('Failed to read the file.');
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="App & System Settings" size="md">
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        
        {/* Appearance */}
        <div>
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">
            Appearance
          </h3>
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Theme Preference</p>
              <p className="text-xs text-gray-500">Toggle between Light and Dark visual modes</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => dispatch(toggleTheme())}>
              {theme === 'dark' ? (
                <><Sun size={15} className="mr-2 text-yellow-500" /> Light Mode</>
              ) : (
                <><Moon size={15} className="mr-2 text-blue-500" /> Dark Mode</>
              )}
            </Button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div>
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <Bell size={14} className="text-blue-500" />
            <span>Notification Preferences</span>
          </h3>
          <div className="space-y-2.5">
            {/* Task Assigned */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mt-0.5">
                  <UserCheck size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Task Assignments</p>
                  <p className="text-[11px] text-gray-500">Notify when a teammate assigns a task to you</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePreference('assigned')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  preferences.assigned ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    preferences.assigned ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Mentions */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mt-0.5">
                  <AtSign size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">@Mention Mentions</p>
                  <p className="text-[11px] text-gray-500">Notify when you are tagged with @name in a comment</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePreference('mentioned')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  preferences.mentioned ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    preferences.mentioned ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Due Soon */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mt-0.5">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Due Date Reminders</p>
                  <p className="text-[11px] text-gray-500">Alerts for tasks scheduled due within 24 hours</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePreference('due_soon')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  preferences.due_soon ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    preferences.due_soon ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Live Ticker Alerts */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <Radio size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Live Team Activity Alerts</p>
                  <p className="text-[11px] text-gray-500">Stream real-time team ticker updates in header</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePreference('activity_ticker_alerts')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  preferences.activity_ticker_alerts ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    preferences.activity_ticker_alerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div>
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">
            Data Management
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Export Backup</p>
                <p className="text-[11px] text-gray-500">Download a full JSON snapshot of workspaces & tasks</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download size={14} className="mr-1.5" /> Export JSON
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Restore Backup</p>
                <p className="text-[11px] text-gray-500">Import and restore state from a previously saved JSON file</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleImportClick}>
                <Upload size={14} className="mr-1.5" /> Import JSON
              </Button>
              <input 
                type="file" 
                accept="application/json" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileImport}
              />
            </div>
            
            {importError && (
              <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/10 p-2.5 rounded-lg border border-red-200 dark:border-red-900/30">
                Error: {importError}
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border-t border-red-200 dark:border-red-900/30 pt-5">
          <h3 className="text-xs font-semibold text-red-600 dark:text-red-500 flex items-center mb-3">
            <AlertCircle size={14} className="mr-1.5" />
            Danger Zone
          </h3>
          
          {!showResetConfirm ? (
            <div className="flex items-center justify-between p-3 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
              <div>
                <p className="text-xs font-semibold text-red-800 dark:text-red-400">Reset All Data</p>
                <p className="text-[11px] text-red-600/80 dark:text-red-400/80">Wipe all workspaces, projects, and tasks to defaults</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => setShowResetConfirm(true)}>
                <Trash2 size={14} className="mr-1.5" /> Reset Data
              </Button>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-800 bg-red-100 dark:bg-red-900/20 space-y-2.5">
              <p className="text-xs font-medium text-red-800 dark:text-red-300">
                Are you absolutely sure? This will delete all local data and reload the app.
              </p>
              <div className="flex space-x-2">
                <Button variant="destructive" size="sm" className="flex-1" onClick={clearState}>
                  Yes, wipe everything
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-white dark:bg-gray-900" onClick={() => setShowResetConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
