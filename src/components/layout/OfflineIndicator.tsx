import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

export const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    // Simulate network delay for reconciling offline changes
    setTimeout(() => {
      setIsSyncing(false);
      setLastSynced(new Date());
    }, 1500);
  };

  if (isOffline) {
    return (
      <Tooltip side="bottom" content="Changes saved locally. They will sync when you are back online.">
        <div className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 rounded-md border border-yellow-200 dark:border-yellow-900/50">
          <WifiOff size={14} />
          <span className="text-xs font-medium">Offline</span>
        </div>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Tooltip side="bottom" content={isSyncing ? 'Syncing changes...' : `All changes synced at ${lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
        >
          {isSyncing ? (
            <RefreshCw size={16} className="animate-spin text-blue-500" />
          ) : (
            <CheckCircle2 size={16} />
          )}
        </button>
      </Tooltip>
    </div>
  );
};

