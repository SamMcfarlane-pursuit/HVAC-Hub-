import React from 'react';
import { PlugZap, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface Integration {
    name: string;
    status: 'connected' | 'disconnected' | 'pending';
    lastSync?: string;
}

const integrations: Integration[] = [
    { name: 'ServiceTitan', status: 'disconnected' },
    { name: 'Watsco Inventory', status: 'disconnected' },
    { name: 'Google Maps', status: 'connected', lastSync: 'Active' },
    { name: 'Stripe Payments', status: 'connected', lastSync: 'Active' },
];

export const IntegrationStatus: React.FC = () => {
    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center">
                    <PlugZap className="w-4 h-4 mr-2 text-indigo-400" />
                    Integrations
                </h3>
                <button className="text-slate-400 hover:text-white p-1 rounded transition">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-2">
                {integrations.map((integration) => (
                    <div
                        key={integration.name}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-900/50 border border-slate-700/50"
                    >
                        <div className="flex items-center gap-2">
                            {integration.status === 'connected' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : integration.status === 'pending' ? (
                                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-slate-500" />
                            )}
                            <span className="text-sm text-slate-300">{integration.name}</span>
                        </div>
                        <span className={`text-xs font-medium ${integration.status === 'connected' ? 'text-emerald-400' :
                                integration.status === 'pending' ? 'text-amber-400' :
                                    'text-slate-500'
                            }`}>
                            {integration.status === 'connected' ? 'Live' :
                                integration.status === 'pending' ? 'Syncing...' : 'Configure'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
