import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, TrendingUp, AlertTriangle, Loader2, Bell, Download, Calendar } from 'lucide-react';
import { QuickActions } from './QuickActions';

type DateRange = '7d' | '30d' | '90d' | 'ytd';

export const Dashboard: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange>('30d');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('/api/analytics');
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error('Failed to load analytics', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 5000);

        // Listen for refresh events
        const handleRefresh = () => fetchAnalytics();
        window.addEventListener('hvac-refresh', handleRefresh);

        return () => {
            clearInterval(interval);
            window.removeEventListener('hvac-refresh', handleRefresh);
        };
    }, []);

    const exportToCSV = () => {
        if (!data?.revenue?.history) return;

        const headers = ['Period', 'One-Time Revenue', 'Recurring Revenue'];
        const rows = data.revenue.history.map((row: any) =>
            [row.name, row.oneTime, row.recurring].join(',')
        );
        const csv = [headers.join(','), ...rows].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hvac-analytics-${dateRange}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading || !data) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-6 space-y-8 overflow-y-auto">
            {/* 1. Header & Live Metrics Ticker */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Command Center</h1>
                    <p className="text-slate-400 text-sm">System Status: <span className="text-emerald-400">Operational</span></p>
                </div>

                {/* Condensed Metrics Bar */}
                <div className="flex space-x-2 md:space-x-6 bg-slate-900/50 p-3 rounded-lg border border-slate-800 backdrop-blur-sm">
                    <div className="flex items-center space-x-3 px-3 border-r border-slate-800">
                        <Activity className="text-blue-500 w-4 h-4" />
                        <div>
                            <div className="text-xs text-slate-500 uppercase">Utilization</div>
                            <div className="text-sm font-bold text-white">{data.utilization.rate}%</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 px-3 border-r border-slate-800">
                        <TrendingUp className="text-purple-500 w-4 h-4" />
                        <div>
                            <div className="text-xs text-slate-500 uppercase">Revenue</div>
                            <div className="text-sm font-bold text-white">${data.revenue.totalRecurring.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 px-3">
                        <AlertTriangle className={`${data.alerts.count > 0 ? 'text-amber-500' : 'text-slate-500'} w-4 h-4`} />
                        <div>
                            <div className="text-xs text-slate-500 uppercase">Alerts</div>
                            <div className="text-sm font-bold text-white">{data.alerts.count} Active</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Hero: Quick Actions Flowguide */}
            <section>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h2>
                <QuickActions />
            </section>

            {/* 3. Operational Pulse (Charts & Feed) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">

                {/* Left: Performance Chart */}
                <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col">
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                        <h3 className="font-bold text-white">Revenue Trajectory</h3>
                        <div className="flex items-center gap-2">
                            {/* Date Range Selector */}
                            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                                {(['7d', '30d', '90d', 'ytd'] as DateRange[]).map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setDateRange(range)}
                                        className={`px-3 py-1 text-xs font-medium rounded transition ${dateRange === range
                                                ? 'bg-purple-600 text-white'
                                                : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        {range.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            {/* Export Button */}
                            <button
                                onClick={exportToCSV}
                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition"
                                title="Export to CSV"
                            >
                                <Download className="w-3 h-3" />
                                <span className="hidden sm:inline">Export</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.revenue.history}>
                                <defs>
                                    <linearGradient id="colorRecurring" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="recurring"
                                    stroke="#a855f7"
                                    strokeWidth={3}
                                    fill="url(#colorRecurring)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Live Activity Feed */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-0 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center">
                            <Bell className="w-4 h-4 mr-2 text-indigo-400" /> Live Feed
                        </h3>
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px] lg:max-h-none">
                        {data.recentActivity && data.recentActivity.length > 0 ? (
                            data.recentActivity.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-3 group">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${item.status === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' :
                                            item.status === 'warning' ? 'bg-amber-500' :
                                                'bg-blue-500'
                                            }`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-300 leading-snug group-hover:text-white transition-colors">
                                            {item.message}
                                        </p>
                                        <span className="text-[10px] text-slate-500 font-mono uppercase">
                                            {item.timestamp}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-slate-500 py-8 text-sm">No recent activity</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
