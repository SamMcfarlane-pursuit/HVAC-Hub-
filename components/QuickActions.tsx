import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Map, Truck, Wrench, ArrowRight } from 'lucide-react';

export const QuickActions: React.FC = () => {
    const navigate = useNavigate();

    const actions = [
        {
            title: 'Start AI Triage',
            description: 'Diagnose issues with Gemini 2.0 Flash',
            icon: Activity,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10 hover:bg-purple-500/20',
            border: 'border-purple-500/30',
            path: '/triage'
        },
        {
            title: 'Dispatch Crew',
            description: 'Assign techs based on live traffic',
            icon: Map,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 hover:bg-blue-500/20',
            border: 'border-blue-500/30',
            path: '/routing'
        },
        {
            title: 'Restock Parts',
            description: 'Order from nearest supplier (AI)',
            icon: Truck,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
            border: 'border-emerald-500/30',
            path: '/supply'
        },
        {
            title: 'Find Equipment',
            description: 'Rent tools from the P2P network',
            icon: Wrench,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 hover:bg-amber-500/20',
            border: 'border-amber-500/30',
            path: '/assets'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action) => (
                <button
                    key={action.title}
                    onClick={() => navigate(action.path)}
                    className={`group relative p-6 rounded-xl border ${action.border} ${action.bg} transition-all duration-300 text-left`}
                >
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className={`w-5 h-5 ${action.color}`} />
                    </div>

                    <div className={`p-3 rounded-lg inline-block mb-4 bg-slate-900/50`}>
                        <action.icon className={`w-8 h-8 ${action.color}`} />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1 group-hover:translate-x-1 transition-transform">
                        {action.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                        {action.description}
                    </p>
                </button>
            ))}
        </div>
    );
};
