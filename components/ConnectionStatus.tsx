import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const ConnectionStatus: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastSync, setLastSync] = useState<Date>(new Date());

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            // Trigger a data refresh by dispatching a custom event
            window.dispatchEvent(new CustomEvent('hvac-refresh'));
            setLastSync(new Date());
        } finally {
            setTimeout(() => setIsRefreshing(false), 1000);
        }
    };

    if (!isOnline) {
        return (
            <div className="fixed bottom-4 left-4 z-50 bg-red-900/90 border border-red-700 text-red-200 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">Offline - Changes will sync when connected</span>
            </div>
        );
    }

    return (
        <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="fixed bottom-4 left-4 z-50 bg-slate-800/90 border border-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2 transition hover:border-slate-500 text-xs"
            title={`Last sync: ${lastSync.toLocaleTimeString()}`}
        >
            <Wifi className="w-3 h-3 text-emerald-400" />
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
        </button>
    );
};
