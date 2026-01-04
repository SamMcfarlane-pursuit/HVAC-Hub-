
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { Activity, CheckCircle, TrendingUp, AlertTriangle, DollarSign, Loader2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
        // Poll for updates every 5 seconds to show live changes
        const interval = setInterval(fetchAnalytics, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !data) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
            <h1 className="text-3xl font-bold text-white">Operations Center</h1>

            {/* KPI Cards aligned with Business Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm font-medium">Utilization Rate</span>
                        <Activity className="text-blue-500 w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-white">{data.utilization.rate}%</div>
                    <div className={`text-xs mt-1 ${parseFloat(data.utilization.rate) > 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        Target: {'>'}85% ({parseFloat(data.utilization.rate) > 85 ? 'Met' : 'Pending'})
                    </div>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm font-medium">Gross Margin</span>
                        <DollarSign className="text-emerald-500 w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-white">{data.margin.value}%</div>
                    <div className="text-xs text-emerald-400 mt-1">Goal: 50% (Optimization Active)</div>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm font-medium">Recurring Revenue</span>
                        <TrendingUp className="text-purple-500 w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-white">${data.revenue.totalRecurring.toLocaleString()}</div>
                    <div className="text-xs text-purple-400 mt-1">+15% MoM (NJ Memberships)</div>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm font-medium">Active Alerts</span>
                        <AlertTriangle className="text-amber-500 w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-white">{data.alerts.count}</div>
                    <div className="text-xs text-amber-400 mt-1">{data.alerts.details}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Mix Chart (Focus on Recurring) */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4">Revenue Mix Strategy</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.revenue.history}>
                                <defs>
                                    <linearGradient id="colorRecurring" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorOneTime" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                                <Area type="monotone" dataKey="oneTime" stackId="1" stroke="#3b82f6" fill="url(#colorOneTime)" name="One-Time (Install)" />
                                <Area type="monotone" dataKey="recurring" stackId="1" stroke="#a855f7" fill="url(#colorRecurring)" name="Recurring (Membership)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tech Utilization */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4">Tech Efficiency (Jobs/Day)</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.utilization.trend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                    cursor={{ fill: '#334155', opacity: 0.4 }}
                                />
                                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} name="Utilization %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
