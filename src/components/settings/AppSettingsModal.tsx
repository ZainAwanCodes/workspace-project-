import React, { useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { toggleTheme } from '@/lib/redux/slices/uiSlice';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { clearState } from '@/lib/redux/middleware/persistenceMiddleware';
import { Download, Upload, Trash2, Moon, Sun, AlertCircle } from 'lucide-react';

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppSettingsModal = ({ isOpen, onClose }: AppSettingsModalProps) => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.ui.theme);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [importError, setImportError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
    <Modal isOpen={isOpen} onClose={onClose} title="App Settings" size="md">
      <div className="space-y-6">
        
        {/* Appearance */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Appearance</h3>
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Theme Preference</p>
              <p className="text-xs text-gray-500">Toggle between Light and Dark mode</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => dispatch(toggleTheme())}>
              {theme === 'dark' ? (
                <><Sun size={16} className="mr-2 text-yellow-500" /> Light Mode</>
              ) : (
                <><Moon size={16} className="mr-2 text-blue-500" /> Dark Mode</>
              )}
            </Button>
          </div>
        </div>

        {/* Data Management */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Data Management</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Export Data</p>
                <p className="text-xs text-gray-500">Download a JSON backup of your workspaces</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download size={16} className="mr-2" /> Export JSON
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Import Data</p>
                <p className="text-xs text-gray-500">Restore from a previous JSON backup</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleImportClick}>
                <Upload size={16} className="mr-2" /> Import JSON
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
              <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-200 dark:border-red-900/30">
                Error: {importError}
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border-t border-red-200 dark:border-red-900/30 pt-6 mt-6">
          <h3 className="text-sm font-semibold text-red-600 dark:text-red-500 flex items-center mb-3">
            <AlertCircle size={16} className="mr-2" />
            Danger Zone
          </h3>
          
          {!showResetConfirm ? (
            <div className="flex items-center justify-between p-3 rounded-lg border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-400">Reset All Data</p>
                <p className="text-xs text-red-600/80 dark:text-red-400/80">Wipe all workspaces, projects, and tasks</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => setShowResetConfirm(true)}>
                <Trash2 size={16} className="mr-2" /> Reset Data
              </Button>
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-100 dark:bg-red-900/20 space-y-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Are you absolutely sure? This will delete all local data and reload the app.
              </p>
              <div className="flex space-x-3">
                <Button variant="destructive" className="flex-1" onClick={clearState}>
                  Yes, wipe everything
                </Button>
                <Button variant="outline" className="flex-1 bg-white dark:bg-gray-900" onClick={() => setShowResetConfirm(false)}>
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
