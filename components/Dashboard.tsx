
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { Activity, CheckCircle, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';

const DATA_UTILIZATION = [
    { name: 'Mon', value: 75 },
    { name: 'Tue', value: 82 },
    { name: 'Wed', value: 88 },
    { name: 'Thu', value: 85 },
    { name: 'Fri', value: 92 },
];

const DATA_REVENUE_MIX = [
    { name: 'Jan', oneTime: 4000, recurring: 1200 },
    { name: 'Feb', oneTime: 3500, recurring: 1500 },
    { name: 'Mar', oneTime: 4200, recurring: 2100 },
    { name: 'Apr', oneTime: 4800, recurring: 2800 },
];

export const Dashboard: React.FC = () => {
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
                    <div className="text-2xl font-bold text-white">85.4%</div>
                    <div className="text-xs text-emerald-400 mt-1">Target: {'>'}85% (Met)</div>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm font-medium">Gross Margin</span>
                        <DollarSign className="text-emerald-500 w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-white">48.2%</div>
                    <div className="text-xs text-emerald-400 mt-1">Goal: 50% (Optimization Active)</div>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm font-medium">Recurring Revenue</span>
                        <TrendingUp className="text-purple-500 w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-white">$12,450</div>
                    <div className="text-xs text-purple-400 mt-1">+15% MoM (NJ Memberships)</div>
                </div>

                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm font-medium">Active Alerts</span>
                        <AlertTriangle className="text-amber-500 w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-white">3</div>
                    <div className="text-xs text-amber-400 mt-1">2 Low Stock, 1 Delay</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Mix Chart (Focus on Recurring) */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4">Revenue Mix Strategy</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={DATA_REVENUE_MIX}>
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
                            <BarChart data={DATA_UTILIZATION}>
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
