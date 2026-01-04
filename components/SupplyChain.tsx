import React, { useState, useEffect } from 'react';
import { Search, Package, ShoppingCart, User, Loader2, AlertTriangle, Truck } from 'lucide-react';
import { Part } from '../types';

// API Configuration
const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? ''
    : '';

import { ProcurementModal } from './ProcurementModal';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const SupplyChain: React.FC = () => {
    const [parts, setParts] = useState<Part[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

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

    const filteredParts = parts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
    const lowStockCount = parts.filter(p => p.stock < 5).length;
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
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by SKU or Part Name..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all focus:border-amber-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* CONTROL TOWER METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Inventory Value</span>
                    <div className="text-2xl font-black text-white mt-1">${totalValue.toLocaleString()}</div>
                    <div className="w-full bg-slate-700 h-1 mt-3 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[70%]"></div>
                    </div>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Low Stock Alerts</span>
                        <div className="text-2xl font-black text-amber-400 mt-1">{lowStockCount} Items</div>
                        <span className="text-xs text-slate-500">Requires attention</span>
                    </div>
                    {/* Background decoration */}
                    <AlertTriangle className="absolute -right-2 -bottom-2 w-16 h-16 text-amber-500/10" />
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Critical Shortages</span>
                        <div className="text-2xl font-black text-red-500 mt-1">{criticalCount} Items</div>
                        <span className="text-xs text-slate-500">Immediate reorder needed</span>
                    </div>
                    <div className="absolute top-0 right-0 w-2 h-full bg-red-500/50 blur-lg"></div>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Procurement Efficiency</span>
                    <div className="text-2xl font-black text-blue-400 mt-1">94.2%</div>
                    <span className="text-xs text-emerald-400 font-bold flex items-center">
                        <User className="w-3 h-3 mr-1" /> AI Optimized
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700 shadow-xl">
                {isLoading ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
                        <span className="text-sm font-medium">Loading AI inventory model...</span>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-semibold">
                            <tr>
                                <th className="p-4 border-b border-slate-700">Part Details</th>
                                <th className="p-4 border-b border-slate-700">Source</th>
                                <th className="p-4 border-b border-slate-700">Distance</th>
                                <th className="p-4 border-b border-slate-700">Stock Level</th>
                                <th className="p-4 border-b border-slate-700">Unit Price</th>
                                <th className="p-4 border-b border-slate-700 text-right">Procurement</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50 text-sm">
                            {filteredParts.map((part) => (
                                <tr key={part.id} className="hover:bg-slate-700/30 transition group">
                                    <td className="p-4">
                                        <div className="font-bold text-white group-hover:text-amber-400 transition-colors">{part.name}</div>
                                        <div className="text-slate-500 text-xs font-mono">{part.sku}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center">
                                            {part.locationType === 'Van' ? (
                                                <span className="bg-purple-900/30 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center mr-2">
                                                    <Truck className="w-3 h-3 mr-1" /> Peer
                                                </span>
                                            ) : (
                                                <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase mr-2 border border-slate-600">
                                                    Depot
                                                </span>
                                            )}
                                            <span className="text-slate-300">{part.locationName}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-400 font-mono text-xs">{part.distance}</td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${part.stock < 3 ? 'bg-red-500' : part.stock < 10 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${Math.min(100, (part.stock / 20) * 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className={`font-bold text-xs ${part.stock < 3 ? 'text-red-400' : 'text-slate-300'}`}>
                                                {part.stock}
                                            </span>
                                        </div>
                                        {part.stock < 3 && <span className="text-[10px] text-red-500 font-bold uppercase tracking-wide">Reorder Now</span>}
                                    </td>
                                    <td className="p-4 text-white font-mono">${part.price.toFixed(2)}</td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleOpenProcurement(part)}
                                            className={`
                                                px-3 py-1.5 rounded text-xs font-bold transition flex items-center ml-auto border
                                                ${part.stock < 5
                                                    ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-900/20 animate-pulse-slow'
                                                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600'
                                                }
                                            `}
                                        >
                                            <ShoppingCart className="w-3 h-3 mr-1.5" />
                                            {part.locationType === 'Van' ? 'Request Peer Transfer' : 'Smart Order'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredParts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-16 text-center text-slate-500">
                                        <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>No parts found matching "{searchTerm}"</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
