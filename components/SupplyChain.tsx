import React, { useState, useEffect } from 'react';
import { Search, Package, ShoppingCart, User, Loader2, AlertTriangle, Truck, Filter, CheckCircle2, Siren } from 'lucide-react';
import { Part } from '../types';

// API Configuration
const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? ''
    : '';

import { ProcurementModal } from './ProcurementModal';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type FilterType = 'ALL' | 'CRITICAL' | 'LOW' | 'HEALTHY';

export const SupplyChain: React.FC = () => {
    const [parts, setParts] = useState<Part[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

    // Modal State
    const [selectedPartForOrder, setSelectedPartForOrder] = useState<Part | null>(null);
    const [isProcurementOpen, setIsProcurementOpen] = useState(false);

    // Fetch parts from API
    useEffect(() => {
        const fetchParts = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${API_BASE}/api/parts`);
                if (!response.ok) throw new Error('Failed to fetch parts');

                const data = await response.json();
                setParts(data);
            } catch (err) {
                console.error('Parts API Error:', err);
                // Fallback data
                setParts([
                    { id: "P101", name: "Run Capacitor 35+5", sku: "CAP-355-UNIV", category: "Electrical", price: 15.00, stock: 12, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" },
                    { id: "P102", name: "Contactor 2-Pole 30A", sku: "CTR-2P30", category: "Electrical", price: 22.50, stock: 2, locationType: "Van", locationName: "T001 (Alex)", distance: "0.8 mi" }, // Low stock example
                    { id: "P103", name: "R410A Refrigerant (25lb)", sku: "REF-410A", category: "Chemicals", price: 350.00, stock: 8, locationType: "Warehouse", locationName: "BK Terminal", distance: "6.1 mi" },
                    { id: "P104", name: "Universal Control Board", sku: "PCB-UNI-X", category: "Electronics", price: 120.00, stock: 1, locationType: "Warehouse", locationName: "Queens Hub", distance: "4.2 mi" }, // Critical
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchParts();
    }, []);

    const filteredParts = parts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        switch (activeFilter) {
            case 'CRITICAL': return p.stock < 3;
            case 'LOW': return p.stock >= 3 && p.stock < 5;
            case 'HEALTHY': return p.stock >= 5;
            default: return true;
        }
    });

    const handleOpenProcurement = (part: Part) => {
        setSelectedPartForOrder(part);
        setIsProcurementOpen(true);
    };

    const handleProcurementSuccess = async (quantity: number) => {
        if (!selectedPartForOrder) return;

        try {
            // Optimistic update
            const updatedParts = parts.map(p =>
                p.id === selectedPartForOrder.id
                    ? { ...p, stock: p.stock + quantity }
                    : p
            );
            setParts(updatedParts);

            // API Call
            await fetch(`${API_BASE}/api/parts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedPartForOrder.id, quantity })
            });

            setIsProcurementOpen(false);
            setSelectedPartForOrder(null);
        } catch (error) {
            console.error('Procurement failed:', error);
            // Revert would go here in a full app
        }
    };

    // Calculate Metrics
    const totalValue = parts.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const lowStockCount = parts.filter(p => p.stock < 5 && p.stock >= 3).length;
    const criticalCount = parts.filter(p => p.stock < 3).length;

    return (
        <div className="h-full flex flex-col p-6 space-y-6 relative overflow-y-auto">
            {/* PROCUREMENT MODAL */}
            <ProcurementModal
                isOpen={isProcurementOpen}
                onClose={() => setIsProcurementOpen(false)}
                part={selectedPartForOrder}
                onSuccess={handleProcurementSuccess}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <Package className="mr-2 text-amber-500" /> Supply Chain Control Tower
                    </h2>
                    <p className="text-slate-400 text-sm">AI-driven inventory optimization & predictive procurement.</p>
                </div>
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-amber-500 transition" />
                    <input
                        type="text"
                        placeholder="Search Manifest (SKU / Name)..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-amber-500/50 outline-none transition-all focus:border-amber-500 shadow-inner"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* CONTROL TOWER METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between shadow-lg">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Inventory Value</span>
                    <div className="text-2xl font-black text-white mt-1">${totalValue.toLocaleString()}</div>
                    <div className="w-full bg-slate-700 h-1 mt-3 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[70%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    </div>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between relative overflow-hidden shadow-lg group">
                    <div className="relative z-10">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Low Stock Alerts</span>
                        <div className="text-2xl font-black text-amber-400 mt-1">{lowStockCount} Items</div>
                        <span className="text-xs text-slate-500">Requires attention</span>
                    </div>
                    <AlertTriangle className="absolute -right-2 -bottom-2 w-16 h-16 text-amber-500/10 group-hover:text-amber-500/20 transition-all duration-500" />
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between relative overflow-hidden shadow-lg group">
                    <div className="relative z-10">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Critical Shortages</span>
                        <div className="text-2xl font-black text-red-500 mt-1">{criticalCount} Items</div>
                        <span className="text-xs text-slate-500">Immediate reorder needed</span>
                    </div>
                    <div className="absolute top-0 right-0 w-1 h-full bg-red-500/50 blur-lg animate-pulse"></div>
                    <Siren className="absolute -right-2 -bottom-2 w-16 h-16 text-red-500/10 group-hover:text-red-500/20 transition-all duration-500" />
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between shadow-lg">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Procurement Efficiency</span>
                    <div className="text-2xl font-black text-blue-400 mt-1">94.2%</div>
                    <span className="text-xs text-emerald-400 font-bold flex items-center">
                        <User className="w-3 h-3 mr-1" /> AI Optimized
                    </span>
                </div>
            </div>

            {/* DIGITAL MANIFEST GRID */}
            <div className="flex flex-col flex-1 min-h-0 bg-slate-800 rounded-lg border border-slate-700 shadow-xl overflow-hidden">
                {/* TOOLBAR */}
                <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase mr-2 flex items-center">
                        <Filter className="w-3 h-3 mr-1" /> Filter View:
                    </span>
                    {(['ALL', 'CRITICAL', 'LOW', 'HEALTHY'] as FilterType[]).map(type => (
                        <button
                            key={type}
                            onClick={() => setActiveFilter(type)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition border ${activeFilter === type
                                ? type === 'CRITICAL' ? 'bg-red-900/30 text-red-400 border-red-500'
                                    : type === 'LOW' ? 'bg-amber-900/30 text-amber-400 border-amber-500'
                                        : type === 'HEALTHY' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500'
                                            : 'bg-indigo-900/30 text-indigo-400 border-indigo-500'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* HEADER */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700 bg-slate-950/30 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:grid">
                    <div className="col-span-4">Component Identity</div>
                    <div className="col-span-2">Source Node</div>
                    <div className="col-span-3">Stock Levels</div>
                    <div className="col-span-1">Unit Cost</div>
                    <div className="col-span-2 text-right">Action Protocol</div>
                </div>

                {/* LIST */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
                            <span className="text-sm font-medium">Calibrating manifest data...</span>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700/50">
                            {filteredParts.length === 0 && (
                                <div className="p-16 text-center text-slate-500">
                                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>No components found matching criteria.</p>
                                </div>
                            )}

                            {filteredParts.map((part) => (
                                <div key={part.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 hover:bg-slate-700/30 transition group items-center relative">
                                    {/* CRITICAL INDICATOR STRIP */}
                                    {part.stock < 3 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 animate-pulse"></div>}

                                    {/* IDENTITY */}
                                    <div className="col-span-1 md:col-span-4">
                                        <div className="font-bold text-white group-hover:text-amber-400 transition-colors flex items-center">
                                            {part.name}
                                            {part.stock < 3 && <span className="ml-2 text-[10px] bg-red-900/50 text-red-400 border border-red-500/50 px-1.5 rounded animate-pulse">CRITICAL</span>}
                                        </div>
                                        <div className="text-slate-500 text-xs font-mono mt-0.5 flex items-center">
                                            {part.sku}
                                            <span className="mx-2 text-slate-700">•</span>
                                            <span className="text-slate-400">{part.category}</span>
                                        </div>
                                    </div>

                                    {/* SOURCE */}
                                    <div className="col-span-1 md:col-span-2">
                                        <div className="flex items-center">
                                            {part.locationType === 'Van' ? (
                                                <div className="flex items-center text-purple-300 bg-purple-900/20 px-2 py-1 rounded border border-purple-500/30">
                                                    <Truck className="w-3 h-3 mr-1.5" />
                                                    <div>
                                                        <div className="text-[10px] font-bold uppercase">Peer Asset</div>
                                                        <div className="text-[10px] opacity-70">{part.locationName}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-600">
                                                    <Package className="w-3 h-3 mr-1.5" />
                                                    <div>
                                                        <div className="text-[10px] font-bold uppercase">Depot</div>
                                                        <div className="text-[10px] opacity-70">{part.locationName}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* STOCK QUANTUM BAR */}
                                    <div className="col-span-1 md:col-span-3">
                                        <div className="flex items-center justify-between mb-1 text-xs">
                                            <span className="font-mono text-slate-400">{part.stock} Units</span>
                                            <span className={`font-bold ${part.stock < 3 ? 'text-red-400' : part.stock < 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                {part.stock < 3 ? 'CRITICAL' : part.stock < 10 ? 'LOW' : 'GOOD'}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700 relative">
                                            <div
                                                className={`h-full rounded-full relative overflow-hidden transition-all duration-1000 ${part.stock < 3 ? 'bg-red-500' : part.stock < 10 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min(100, (part.stock / 20) * 100)}%` }}
                                            >
                                                {/* GLOWER */}
                                                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PRICE */}
                                    <div className="col-span-1 md:col-span-1 text-white font-mono text-sm">
                                        ${part.price.toFixed(2)}
                                    </div>

                                    {/* ACTION */}
                                    <div className="col-span-1 md:col-span-2 text-right">
                                        {part.stock < 5 ? (
                                            <button
                                                onClick={() => handleOpenProcurement(part)}
                                                className="w-full md:w-auto px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center md:ml-auto bg-amber-600 hover:bg-amber-500 text-white border border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse-slow"
                                            >
                                                <ShoppingCart className="w-3 h-3 mr-1.5" />
                                                Smart Reorder
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleOpenProcurement(part)}
                                                className="w-full md:w-auto px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center md:ml-auto bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 hover:border-slate-500"
                                            >
                                                <ShoppingCart className="w-3 h-3 mr-1.5" />
                                                Procure
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
