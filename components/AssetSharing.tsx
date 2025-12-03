import React from 'react';
import { Wrench, ShieldCheck, Calendar, MapPin } from 'lucide-react';
import { MOCK_ASSETS } from '../constants';

export const AssetSharing: React.FC = () => {
  return (
    <div className="h-full flex flex-col p-6 space-y-6">
       <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
            <Wrench className="mr-2 text-indigo-400" /> Asset Sharing Network
            </h2>
            <p className="text-slate-400 text-sm">Rent high-CAPEX equipment from nearby contractors. Insurance included.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_ASSETS.map((asset) => (
                <div key={asset.id} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col group hover:border-indigo-500 transition duration-300">
                    <div className="relative h-48 bg-slate-900">
                        <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                        <div className="absolute top-2 right-2">
                             <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                                 asset.status === 'Available' ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-300'
                             }`}>
                                 {asset.status}
                             </span>
                        </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition">{asset.name}</h3>
                                <p className="text-xs text-slate-400 uppercase">{asset.category}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-white">${asset.dailyRate}</p>
                                <p className="text-xs text-slate-500">/day</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-slate-400">
                                <MapPin className="w-4 h-4 mr-2 text-slate-500" />
                                {asset.location}
                            </div>
                            <div className="flex items-center text-sm text-slate-400">
                                <User className="w-4 h-4 mr-2 text-slate-500" />
                                Owned by {asset.ownerName}
                            </div>
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-slate-700 flex justify-between items-center">
                            <div className="flex items-center text-emerald-400 text-xs">
                                <ShieldCheck className="w-4 h-4 mr-1" />
                                Insurance Included
                            </div>
                            <button 
                                disabled={asset.status !== 'Available'}
                                className={`px-4 py-2 rounded font-bold text-sm transition ${
                                    asset.status === 'Available' 
                                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                }`}
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

// Helper icon
const User = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
