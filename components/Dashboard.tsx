import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';

const DATA_UTILIZATION = [
  { name: 'Mon', value: 75 },
  { name: 'Tue', value: 82 },
  { name: 'Wed', value: 88 },
  { name: 'Thu', value: 85 },
  { name: 'Fri', value: 92 },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
      <h1 className="text-3xl font-bold text-white">Operations Center</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm font-medium">Utilization Rate</span>
                <Activity className="text-blue-500 w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-white">85.4%</div>
            <div className="text-xs text-emerald-400 mt-1">↑ 2.4% vs last week</div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm font-medium">First-Time Fix</span>
                <CheckCircle className="text-emerald-500 w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-white">91.2%</div>
            <div className="text-xs text-emerald-400 mt-1">Target Met (>90%)</div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm font-medium">Marketplace Rev</span>
                <TrendingUp className="text-purple-500 w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-white">$4,250</div>
            <div className="text-xs text-slate-500 mt-1">Last 30 Days</div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm font-medium">Pending Alerts</span>
                <AlertTriangle className="text-amber-500 w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-white">3</div>
            <div className="text-xs text-amber-400 mt-1">2 Stock, 1 Delay</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Tech Utilization (Weekly)</h3>
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
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
             <h3 className="text-lg font-bold text-white mb-4">Live Feed</h3>
             <div className="space-y-4">
                <div className="flex items-start">
                    <div className="w-2 h-2 mt-2 bg-emerald-500 rounded-full mr-3"></div>
                    <div>
                        <p className="text-sm text-white">Job #J102 Completed</p>
                        <p className="text-xs text-slate-400">Sarah Chen • 12 mins ago</p>
                    </div>
                </div>
                <div className="flex items-start">
                    <div className="w-2 h-2 mt-2 bg-purple-500 rounded-full mr-3"></div>
                    <div>
                        <p className="text-sm text-white">Asset Rented: Portable Crane</p>
                        <p className="text-xs text-slate-400">By Heavy Lift Co • 45 mins ago</p>
                    </div>
                </div>
                <div className="flex items-start">
                    <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full mr-3"></div>
                    <div>
                        <p className="text-sm text-white">Part Transfer Requested</p>
                        <p className="text-xs text-slate-400">Alex requesting CAP-355 from Mike • 1h ago</p>
                    </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};
