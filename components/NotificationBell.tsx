import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Briefcase, AlertTriangle, CheckCircle2, Package } from 'lucide-react';

interface Notification {
    id: string;
    type: 'job' | 'alert';
    message: string;
    timestamp: string;
    status: 'success' | 'info' | 'warning' | 'critical';
}

export const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/orders?type=analytics');
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.recentActivity || []);
                }
            } catch (error) {
                console.error('Failed to fetch notifications', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();

        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => n.status === 'critical' || n.status === 'warning').length;

    const getIcon = (type: string, status: string) => {
        if (type === 'alert') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
        if (status === 'success') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
        return <Briefcase className="w-4 h-4 text-blue-400" />;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'critical': return 'border-l-red-500 bg-red-900/10';
            case 'warning': return 'border-l-amber-500 bg-amber-900/10';
            case 'success': return 'border-l-emerald-500 bg-emerald-900/10';
            default: return 'border-l-blue-500 bg-blue-900/10';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                        <span className="font-bold text-white text-sm">Notifications</span>
                        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-slate-500 text-sm">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                No notifications
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-700/50">
                                {notifications.map((n) => (
                                    <div key={n.id} className={`p-3 border-l-4 ${getStatusColor(n.status)} hover:bg-slate-700/30 transition`}>
                                        <div className="flex items-start space-x-3">
                                            <div className="mt-0.5">{getIcon(n.type, n.status)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-200 leading-snug">{n.message}</p>
                                                <p className="text-[10px] text-slate-500 mt-1">{n.timestamp}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-slate-700 text-center">
                        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                            View All Activity
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
